import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import PageShell from '../components/PageShell'
import { categories, categoryByKey } from '../lib/data'
import { listWorks } from '../lib/api'
import type { Work } from '../lib/types'
import NotFound from './NotFound'

export default function CategoryPage() {
  const { category } = useParams()
  const cat = categoryByKey(category)
  const [works, setWorks] = useState<Work[] | null>(null)

  useEffect(() => {
    if (!cat) return
    setWorks(null)
    listWorks(cat.key).then(setWorks).catch(() => setWorks([]))
  }, [cat])

  if (!cat) return <NotFound />
  const idx = categories.findIndex((c) => c.key === cat.key)
  const prev = categories[(idx - 1 + categories.length) % categories.length]
  const next = categories[(idx + 1) % categories.length]

  return (
    <PageShell>
      <div className="container-x">
        <Link to="/#projects" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/50 hover:text-ember">
          <ArrowLeft size={14} /> All projects
        </Link>

        <header className="mt-8 grid gap-6 border-b border-bone/10 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl" style={{ color: cat.accent }}>
              {cat.index} / 06
            </motion.p>
            <h1 className="mt-2 overflow-hidden font-display text-[clamp(4rem,14vw,12rem)] leading-[0.85]">
              <motion.span className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                {cat.title}
              </motion.span>
            </h1>
          </div>
          <p className="max-w-xs text-[15px] text-bone/55">{cat.blurb}</p>
        </header>

        {works === null ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[24px] bg-coal" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="mt-16 rounded-[28px] border border-dashed border-bone/15 p-16 text-center">
            <p className="font-hand text-3xl text-bone/60">Fresh work is on the way.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={`/projects/${cat.key}/${w.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-coal">
                    {w.cover_url && (
                      <img src={w.cover_url} alt={w.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    )}
                    <span className="absolute right-4 top-4 grid h-11 w-11 scale-0 place-items-center rounded-full bg-bone text-ink transition-transform duration-300 group-hover:scale-100">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-3xl leading-none transition-colors group-hover:text-ember">{w.title}</h2>
                      {w.client && <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-bone/45">{w.client}</p>}
                    </div>
                    {w.year && <span className="text-sm text-bone/40">{w.year}</span>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <nav className="mt-20 grid grid-cols-2 gap-4 border-t border-bone/10 pt-8">
          <Link to={`/projects/${prev.key}`} className="group">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-bone/45">
              <ArrowLeft size={14} /> Previous
            </span>
            <span className="mt-2 block font-display text-3xl transition-colors group-hover:text-ember sm:text-5xl">{prev.title}</span>
          </Link>
          <Link to={`/projects/${next.key}`} className="group text-right">
            <span className="flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.3em] text-bone/45">
              Next <ArrowRight size={14} />
            </span>
            <span className="mt-2 block font-display text-3xl transition-colors group-hover:text-ember sm:text-5xl">{next.title}</span>
          </Link>
        </nav>
      </div>
    </PageShell>
  )
}
