import { useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { process, services } from '../lib/data'
import { Reveal } from './Reveal'

export default function WhatIDo() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const titleX = useTransform(scrollYProgress, [0, 1], ['18%', '-28%'])
  const fade = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.94, 1, 1, 0.94])
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="what-i-do" ref={ref} className="relative overflow-hidden bg-bone py-24 text-ink sm:py-32">
      <motion.div style={{ opacity: fade, scale }}>
        <motion.h2 style={{ x: titleX }} className="whitespace-nowrap font-display text-[clamp(5rem,18vw,16rem)] leading-none">
          What I do · What I do ·
        </motion.h2>

        <div className="container-x mt-10 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <Reveal>
            <p className="eyebrow !text-ink/50">Services · 02</p>
            <p className="mt-4 max-w-sm text-lg font-medium leading-snug">
              From a single logo to a full brand world — strategy, design, motion and 3D under one roof.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {process.map((p, i) => (
                <span key={p} className="rounded-full border border-ink/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                  <span className="text-ember">{String(i + 1).padStart(2, '0')}</span> {p}
                </span>
              ))}
            </div>
          </Reveal>

          <ul className="border-t border-ink/15">
            {services.map((s, i) => {
              const isOpen = open === i
              return (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: i % 2 ? 80 : -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.6 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-ink/15"
                  onPointerEnter={() => setOpen(i)}
                >
                  <button onClick={() => setOpen(isOpen ? null : i)} className="group flex w-full items-center gap-5 py-5 text-left sm:gap-8 sm:py-6">
                    <span className="w-8 text-xs font-semibold text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`flex-1 font-display text-4xl leading-none transition-colors sm:text-6xl ${isOpen ? 'text-ember' : ''}`}>{s.title}</span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/20">
                      <ArrowUpRight size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden pl-[3.25rem] pr-14 text-[15px] text-ink/65 sm:pl-16"
                      >
                        <span className="block pb-6">{s.text}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
