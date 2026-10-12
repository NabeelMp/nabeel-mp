import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PageShell from '../components/PageShell'
import ReviewForm from '../components/ReviewForm'
import Stars from '../components/Stars'
import { useSite } from '../lib/site'
import { getWork, listReviews, listWorks } from '../lib/api'
import type { Review, Work } from '../lib/types'
import NotFound from './NotFound'

function Video({ url }: { url: string }) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  const src = yt ? `https://www.youtube.com/embed/${yt[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null
  return (
    <div className="aspect-video overflow-hidden rounded-[24px] bg-coal">
      {src ? (
        <iframe src={src} title="Project video" className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <video src={url} controls playsInline className="h-full w-full object-cover" />
      )}
    </div>
  )
}

export default function WorkPage() {
  const { site } = useSite()
  const { category = '', slug = '' } = useParams()
  const cat = site.categories.find((c) => c.key === category)
  const [work, setWork] = useState<Work | null | undefined>(undefined)
  const [siblings, setSiblings] = useState<Work[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setWork(undefined)
    getWork(category, slug).then(setWork).catch(() => setWork(null))
    if (cat) listWorks(cat.key).then(setSiblings).catch(() => setSiblings([]))
  }, [category, slug, cat])

  useEffect(() => {
    if (work) listReviews({ workId: work.id }).then(setReviews).catch(() => setReviews([]))
  }, [work])

  if (!cat || work === null) return <NotFound />
  if (work === undefined)
    return (
      <PageShell>
        <div className="container-x">
          <div className="h-[60vh] animate-pulse rounded-[28px] bg-coal" />
        </div>
      </PageShell>
    )

  const i = siblings.findIndex((w) => w.id === work.id)
  const prev = siblings.length > 1 ? siblings[(i - 1 + siblings.length) % siblings.length] : null
  const next = siblings.length > 1 ? siblings[(i + 1) % siblings.length] : null
  const gallery = work.gallery.filter((g) => g && g !== work.cover_url)
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <PageShell>
      <article className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/projects/${cat.key}`} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/50 hover:text-ember">
            <ArrowLeft size={14} /> {cat.title}
          </Link>
          {siblings.length > 1 && (
            <span className="text-[11px] uppercase tracking-[0.3em] text-bone/40">
              {String(i + 1).padStart(2, '0')} / {String(siblings.length).padStart(2, '0')}
            </span>
          )}
        </div>

        <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <h1 className="overflow-hidden font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.85]">
            <motion.span className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              {work.title}
            </motion.span>
          </h1>
          <dl className="grid grid-cols-3 gap-4 border-t border-bone/10 pt-4 text-sm">
            {[
              ['Client', work.client],
              ['Year', work.year],
              ['Discipline', cat.title],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-[0.3em] text-bone/40">{k}</dt>
                <dd className="mt-1 font-semibold">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </header>

        {work.cover_url && (
          <motion.div
            initial={{ clipPath: 'inset(20% 10% 20% 10% round 28px)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 28px)', opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-10 overflow-hidden rounded-[28px]"
          >
            <img src={work.cover_url} alt={work.title} className="max-h-[80vh] w-full object-cover" />
          </motion.div>
        )}

        <section className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <p className="eyebrow">The story</p>
            {work.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {work.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-bone/75">
            {work.summary && <p className="text-2xl font-medium leading-snug text-bone">{work.summary}</p>}
            {work.description?.split(/\n{2,}/).map((p, k) => <p key={k}>{p}</p>)}
          </div>
        </section>

        {work.video_url && (
          <div className="mt-14">
            <Video url={work.video_url} />
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-14 columns-1 gap-5 sm:columns-2">
            {gallery.map((src, k) => (
              <motion.img
                key={src + k}
                src={src}
                alt=""
                loading="lazy"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="mb-5 w-full break-inside-avoid rounded-[24px]"
              />
            ))}
          </div>
        )}

        <section className="mt-20 border-t border-bone/10 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Viewer opinions</p>
              <h2 className="mt-3 font-display text-5xl sm:text-6xl">Reviews ({reviews.length})</h2>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <Stars value={Math.round(avg)} />
                <span className="text-sm text-bone/55">{avg.toFixed(1)} average</span>
              </div>
            )}
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ReviewForm workId={work.id} onAdded={(r) => setReviews((rs) => [r, ...rs])} />
            <ul className="grid content-start gap-4">
              {reviews.length === 0 && <li className="card p-6 text-bone/50">No reviews yet — be the first.</li>}
              {reviews.map((r) => (
                <motion.li key={r.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      {r.position && <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">{r.position}</p>}
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-bone/75">{r.message}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {prev && next && (
          <nav className="mt-20 grid grid-cols-2 gap-4 border-t border-bone/10 pt-8">
            <Link to={`/projects/${cat.key}/${prev.slug}`} className="group">
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-bone/45">
                <ArrowLeft size={14} /> Previous work
              </span>
              <span className="mt-2 block font-display text-3xl transition-colors group-hover:text-ember sm:text-5xl">{prev.title}</span>
            </Link>
            <Link to={`/projects/${cat.key}/${next.slug}`} className="group text-right">
              <span className="flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.3em] text-bone/45">
                Next work <ArrowRight size={14} />
              </span>
              <span className="mt-2 block font-display text-3xl transition-colors group-hover:text-ember sm:text-5xl">{next.title}</span>
            </Link>
          </nav>
        )}
      </article>
    </PageShell>
  )
}
