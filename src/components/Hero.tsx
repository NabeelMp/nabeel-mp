import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Character from './Character'
import { useSnapScroll } from '../hooks/useSnapScroll'
import { useSite } from '../lib/site'

export default function Hero() {
  const { site } = useSite()
  const WORD = (site.hero.word || 'PORTFOLIO').split('')
  const ref = useRef<HTMLElement>(null)
  const [stage, setStage] = useState<'intro' | 'character'>('intro')
  const [arrived, setArrived] = useState(false)
  const [snap, setSnap] = useState(0)
  useSnapScroll(ref, 'about', useCallback(() => setSnap((s) => s + 1), []))

  useEffect(() => {
    const t = setTimeout(() => setStage('character'), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="home" ref={ref} className="grain relative h-[100svh] min-h-[560px] overflow-hidden bg-ink">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[55vmin] w-[95vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/25 blur-[120px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0.75], scale: 1 }}
        transition={{ duration: 2.6, ease: 'easeOut' }}
      />

      <div className="absolute inset-x-0 top-[16%] flex justify-center sm:top-[12%]">
        <motion.h1
          aria-label="Portfolio"
          className="font-tall text-glow flex select-none leading-none text-bone"
          style={{ fontSize: 'clamp(4.5rem, 21vw, 22rem)', letterSpacing: '0.01em' }}
          animate={stage === 'character' ? { opacity: 0.92, scale: 0.97 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {WORD.map((l, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block origin-bottom"
              initial={{ opacity: 0, y: '35%', scaleY: 1.6, filter: 'blur(16px)' }}
              animate={{ opacity: 1, y: 0, scaleY: 1.18, filter: 'blur(0px)' }}
              transition={{ delay: 0.35 + i * 0.1, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {l}
            </motion.span>
          ))}
        </motion.h1>
      </div>

      <motion.div
        className="absolute left-5 top-6 flex items-center gap-2 sm:left-10 sm:top-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
        <span className="text-[11px] font-bold tracking-[0.4em]">{site.hero.eyebrow}</span>
      </motion.div>
      <motion.div
        className="absolute right-5 top-6 hidden text-right text-[10px] font-semibold uppercase tracking-[0.3em] text-bone/50 sm:right-10 sm:top-8 sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {site.profile.roles.join(' · ')}
        <br />© {new Date().getFullYear()}
      </motion.div>

      {stage === 'character' && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center sm:bottom-5">
          <div className="aspect-[731/1537] h-[min(68svh,800px)] sm:h-[min(80svh,800px)] max-w-[94vw]">
            <Character enter chair snapSignal={snap} onArrive={() => setArrived(true)} className="h-full w-full" />
          </div>
        </div>
      )}

      <motion.div
        className="absolute bottom-6 left-5 max-w-[42vw] sm:bottom-10 sm:left-10"
        initial={{ opacity: 0, y: 20 }}
        animate={arrived ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <p className="font-display text-2xl leading-none sm:text-4xl">{site.hero.name}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/50 sm:text-[11px]">{site.hero.sub}</p>
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-5 flex flex-col items-center gap-2 sm:bottom-10 sm:right-10"
        initial={{ opacity: 0 }}
        animate={arrived ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{site.hero.scrollLabel}</span>
        <span className="relative h-10 w-[2px] overflow-hidden rounded-full bg-bone/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-ember"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  )
}
