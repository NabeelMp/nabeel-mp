import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SeatedPortrait from './SeatedPortrait'
import { useSnapScroll } from '../hooks/useSnapScroll'
import { useSite } from '../lib/site'

export default function Hero() {
  const { site } = useSite()
  const WORD = (site.profile.short || site.hero.name || 'NABEEL').toUpperCase().split('')
  const ref = useRef<HTMLElement>(null)
  const [stage, setStage] = useState<'intro' | 'character'>('intro')
  const [arrived, setArrived] = useState(false)
  useSnapScroll(ref, 'about', useCallback(() => {}, []))

  useEffect(() => {
    const t = setTimeout(() => setStage('character'), 650)
    const arrivedTimer = setTimeout(() => setArrived(true), 900)
    return () => { clearTimeout(t); clearTimeout(arrivedTimer) }
  }, [])

  return (
    <section id="home" ref={ref} className="grain relative h-[100svh] min-h-[560px] overflow-hidden bg-ink [background:radial-gradient(ellipse_at_50%_100%,rgba(255,90,31,.16),transparent_47%),radial-gradient(ellipse_at_50%_55%,#24201f_0%,#111010_53%,#080808_100%)]">
      <div className="pointer-events-none absolute inset-x-[7%] top-[7%] bottom-[14%] rounded-[48%_48%_0_0] border-x border-t border-bone/[0.055] bg-[linear-gradient(90deg,rgba(255,255,255,.035),transparent_18%,rgba(255,255,255,.012)_50%,transparent_82%,rgba(255,255,255,.03)),linear-gradient(180deg,rgba(255,255,255,.035),transparent_34%)] shadow-[inset_0_0_100px_rgba(255,90,31,.035),0_0_80px_rgba(0,0,0,.45)] [transform:perspective(1100px)_rotateX(2deg)]" />
      <div className="pointer-events-none absolute left-[14%] top-[18%] h-[38%] w-px bg-gradient-to-b from-transparent via-ember/35 to-transparent shadow-[0_0_20px_rgba(255,90,31,.55)]" />
      <div className="pointer-events-none absolute right-[14%] top-[18%] h-[38%] w-px bg-gradient-to-b from-transparent via-bone/25 to-transparent shadow-[0_0_20px_rgba(255,255,255,.2)]" />
      <div className="pointer-events-none absolute left-[12%] top-[19%] h-28 w-24 rounded-full bg-ember/10 blur-3xl sm:h-40 sm:w-36" />
      <div className="pointer-events-none absolute right-[12%] top-[18%] h-32 w-28 rounded-full bg-orange-100/[0.07] blur-3xl sm:h-44 sm:w-40" />
      <div className="pointer-events-none absolute inset-x-[-12%] bottom-[-3%] h-[31%] opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:64px_38px] [mask-image:linear-gradient(to_top,black,transparent_95%)] [transform:perspective(420px)_rotateX(54deg)] [transform-origin:bottom]" />
      <div className="pointer-events-none absolute inset-x-[10%] bottom-0 h-[42%] rounded-[50%_50%_0_0] border-x border-t border-bone/[0.045] bg-[linear-gradient(180deg,rgba(255,255,255,.018),transparent_38%)] [transform:perspective(900px)_rotateX(8deg)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-[4%] z-0 aspect-square w-[min(46vmin,430px)] -translate-x-1/2 rounded-full border border-ember/20 bg-[radial-gradient(circle_at_48%_38%,rgba(255,184,133,.18),rgba(255,90,31,.11)_35%,rgba(17,16,16,.12)_69%,rgba(255,90,31,.08))] shadow-[inset_0_0_50px_rgba(255,213,178,.08),0_0_90px_rgba(255,90,31,.14)] [transform:translateX(-50%)_perspective(900px)_rotateX(8deg)]" />
      <div className="pointer-events-none absolute left-1/2 top-[1%] z-0 aspect-square w-[min(56vmin,520px)] -translate-x-1/2 rounded-full border border-bone/[0.055] [transform:translateX(-50%)_perspective(900px)_rotateX(8deg)]" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[55vmin] w-[95vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/25 blur-[120px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0.75], scale: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-[13%] z-0 flex flex-col items-center justify-center sm:top-[11%]">
        <motion.p
          aria-hidden="true"
          className="mb-2 select-none text-[9px] font-bold uppercase tracking-[0.55em] text-ember sm:mb-3 sm:text-[11px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Hey, I’m
        </motion.p>
        <motion.h1
          aria-label={`Hey, I’m ${site.profile.short}`}
          className="font-tall flex max-w-[96vw] select-none justify-center whitespace-nowrap leading-[0.78] text-bone/[0.78]"
          style={{ fontSize: 'clamp(5rem, 24vw, 20rem)', letterSpacing: '-0.015em' }}
          animate={stage === 'character' ? { opacity: 0.92, scale: 0.985 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {WORD.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              aria-hidden="true"
              className="inline-block origin-bottom"
              initial={{ opacity: 0, y: '35%', scaleY: 1.5, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, scaleY: 1.08, filter: 'blur(0px)' }}
              transition={{ delay: 0.08 + index * 0.06, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>
        <motion.span
          className="mt-3 rounded-full border border-bone/10 bg-ink/35 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.36em] text-bone/55 backdrop-blur sm:mt-4 sm:text-[9px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
        >
          {site.hero.word}
        </motion.span>
        <span className="pointer-events-none absolute left-[11%] top-[55%] h-[2px] w-[78%] rotate-[-2deg] rounded-full bg-gradient-to-r from-transparent via-ember/90 to-transparent shadow-[0_0_18px_rgba(255,90,31,.45)]" />
      </div>

      <motion.div
        className="absolute left-5 top-6 z-20 flex items-center gap-2 sm:left-10 sm:top-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
        <span className="text-[11px] font-bold tracking-[0.4em]">{site.hero.eyebrow}</span>
      </motion.div>
      <motion.div
        className="absolute right-5 top-6 z-20 hidden text-right text-[10px] font-semibold uppercase tracking-[0.3em] text-bone/50 sm:right-10 sm:top-8 sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {site.profile.roles.join(' · ')}
        <br />© {new Date().getFullYear()}
      </motion.div>

      {stage === 'character' && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center sm:bottom-5">
          <div className="relative aspect-[2/3] h-[min(94svh,1000px)] sm:h-[min(100svh,1100px)] max-w-[105vw]">
            <SeatedPortrait entrance interactive />
          </div>
        </div>
      )}

      <motion.div
        className="absolute left-5 top-[30%] z-20 max-w-[70vw] sm:left-[8%] sm:top-[37%] sm:max-w-[25vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={arrived ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45 }}
      >
        <p className="font-display text-[clamp(2.25rem,4.6vw,4.75rem)] font-medium leading-[0.9] tracking-[-0.045em] text-bone">
          {site.hero.name}
        </p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-ember sm:mt-4 sm:text-xs">{site.hero.sub}</p>
        <p className="mt-3 max-w-[24rem] text-[11px] leading-relaxed text-bone/55 sm:text-sm">{site.profile.tagline}</p>
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-5 z-20 flex flex-col items-center gap-2 sm:bottom-10 sm:right-10"
        initial={{ opacity: 0 }}
        animate={arrived ? { opacity: 1 } : {}}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{site.hero.scrollLabel}</span>
        <span className="relative h-10 w-[2px] overflow-hidden rounded-full bg-bone/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-ember"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  )
}
