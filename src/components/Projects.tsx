import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { categories } from '../lib/data'
import { listWorks } from '../lib/api'
import type { Category, Work } from '../lib/types'
import { Reveal, SplitWords } from './Reveal'

function Tile({ c, works, i }: { c: Category; works: Work[]; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 })
  const [hover, setHover] = useState(false)
  const covers = works.map((w) => w.cover_url).filter(Boolean).slice(0, 3) as string[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, rotate: i % 2 ? 4 : -4 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="[perspective:1000px]"
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }}>
        <Link
          ref={ref}
          to={`/projects/${c.key}`}
          onPointerMove={(e) => {
            const r = ref.current!.getBoundingClientRect()
            mx.set((e.clientX - r.left) / r.width)
            my.set((e.clientY - r.top) / r.height)
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => {
            setHover(false)
            mx.set(0.5)
            my.set(0.5)
          }}
          className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[28px] border border-bone/10 bg-coal p-6 sm:aspect-[5/6] sm:p-7"
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 50% 120%, ${c.accent}55, transparent 60%)` }}
            animate={{ opacity: hover ? 1 : 0.35 }}
          />
          <div className="relative flex items-start justify-between">
            <span className="font-display text-2xl" style={{ color: c.accent }}>
              {c.index}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-bone/40">{works.length} works</span>
          </div>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            {covers.map((src, k) => (
              <motion.img
                key={src + k}
                src={src}
                alt=""
                className="absolute w-[46%] rounded-xl object-cover shadow-2xl"
                style={{ aspectRatio: '4/5' }}
                initial={false}
                animate={
                  hover
                    ? { opacity: 1, x: (k - 1) * 70, y: -10 + Math.abs(k - 1) * 18, rotate: (k - 1) * 12, scale: 1 }
                    : { opacity: 0.6, x: (k - 1) * 22, y: -20, rotate: (k - 1) * 5, scale: 0.82 }
                }
                transition={{ type: 'spring', stiffness: 220, damping: 20, delay: k * 0.04 }}
              />
            ))}
            {covers.length === 0 && (
              <motion.span animate={{ opacity: hover ? 1 : 0.4, scale: hover ? 1 : 0.9 }} className="font-hand text-2xl text-bone/50">
                coming soon
              </motion.span>
            )}
          </div>

          <div className="relative">
            <motion.h3 animate={{ y: hover ? -6 : 0 }} className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.9]">
              {c.title}
            </motion.h3>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="max-w-[80%] text-[13px] leading-snug text-bone/55">{c.blurb}</p>
              <motion.span
                animate={{ rotate: hover ? 45 : 0, backgroundColor: hover ? c.accent : 'rgba(242,239,233,0)' }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/20 text-bone group-hover:text-ink"
              >
                <ArrowUpRight size={18} />
              </motion.span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [works, setWorks] = useState<Work[]>([])
  useEffect(() => {
    listWorks().then(setWorks).catch(console.error)
  }, [])

  return (
    <section id="projects" className="relative bg-ink py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Projects · 03</p>
            </Reveal>
            <h2 className="h-section mt-4">
              <SplitWords text="Selected" />
              <br />
              <SplitWords text="works." className="text-ember" delay={0.1} />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-[15px] text-bone/55">
              Six disciplines, one obsession with detail. Pick a door — every work has its own story page.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Tile key={c.key} c={c} i={i} works={works.filter((w) => w.category === c.key)} />
          ))}
        </div>
      </div>
    </section>
  )
}
