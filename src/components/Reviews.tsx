import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { listReviews } from '../lib/api'
import { useSite } from '../lib/site'
import type { Review } from '../lib/types'
import Stars from './Stars'
import { Reveal, SplitWords } from './Reveal'

function Card({ r }: { r: Review }) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col justify-between rounded-[24px] border border-bone/10 bg-coal p-6 transition-colors hover:border-ember/50 sm:w-[380px] sm:p-7">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-display text-5xl leading-none text-ember">“</span>
          <Stars value={r.rating} size={14} />
        </div>
        <blockquote className="mt-3 text-[15px] leading-relaxed text-bone/80">{r.message}</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-bone/10 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-bone font-display text-xl text-ink">{r.name.charAt(0)}</span>
        <span>
          <span className="block text-sm font-semibold">{r.name}</span>
          {r.position && <span className="block text-[10px] uppercase tracking-[0.2em] text-bone/45">{r.position}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

export default function Reviews() {
  const { site } = useSite()
  const copy = site.content.reviews
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => {
    listReviews({ fiveStarOnly: true }).then(setReviews).catch(console.error)
  }, [])
  if (reviews.length === 0) return null
  const loop = reviews.length < 4 ? [...reviews, ...reviews, ...reviews] : reviews
  const duration = Math.max(30, loop.length * 7)

  return (
    <section id="reviews" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div className="container-x flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal>
            <p className="eyebrow">{copy.eyebrow}</p>
          </Reveal>
          <h2 className="h-section mt-4">
            <SplitWords text={copy.title} />
            <br />
            <SplitWords text={copy.titleAccent} className="text-ember" delay={0.1} />
          </h2>
        </div>
        <Reveal delay={0.2} className="flex items-center gap-3">
          <Stars value={5} />
        </Reveal>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 120 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ amount: 0.2 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="mask-fade-x group mt-14 flex overflow-hidden"
      >
        <div
          className="flex w-max animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]"
          style={{ ['--marquee-duration' as string]: `${duration}s` }}
        >
          {[...loop, ...loop].map((r, i) => (
            <Card key={`${r.id}-${i}`} r={r} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
