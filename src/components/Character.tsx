import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { usePointer } from '../hooks/usePointer'

/**
 * The hero character.
 *
 * The portrait is a cut-out PNG on a transparent background, so it is shown
 * untouched — no warp, no shader — to keep the face and body pixel-exact. All
 * motion happens on the frame around it: the entrance roll, a gentle breathing
 * sway anchored at the hips, and a little hop when tickled or snapped.
 *
 * A studio chair is drawn in two SVG layers. `ChairBack` sits behind the
 * portrait; `ChairFront` (seat, gas lift, five-star base) sits over it. The
 * portrait is 1080x1080 and the canvas adds BASE_EXTRA below it for the base.
 */

const IW = 1080
const IH = 1080
const BASE_EXTRA = 60
const CANVAS_H = IH + BASE_EXTRA

// Pelvis centre. The pose leans (shoulders left, pelvis right) so the chair is
// centred on the pelvis, which keeps the gas lift visible in the gap between
// the legs.
const CX = 560

const TICKLE_LINES = ['hehe!', 'hey, that tickles!', 'oi!', 'hi there!', 'nice cursor 👀']

const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v))

// Five-star base, casters at the floor line.
const WHEELS: [number, number][] = [
  [CX - 166, 1092],
  [CX - 83, 1102],
  [CX, 1106],
  [CX + 83, 1102],
  [CX + 166, 1092],
]

