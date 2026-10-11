import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { usePointer } from '../hooks/usePointer'

// Layers are full-frame cut-outs of the same photo (731×1207), so they stay aligned by stacking.
const PIVOT = '51.3% 32.3%' // base of the neck
const HAIR_ORIGIN = '52% 22%'
const TICKLE_LINES = ['hehe!', 'hey, that tickles!', 'oi!', 'hi there!', 'nice cursor 👀']

const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v))

interface Props {
  enter?: boolean
  snapSignal?: number
  idleMoves?: boolean
  className?: string
  onArrive?: () => void
}

export default function Character({ enter = false, snapSignal = 0, idleMoves = false, className, onArrive }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pointer = usePointer()
  const [bubble, setBubble] = useState<string | null>(null)
  const [phase, setPhase] = useState<'rolling' | 'ready'>(enter ? 'rolling' : 'ready')
  const [burst, setBurst] = useState(0)
  const busy = useRef(false)

  // --- look at the cursor --------------------------------------------------------
  const lookX = useMotionValue(0)
  const lookY = useMotionValue(0)
  const glanceX = useMotionValue(0)
  const glanceY = useMotionValue(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      lookX.set(clamp((pointer.x.get() - (r.left + r.width / 2)) / (window.innerWidth * 0.4)))
      lookY.set(clamp((pointer.y.get() - (r.top + r.height * 0.17)) / (window.innerHeight * 0.45)))
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

  const lx = useTransform([lookX, glanceX], ([a, b]: number[]) => clamp(a + b))
  const ly = useTransform([lookY, glanceY], ([a, b]: number[]) => clamp(a + b))
  const spring = { stiffness: 120, damping: 15 }
  const headRotY = useSpring(useTransform(lx, (v) => v * 16), spring)
  const nod = useMotionValue(0)
  const headRotX = useSpring(useTransform([ly, nod], ([v, n]: number[]) => -v * 10 + n), spring)
  const headRot = useSpring(useTransform(lx, (v) => v * 5), { stiffness: 110, damping: 13 })
  const headX = useSpring(useTransform(lx, (v) => v * 9), spring)
  const headY = useSpring(useTransform(ly, (v) => v * 5), spring)
  const hairLag = useSpring(headRot, { stiffness: 40, damping: 5 })
  const hairRot = useTransform([headRot, hairLag], ([r, l]: number[]) => (l - r) * 0.8)
  const hairSkew = useTransform([headRot, hairLag], ([r, l]: number[]) => (l - r) * 0.5)
  const bodyRot = useSpring(useTransform(lx, (v) => v * 1.6), { stiffness: 70, damping: 14 })
  const bodyLag = useSpring(bodyRot, { stiffness: 30, damping: 4 })
  const shirtSkew = useTransform([bodyRot, bodyLag], ([b, l]: number[]) => (b - l) * 0.9)

  // --- whole-figure motion ----------------------------------------------------------
  const rollX = useMotionValue(enter ? -1 : 0)
  const x = useTransform(rollX, (v) => `${v * 120}vw`)
  const blurPx = useMotionValue(enter ? 6 : 0)
  const filter = useTransform(blurPx, (b) => (b > 0.05 ? `blur(${b}px)` : 'none'))
  const tilt = useMotionValue(0)
  const hop = useMotionValue(0)
  const sway = useMotionValue(0)
  const breath = useMotionValue(1)

  useEffect(() => {
    const c = animate(breath, [1, 1.012, 1], { duration: 3.6, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [breath])

  const say = (text: string, ms = 1400) => {
    setBubble(text)
    window.setTimeout(() => setBubble((b) => (b === text ? null : b)), ms)
  }
  const nodHead = (amount = 9) => animate(nod, [0, amount, -3, 0], { duration: 0.7, ease: 'easeInOut' })

  // --- entrance: dash in from the left, slam on the brakes, say hello ---------------
  useEffect(() => {
    if (!enter) return
    let cancelled = false
    const run = async () => {
      busy.current = true
      await new Promise((r) => setTimeout(r, 60))
      animate(blurPx, [6, 6, 0], { duration: 1.2, times: [0, 0.6, 1] })
      animate(tilt, [-5, -5, 9, -3.5, 1.2, 0], { duration: 1.6, times: [0, 0.6, 0.7, 0.82, 0.92, 1] })
      await animate(rollX, [-1, 0.03, -0.01, 0], { duration: 1.5, times: [0, 0.66, 0.82, 1], ease: ['easeIn', 'easeOut', 'easeInOut'] })
      if (cancelled) return
      setPhase('ready')
      onArrive?.()
      say('hello!', 2200)
      await nodHead(10)
      busy.current = false
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enter])

  // --- section change: snap ---------------------------------------------------------
  useEffect(() => {
    if (!snapSignal) return
    busy.current = true
    say('*snap*', 900)
    setBurst((b) => b + 1)
    nodHead(7)
    animate(hop, [0, -10, 0], { duration: 0.4 })
    const t = window.setTimeout(() => (busy.current = false), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapSignal])

  // --- idle: glances and posture shifts ---------------------------------------------
  useEffect(() => {
    if (!idleMoves) return
    let t: number
    const loop = () => {
      if (!busy.current) {
        animate(glanceX, Math.random() * 0.8 - 0.4, { type: 'spring', stiffness: 30, damping: 9 })
        animate(glanceY, Math.random() * 0.4 - 0.15, { type: 'spring', stiffness: 30, damping: 9 })
        animate(sway, Math.random() * 12 - 6, { type: 'spring', stiffness: 30, damping: 9 })
        animate(tilt, Math.random() * 2.4 - 1.2, { type: 'spring', stiffness: 30, damping: 9 })
        if (Math.random() < 0.25) nodHead(6)
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
    animate(tilt, [0, -3, 2, 0], { duration: 0.6 })
  }

  const layer = 'pointer-events-none absolute inset-0 h-full w-full select-none object-contain'

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
            className="absolute right-[2%] top-[2%] z-20 origin-bottom-left rounded-2xl rounded-bl-sm bg-bone px-4 py-1.5 font-hand text-2xl font-bold text-ink shadow-[0_10px_30px_rgba(255,90,31,.35)] sm:text-3xl"
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

      {phase === 'ready' && enter && (
        <div className="pointer-events-none absolute bottom-[2%] left-[18%] h-10 w-1/3">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 h-6 w-6 rounded-full bg-bone/40 blur-[3px]"
              style={{ left: `${i * 14}%` }}
              initial={{ opacity: 0.7, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.6, x: -40 - i * 16, y: -14 - (i % 2) * 12 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      <motion.div
        ref={ref}
        onPointerEnter={onTickle}
        className="relative h-full w-full"
        style={{ rotate: tilt, y: hop, x: sway, transformOrigin: '50% 100%' }}
      >
        <div className="pointer-events-none absolute -bottom-[2%] left-1/2 h-[8%] w-[90%] -translate-x-1/2 rounded-full bg-ember/35 blur-2xl" />

        <motion.div className="absolute inset-0" style={{ rotate: bodyRot, scaleY: breath, skewX: shirtSkew, transformOrigin: '50% 100%' }}>
          <img src="/char/body.webp" alt="" draggable={false} className={layer} />

          <motion.div
            className="absolute inset-0"
            style={{
              rotateY: headRotY,
              rotateX: headRotX,
              rotate: headRot,
              x: headX,
              y: headY,
              transformPerspective: 900,
              transformOrigin: PIVOT,
            }}
          >
            <img src="/char/head.webp" alt="Muhammed Nabeel MP" draggable={false} className={layer} />
            <motion.img
              src="/char/hair.webp"
              alt=""
              draggable={false}
              className={layer}
              style={{ rotate: hairRot, skewX: hairSkew, transformOrigin: HAIR_ORIGIN }}
            />
          </motion.div>
        </motion.div>

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
