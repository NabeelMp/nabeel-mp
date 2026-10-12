import { motion } from 'framer-motion'
import { Box, Clapperboard, Layers, Package, PenTool, Sparkles, type LucideIcon } from 'lucide-react'
import { useSite } from '../lib/site'
import { Reveal, SplitWords } from './Reveal'

const ICONS: LucideIcon[] = [Sparkles, PenTool, Layers, Package, Clapperboard, Box]
const ease = [0.16, 1, 0.3, 1] as const

export default function WhatIDo() {
  const { site } = useSite()
  const { services, process } = site
  return (
    <section id="what-i-do" className="relative bg-bone py-24 text-ink sm:py-32">
      <div className="container-x">
        <div className="grid items-end gap-8 border-b border-ink/10 pb-12 md:grid-cols-2 md:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow !text-ink/50">Services · 02</p>
            </Reveal>
            <h2 className="h-section mt-4">
              <SplitWords text="What I do" />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-md text-base leading-relaxed text-ink/60 md:ml-auto md:text-lg">
              From a single logo to a full brand world — strategy, design, motion and 3D, crafted under one roof with one
              consistent voice.
            </p>
          </Reveal>
        </div>

        <ul className="grid border-l border-t border-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
                className="group relative overflow-hidden border-b border-r border-ink/10"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="relative flex h-full min-h-[240px] flex-col p-7 transition-colors duration-500 group-hover:text-bone sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.2em] text-ink/40 transition-colors group-hover:text-bone/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 transition-all duration-500 group-hover:rotate-[-12deg] group-hover:border-ember group-hover:bg-ember group-hover:text-ink">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                  </div>
                  <h3 className="mt-auto pt-10 font-display text-4xl leading-none sm:text-[2.75rem]">{s.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60 transition-colors group-hover:text-bone/65">{s.text}</p>
                </div>
              </motion.li>
            )
          })}
        </ul>

        <div className="mt-16 sm:mt-20">
          <Reveal>
            <p className="eyebrow mb-8 text-center !text-ink/50">How I work</p>
          </Reveal>
          <ol className="relative grid grid-cols-3 gap-y-8 md:grid-cols-6">
            <span className="absolute left-[8%] right-[8%] top-[11px] hidden h-px bg-ink/15 md:block" />
            {process.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ duration: 0.6, delay: i * 0.07, ease }}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full border border-ink/20 bg-bone">
                  <span className="h-2 w-2 rounded-full bg-ember" />
                </span>
                <span className="mt-3 text-[10px] font-semibold text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-[0.18em]">{p}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