/** Backrest, drawn behind the portrait. Tilted to follow the leaning torso. */
function ChairBack() {
  return (
    <svg viewBox={`0 0 ${IW} ${CANVAS_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="chair-back" x1="0" x2="1">
          <stop offset="0" stopColor="#26262f" />
          <stop offset=".3" stopColor="#82829a" />
          <stop offset=".55" stopColor="#4c4c5b" />
          <stop offset="1" stopColor="#2a2a34" />
        </linearGradient>
        <linearGradient id="chair-back2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity=".5" />
          <stop offset=".22" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".4" />
        </linearGradient>
      </defs>
      <g transform={`rotate(-9 ${CX} 625)`}>
        <path
          d={`M${CX - 200} 200 Q${CX} 184 ${CX + 200} 200 L${CX + 235} 625 Q${CX} 644 ${CX - 235} 625 Z`}
          fill="url(#chair-back)"
          stroke="#8f8fa6"
          strokeWidth="3"
        />
        <path
          d={`M${CX - 200} 200 Q${CX} 184 ${CX + 200} 200 L${CX + 235} 625 Q${CX} 644 ${CX - 235} 625 Z`}
          fill="url(#chair-back2)"
        />
        {/* ember rim light down the left edge */}
        <path d={`M${CX - 196} 214 L${CX - 231} 616`} fill="none" stroke="#ff5a1f" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        <path d={`M${CX - 184} 222 Q${CX} 208 ${CX + 184} 222`} fill="none" stroke="#b6b6cc" strokeWidth="5" strokeLinecap="round" />
        <path d={`M${CX - 170} 252 L${CX - 188} 604`} fill="none" stroke="#c8c8dc" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      </g>
    </svg>
  )
}

/** Seat, gas lift and base, drawn over the portrait. */
function ChairFront({ wheel }: { wheel: MotionValue<number> }) {
  return (
    <svg viewBox={`0 0 ${IW} ${CANVAS_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="chair-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b6b80" />
          <stop offset=".5" stopColor="#3c3c49" />
          <stop offset="1" stopColor="#20202a" />
        </linearGradient>
        <linearGradient id="chair-chrome" x1="0" x2="1">
          <stop offset="0" stopColor="#6a6d75" />
          <stop offset=".5" stopColor="#dfe3ea" />
          <stop offset="1" stopColor="#565962" />
        </linearGradient>
        <linearGradient id="chair-leg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#55555f" />
          <stop offset="1" stopColor="#232329" />
        </linearGradient>
        <radialGradient id="chair-shadow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grounding shadow */}
      <ellipse cx={CX} cy="1064" rx="300" ry="52" fill="url(#chair-shadow)" />

      {/* seat cushion */}
      <path
        d={`M${CX - 232} 566 Q${CX} 552 ${CX + 232} 566 L${CX + 252} 652 Q${CX} 668 ${CX - 252} 652 Z`}
        fill="url(#chair-seat)"
        stroke="#7c7c92"
        strokeWidth="3"
      />
      <path d={`M${CX - 228} 572 Q${CX} 559 ${CX + 228} 572`} fill="none" stroke="#ff5a1f" strokeWidth="5" strokeLinecap="round" opacity=".9" />
      <path d={`M${CX - 250} 648 Q${CX} 664 ${CX + 250} 648`} fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" opacity=".35" />

      {/* gas lift */}
      <rect x={CX - 26} y={652} width="52" height="360" rx="12" fill="#101014" />
      <rect x={CX - 15} y={652} width="30" height="360" rx="9" fill="url(#chair-chrome)" />

      {/* base */}
      {WHEELS.map(([x, y], i) => (
        <path key={`leg${i}`} d={`M${CX} 1010 L${x} ${y - 8}`} stroke="url(#chair-leg)" strokeWidth="22" strokeLinecap="round" />
      ))}
      <ellipse cx={CX} cy={1016} rx="38" ry="19" fill="#3a3a45" stroke="#7c7c92" strokeWidth="3" />
      {WHEELS.map(([x, y], i) => (
        <motion.g key={`w${i}`} style={{ rotate: wheel, originX: `${x}px`, originY: `${y}px` }}>
          <circle cx={x} cy={y} r="19" fill="#0c0c0e" stroke="#6b6b7d" strokeWidth="5" />
          <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#ff5a1f" strokeWidth="3" />
        </motion.g>
      ))}
    </svg>
  )
}

interface Props {
  enter?: boolean
  chair?: boolean
  snapSignal?: number
  idleMoves?: boolean
  className?: string
  onArrive?: () => void
  src?: string
}

export default function Character({ enter = false, chair = false, snapSignal = 0, idleMoves = false, className, onArrive, src = '/char/nabeel-full.png' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pointer = usePointer()
  const [bubble, setBubble] = useState<string | null>(null)
  const [phase, setPhase] = useState<'rolling' | 'ready'>(enter ? 'rolling' : 'ready')
  const [burst, setBurst] = useState(0)
  const busy = useRef(false)

  // Look-at-cursor glance, applied as a tiny whole-figure lean (the face itself
  // is never warped).
  const lookX = useMotionValue(0)
  const lookY = useMotionValue(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const headY = r.top + r.height * 0.15
      lookX.set(clamp((pointer.x.get() - (r.left + r.width / 2)) / (window.innerWidth * 0.4)))
      lookY.set(clamp((pointer.y.get() - headY) / (window.innerHeight * 0.45)))
    }
    const u1 = pointer.x.on('change', update)
    const u2 = pointer.y.on('change', update)
    window.addEventListener('scroll', update, { passive: true })
    let wander: number | undefined
    if (window.matchMedia('(hover: none)').matches) {
      wander = window.setInterval(() => {
        lookX.set(Math.random() * 1.6 - 0.8)
        lookY.set(Math.random() * 0.8 - 0.3)
      }, 2400)
    }
    return () => {
      u1()
      u2()
      window.removeEventListener('scroll', update)
      if (wander) clearInterval(wander)
    }
  }, [pointer, lookX, lookY])

  const leanX = useTransform(lookX, (v) => v * 3)
  const leanY = useTransform(lookY, (v) => v * 1.5)

  const rollX = useMotionValue(enter ? -1 : 0)
  const x = useTransform(rollX, (v) => `${v * 120}vw`)
  const blurPx = useMotionValue(enter ? 6 : 0)
  const filter = useTransform(blurPx, (b) => (b > 0.05 ? `blur(${b}px)` : 'none'))
  const tilt = useMotionValue(0)
  const hop = useMotionValue(0)
  const wheel = useMotionValue(0)
  const breath = useMotionValue(1)
  const sway = useMotionValue(0)

  useEffect(() => {
    const c = animate(breath, [1, 1.006, 1], { duration: 3.6, repeat: Infinity, ease: 'easeInOut' })
    const s = animate(sway, [0, 1.5, 0], { duration: 4.4, repeat: Infinity, ease: 'easeInOut' })
    return () => {
      c.stop()
      s.stop()
    }
  }, [breath, sway])

  const say = (text: string, ms = 1400) => {
    setBubble(text)
    window.setTimeout(() => setBubble((b) => (b === text ? null : b)), ms)
  }

  useEffect(() => {
    if (!enter) return
    let cancelled = false
    const run = async () => {
      busy.current = true
      await new Promise((r) => setTimeout(r, 60))
      animate(wheel, 1440, { duration: 1.05, ease: [0.3, 0, 0.9, 0.7] })
      animate(blurPx, [6, 6, 0], { duration: 1.2, times: [0, 0.6, 1] })
      animate(tilt, [-5, -5, 8, -3, 1, 0], { duration: 1.6, times: [0, 0.6, 0.7, 0.82, 0.92, 1] })
      animate(sway, [0, 0, 6, -3, 1, 0], { duration: 1.6, times: [0, 0.6, 0.7, 0.82, 0.92, 1] })
      await animate(rollX, [-1, 0.03, -0.01, 0], { duration: 1.5, times: [0, 0.66, 0.82, 1], ease: ['easeIn', 'easeOut', 'easeInOut'] })
      if (cancelled) return
      setPhase('ready')
      onArrive?.()
      say('hello!', 2200)
      await new Promise((r) => setTimeout(r, 400))
      busy.current = false
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enter])

  useEffect(() => {
    if (!snapSignal) return
    busy.current = true
    say('*snap*', 900)
    setBurst((b) => b + 1)
    animate(hop, [0, -10, 0], { duration: 0.4 })
    const t = window.setTimeout(() => (busy.current = false), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapSignal])

  useEffect(() => {
    if (!idleMoves) return
    let t: number
    const loop = () => {
      if (!busy.current) {
        animate(lookX, Math.random() * 0.8 - 0.4, { type: 'spring', stiffness: 30, damping: 9 })
        animate(lookY, Math.random() * 0.4 - 0.15, { type: 'spring', stiffness: 30, damping: 9 })
        animate(sway, Math.random() * 3 - 1.5, { type: 'spring', stiffness: 30, damping: 9 })
      }
      t = window.setTimeout(loop, 2200 + Math.random() * 2000)
    }
    t = window.setTimeout(loop, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleMoves])

  const onTickle = () => {
    if (busy.current || bubble) return
    say(TICKLE_LINES[Math.floor(Math.random() * TICKLE_LINES.length)], 1300)
    animate(hop, [0, -14, 0, -5, 0], { duration: 0.6 })
    animate(tilt, [0, -2, 1.5, 0], { duration: 0.6 })
  }

  return (
    <motion.div style={{ x, filter }} className={`relative select-none ${className ?? ''}`}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, scale: 0.4, y: 10, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.6, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute right-[6%] top-[3%] z-20 origin-bottom-left rounded-2xl rounded-bl-sm bg-bone px-4 py-1.5 font-hand text-2xl font-bold text-ink shadow-[0_10px_30px_rgba(255,90,31,.35)] sm:text-3xl"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'rolling' && (
        <div className="pointer-events-none absolute inset-y-[35%] right-[80%] w-[60vw]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="absolute right-0 h-[2px] rounded-full bg-gradient-to-l from-bone/60 to-transparent"
              style={{ top: `${i * 26}px`, width: `${40 + i * 10}%` }}
              animate={{ opacity: [0.2, 0.9, 0.2], x: [0, -30, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      <motion.div
        ref={ref}
        onPointerEnter={onTickle}
        className="relative h-full w-full"
        style={{ rotate: tilt, y: hop, x: leanX, transformOrigin: '50% 100%' }}
      >
        <div className="pointer-events-none absolute -bottom-[1%] left-1/2 h-[6%] w-[90%] -translate-x-1/2 rounded-full bg-ember/35 blur-2xl" />
        {chair && <ChairBack />}
        {/* portrait: untouched, only a subtle breathing scale anchored at the hips */}
        <motion.img
          src={src}
          alt="Muhammed Nabeel MP"
          draggable={false}
          className="absolute left-0 top-0 h-full w-full object-contain object-top"
          style={{ scaleY: breath, y: leanY, transformOrigin: '50% 55%' }}
        />
        {chair && <ChairFront wheel={wheel} />}

        <AnimatePresence>
          {burst > 0 && (
            <motion.div key={burst} className="pointer-events-none absolute left-1/2 top-[14%] h-0 w-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * Math.PI * 2
                return (
                  <motion.span
                    key={i}
                    className={`absolute h-1 w-5 rounded-full ${i % 2 ? 'bg-ember' : 'bg-lime'}`}
                    style={{ rotate: `${(a * 180) / Math.PI}deg` }}
                    initial={{ x: Math.cos(a) * 60, y: Math.sin(a) * 60, opacity: 0 }}
                    animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 150, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
