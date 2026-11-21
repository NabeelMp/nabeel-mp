import { useCallback, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSnapScroll } from '../hooks/useSnapScroll'
import { scrollToId } from '../lib/scroll'
import { useSite } from '../lib/site'

function GlassPrism() {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotateX = useSpring(targetX, { stiffness: 70, damping: 18, mass: 0.8 })
  const rotateY = useSpring(targetY, { stiffness: 70, damping: 18, mass: 0.8 })
  const reduceMotion = useReducedMotion()

  const followPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    targetY.set(((event.clientX - rect.left) / rect.width - 0.5) * 12)
    targetX.set((0.5 - (event.clientY - rect.top) / rect.height) * 10)
  }

  return (
    <motion.div
      aria-hidden="true"
      className="absolute right-[-16%] top-[28.5%] z-[1] h-[43svh] max-h-[760px] w-[78vw] max-w-[930px] sm:right-[0%] sm:top-[12%] sm:h-[78svh] sm:w-[59vw]"
      style={{ rotateX, rotateY, transformPerspective: 1300, transformStyle: 'preserve-3d' }}
      animate={reduceMotion ? undefined : { y: [0, -9, 0], rotateZ: [0, -0.4, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      onPointerMove={followPointer}
      onPointerLeave={() => { targetX.set(0); targetY.set(0) }}
    >
      <svg viewBox="0 0 760 700" className="h-full w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="prism-front" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff4e8" stopOpacity=".14" />
            <stop offset=".4" stopColor="#ff681f" stopOpacity=".08" />
            <stop offset="1" stopColor="#ff4d0a" stopOpacity=".28" />
          </linearGradient>
          <linearGradient id="prism-side" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffb06d" stopOpacity=".22" />
            <stop offset=".45" stopColor="#ff5a12" stopOpacity=".08" />
            <stop offset="1" stopColor="#ff4b08" stopOpacity=".38" />
          </linearGradient>
          <linearGradient id="prism-top" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" stopOpacity=".2" />
            <stop offset=".48" stopColor="#ff9b52" stopOpacity=".13" />
            <stop offset="1" stopColor="#ff4c0c" stopOpacity=".04" />
          </linearGradient>
          <linearGradient id="prism-edge" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff7ec" />
            <stop offset=".45" stopColor="#ff641b" />
            <stop offset="1" stopColor="#ffb26e" />
          </linearGradient>
          <radialGradient id="prism-glow">
            <stop stopColor="#ff5a16" stopOpacity=".58" />
            <stop offset="1" stopColor="#ff5a16" stopOpacity="0" />
          </radialGradient>
          <filter id="prism-blur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        <ellipse cx="430" cy="606" rx="286" ry="62" fill="url(#prism-glow)" filter="url(#prism-blur)" />
        <path d="M105 414 198 183 601 40 713 238 681 504 404 666 105 414Z" fill="#ff5a12" fillOpacity=".035" stroke="url(#prism-edge)" strokeWidth="2.2" />
        <path d="M198 183 601 40 484 325 373 325 105 414 198 183Z" fill="url(#prism-top)" stroke="#fff2e4" strokeOpacity=".7" strokeWidth="1.5" />
        <path d="M601 40 713 238 681 504 575 389 484 325 601 40Z" fill="url(#prism-side)" stroke="#ff762b" strokeOpacity=".95" strokeWidth="1.8" />
        <path d="M105 414 373 325 350 592 404 666 105 414Z" fill="url(#prism-front)" stroke="#fff5e9" strokeOpacity=".68" strokeWidth="1.5" />
        <path d="M373 325 484 325 575 389 681 504 404 666 350 592 373 325Z" fill="#ff5a12" fillOpacity=".09" stroke="#ff6b20" strokeOpacity=".8" strokeWidth="1.7" />
        <path d="M198 183 373 325 350 592M601 40 484 325 575 389 681 504M105 414 350 592 404 666M713 238 575 389 484 325" stroke="url(#prism-edge)" strokeOpacity=".9" strokeWidth="1.35" />
        <path d="M220 199 394 326M620 65 503 325M127 408 355 577M664 483 579 394" stroke="#fff9f1" strokeOpacity=".38" strokeWidth="1.1" />
        <path d="M601 40 713 238 681 504" stroke="#ff6c20" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M404 666 350 592 105 414" stroke="#ff8a43" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="601" cy="40" r="5" fill="#fff8ee" />
        <circle cx="681" cy="504" r="4" fill="#ff7a2a" />
        <circle cx="404" cy="666" r="4" fill="#fff0dd" />
      </svg>
    </motion.div>
  )
}

export default function Hero() {
  const { site } = useSite()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  useSnapScroll(ref, 'about', useCallback(() => {}, []))

  const phrase = site.profile.tagline.trim().replace(/[.!?]+$/, '').toUpperCase()
  const splitAt = phrase.lastIndexOf(' ')
  const firstLine = splitAt > 0 ? phrase.slice(0, splitAt) : phrase
  const accentLine = splitAt > 0 ? phrase.slice(splitAt + 1) : ''

  return (
    <section
      id="home"
      ref={ref}
      className="grain relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink text-bone [background:radial-gradient(ellipse_at_77%_55%,rgba(255,79,13,.13),transparent_34%),radial-gradient(ellipse_at_77%_84%,rgba(255,83,13,.18),transparent_31%),linear-gradient(120deg,#080808,#0c0b0a_60%,#080706)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-[radial-gradient(ellipse_at_78%_100%,rgba(255,75,8,.2),transparent_54%)]" />

      <GlassPrism />

      <div className="absolute left-[5vw] top-[29%] z-20 w-[91vw] max-w-[820px] sm:top-[27%] sm:w-[57vw] lg:left-[4.2%] lg:top-[29%] lg:w-[52vw]">
        <motion.div
          className="mb-5 flex items-center gap-3 text-[10px] font-medium tracking-[0.28em] text-bone/55 sm:mb-7 sm:text-xs"
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          <span className="h-px w-12 bg-bone/55" />
          <span>01 / 05</span>
          <span className="ml-1 text-ember">{site.hero.eyebrow}</span>
        </motion.div>

        <h1 className="font-display text-[clamp(3.3rem,7.2vw,7.4rem)] font-semibold leading-[0.83] tracking-[-0.075em]">
          <motion.span
            className="block"
            initial={reduceMotion ? false : { opacity: 0, y: 32, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {firstLine}
          </motion.span>
          {accentLine && (
            <motion.span
              className="mt-1 block text-ember text-glow"
              initial={reduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              {accentLine}
            </motion.span>
          )}
        </h1>

        <motion.div
          className="mt-6 max-w-[570px] sm:mt-7"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62 }}
        >
          <p className="text-sm font-medium text-bone/75 sm:text-base">{site.hero.sub}</p>
          <p className="mt-1.5 max-w-[540px] text-[13px] leading-relaxed text-bone/50 sm:text-[15px]">{site.profile.intro}</p>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => void scrollToId('projects')}
          className="group mt-6 inline-flex items-center gap-4 text-sm font-medium text-bone sm:mt-8"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.76 }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-bone/80 transition-all duration-300 group-hover:border-ember group-hover:bg-ember group-hover:text-ink sm:h-14 sm:w-14">
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          <span>Explore My Work</span>
        </motion.button>

      </div>

      <motion.div
        className="absolute right-[3.5%] top-[45%] z-20 hidden -translate-y-1/2 flex-col items-center gap-3 text-bone/65 sm:flex"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <span className="h-16 w-px bg-gradient-to-b from-transparent via-bone/55 to-bone/10" />
        <span className="text-[10px] [writing-mode:vertical-rl]">{site.hero.scrollLabel}</span>
      </motion.div>

    </section>
  )
}
