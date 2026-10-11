import { useEffect, useRef, useState, type ReactNode, type SVGProps } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { usePointer } from '../hooks/usePointer'

export type ArmPose = 'rest' | 'wave' | 'snap' | 'think' | 'hip' | 'point'
type Pose = 'sitting' | 'standing'

// [leftUpper, leftFore, rightUpper, rightFore] rotations in degrees (viewer's left/right).
const POSES: Record<Pose, Record<ArmPose, [number, number, number, number]>> = {
  sitting: {
    rest: [-10, -25, 10, 25],
    wave: [-10, -25, -145, -25],
    snap: [-10, -25, -115, -55],
    think: [-10, -25, 40, 140],
    hip: [28, -57, -28, 57],
    point: [80, 10, 10, 25],
  },
  standing: {
    rest: [-4, -6, 4, 6],
    wave: [-4, -6, -145, -25],
    snap: [-4, -6, -115, -55],
    think: [-4, -6, 40, 140],
    hip: [28, -57, -28, 57],
    point: [80, 10, 4, 6],
  },
}

const SKIN = '#b9784d'
const SKIN_SHADE = '#9a5f3a'
const HAIR = '#121010'
const BEARD = '#1d1512'
const SHIRT = '#c8a27c'
const SNEAKER = '#f2efe9'
const SHIRT_SHADE = '#a9845f'
const PANTS = '#141414'
const CHAIR = '#1b1b1b'
const EMBER = '#ff5a1f'

const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v))

function TG({
  t,
  o,
  children,
  ...rest
}: { t: MotionValue<string>; o?: MotionValue<number>; children?: ReactNode } & SVGProps<SVGGElement>) {
  const ref = useRef<SVGGElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      el.setAttribute('transform', t.get())
      if (o) el.setAttribute('opacity', String(o.get()))
    }
    apply()
    const u1 = t.on('change', apply)
    const u2 = o?.on('change', apply)
    return () => {
      u1()
      u2?.()
    }
  }, [t, o])
  return (
    <g ref={ref} {...rest}>
      {children}
    </g>
  )
}

interface Props {
  pose: Pose
  enter?: boolean
  snapSignal?: number
  idleMoves?: boolean
  className?: string
  onArrive?: () => void
}

const TICKLE_LINES = ['hehe!', 'hey, that tickles!', 'oi!', 'stop it 😆', 'hi there!']

export default function Character({ pose, enter = false, snapSignal = 0, idleMoves = false, className, onArrive }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pointer = usePointer()
  const [bubble, setBubble] = useState<string | null>(null)
  const [tickled, setTickled] = useState(false)
  const [phase, setPhase] = useState<'rolling' | 'ready'>(enter ? 'rolling' : 'ready')
  const busy = useRef(false)

  // --- look-at-cursor ---------------------------------------------------------
  const lookX = useMotionValue(0)
  const lookY = useMotionValue(0)
  useEffect(() => {
    const update = () => {
      const el = svgRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * (150 / 560)
      lookX.set(clamp((pointer.x.get() - cx) / (window.innerWidth * 0.42)))
      lookY.set(clamp((pointer.y.get() - cy) / (window.innerHeight * 0.45)))
    }
    const u1 = pointer.x.on('change', update)
    const u2 = pointer.y.on('change', update)
    window.addEventListener('scroll', update, { passive: true })
    // touch devices rarely move a pointer: let him glance around on his own
    let wander: number | undefined
    if (window.matchMedia('(hover: none)').matches) {
      wander = window.setInterval(() => {
        lookX.set(Math.random() * 1.6 - 0.8)
        lookY.set(Math.random() * 0.8 - 0.3)
      }, 2200)
    }
    return () => {
      u1()
      u2()
      window.removeEventListener('scroll', update)
      if (wander) clearInterval(wander)
    }
  }, [pointer, lookX, lookY])

  const headX = useSpring(useTransform(lookX, (v) => v * 9), { stiffness: 140, damping: 16 })
  const headY = useSpring(useTransform(lookY, (v) => v * 7), { stiffness: 140, damping: 16 })
  const headR = useSpring(useTransform(lookX, (v) => v * 12), { stiffness: 140, damping: 14 })
  const headRLag = useSpring(headR, { stiffness: 45, damping: 5 })
  const pupilX = useSpring(useTransform(lookX, (v) => v * 6), { stiffness: 260, damping: 22 })
  const pupilY = useSpring(useTransform(lookY, (v) => v * 5), { stiffness: 260, damping: 22 })
  const bodyR = useSpring(useTransform(lookX, (v) => v * 3), { stiffness: 90, damping: 14 })
  const bodyRLag = useSpring(bodyR, { stiffness: 35, damping: 4 })

  // --- animated rig values -----------------------------------------------------
  const base = POSES[pose].rest
  const uL = useMotionValue(base[0])
  const fL = useMotionValue(base[1])
  const uR = useMotionValue(base[2])
  const fR = useMotionValue(base[3])
  const lean = useMotionValue(0)
  const tilt = useMotionValue(0)
  const hop = useMotionValue(0)
  const sway = useMotionValue(0)
  const wheel = useMotionValue(0)
  const blink = useMotionValue(1)
  const mouth = useMotionValue(0)
  const handSquash = useMotionValue(1)
  const sparks = useMotionValue(0)
  const sparkO = useTransform(sparks, [0, 0.2, 1], [0, 1, 0])
  const rollX = useMotionValue(enter ? -1 : 0)

  const T = {
    whole: useTransform([tilt, hop, sway], ([t, h, s]: number[]) => `translate(${s} ${h}) rotate(${t} 200 545)`),
    upper: useTransform(
      [lean, bodyR, bodyRLag],
      ([l, b, bl]: number[]) => `rotate(${l + b} 200 390) skewX(${(b - bl) * 1.6})`,
    ),
    head: useTransform([headX, headY, headR], ([x, y, r]: number[]) => `translate(${x} ${y}) rotate(${r} 200 215)`),
    hair: useTransform([headR, headRLag], ([r, rl]: number[]) => `rotate(${(rl - r) * 0.9} 200 120) skewX(${(rl - r) * 0.6})`),
    pupils: useTransform([pupilX, pupilY], ([x, y]: number[]) => `translate(${x} ${y})`),
    blinkL: useTransform(blink, (s) => `translate(0 ${150 * (1 - s)}) scale(1 ${s})`),
    mouth: useTransform(mouth, (m) => `translate(0 ${188 * (1 - m)}) scale(1 ${m})`),
    armL: useTransform(uL, (r) => `rotate(${r} 145 250)`),
    foreL: useTransform(fL, (r) => `rotate(${r} 145 322)`),
    armR: useTransform(uR, (r) => `rotate(${r} 255 250)`),
    foreR: useTransform(fR, (r) => `rotate(${r} 255 322)`),
    hand: useTransform(handSquash, (s) => `translate(${255 * (1 - s)} ${392 * (1 - s)}) scale(${s})`),
    sparks: useTransform(sparks, (s) => `translate(255 392) scale(${0.4 + s * 1.2})`),
    wheel: (cx: number, cy: number) => (w: number) => `rotate(${w} ${cx} ${cy})`,
  }
  const wheelPositions = [
    [128, 528],
    [272, 528],
    [160, 540],
    [240, 540],
    [200, 544],
  ]
  const wheelTs = [
    useTransform(wheel, T.wheel(128, 528)),
    useTransform(wheel, T.wheel(272, 528)),
    useTransform(wheel, T.wheel(160, 540)),
    useTransform(wheel, T.wheel(240, 540)),
    useTransform(wheel, T.wheel(200, 544)),
  ]

  const setArms = (p: ArmPose, duration = 0.45) => {
    const [a, b, c, d] = POSES[pose][p]
    const opts = { type: 'spring' as const, stiffness: 160, damping: 15, duration }
    return Promise.all([animate(uL, a, opts), animate(fL, b, opts), animate(uR, c, opts), animate(fR, d, opts)])
  }

  const wave = async (times = 3) => {
    await setArms('wave')
    for (let i = 0; i < times; i++) {
      await animate(fR, -50, { duration: 0.18, ease: 'easeInOut' })
      await animate(fR, -5, { duration: 0.18, ease: 'easeInOut' })
    }
    await setArms('rest')
  }

  const talk = () => animate(mouth, [0, 1, 0.35, 1, 0.4, 0.9, 0], { duration: 1.1 })

  // --- entrance: roll in on the chair, slam to a stop, say hello ----------------
  useEffect(() => {
    if (!enter) return
    let cancelled = false
    const run = async () => {
      busy.current = true
      await new Promise((r) => setTimeout(r, 60))
      animate(wheel, 1500, { duration: 1.05, ease: [0.3, 0, 0.9, 0.7] })
      animate(lean, [-7, -7, 15, -6, 3, 0], { duration: 1.5, times: [0, 0.62, 0.72, 0.82, 0.92, 1] })
      animate(tilt, [0, 0, 7, -2.5, 0.8, 0], { duration: 1.5, times: [0, 0.62, 0.72, 0.82, 0.92, 1] })
      await animate(rollX, [-1, 0.025, -0.008, 0], { duration: 1.5, times: [0, 0.68, 0.82, 1], ease: ['easeIn', 'easeOut', 'easeInOut'] })
      if (cancelled) return
      setPhase('ready')
      onArrive?.()
      setBubble('hello!')
      talk()
      await wave(3)
      setBubble(null)
      busy.current = false
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enter])

  // --- finger snap -------------------------------------------------------------
  useEffect(() => {
    if (!snapSignal) return
    const run = async () => {
      busy.current = true
      setBubble('*snap*')
      await setArms('snap', 0.25)
      animate(handSquash, [1, 0.78, 1.18, 1], { duration: 0.32 })
      await animate(sparks, [0, 1], { duration: 0.5, ease: 'easeOut' })
      sparks.set(0)
      setTimeout(() => setBubble(null), 300)
      await setArms('rest')
      busy.current = false
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapSignal])

  // --- life: blinking, idle posture shifts --------------------------------------
  useEffect(() => {
    let t: number
    const loop = () => {
      animate(blink, [1, 0.08, 1], { duration: 0.18 })
      t = window.setTimeout(loop, 2200 + Math.random() * 3200)
    }
    t = window.setTimeout(loop, 1800)
    return () => clearTimeout(t)
  }, [blink])

  useEffect(() => {
    if (!idleMoves) return
    let t: number
    const options: ArmPose[] = ['rest', 'hip', 'think', 'rest', 'point', 'wave']
    const loop = async () => {
      if (!busy.current) {
        const p = options[Math.floor(Math.random() * options.length)]
        animate(sway, Math.random() * 14 - 7, { type: 'spring', stiffness: 40, damping: 10 })
        animate(lean, Math.random() * 6 - 3, { type: 'spring', stiffness: 40, damping: 10 })
        if (p === 'wave') await wave(2)
        else await setArms(p)
      }
      t = window.setTimeout(loop, 2300 + Math.random() * 1800)
    }
    t = window.setTimeout(loop, 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleMoves])

  const onTickle = () => {
    if (busy.current || tickled) return
    setTickled(true)
    setBubble(TICKLE_LINES[Math.floor(Math.random() * TICKLE_LINES.length)])
    talk()
    animate(hop, [0, -16, 0, -6, 0], { duration: 0.6 })
    animate(lean, [0, -4, 3, 0], { duration: 0.6 })
    setTimeout(() => {
      setTickled(false)
      setBubble(null)
    }, 1300)
  }

  const x = useTransform(rollX, (v) => `${v * 120}vw`)

  return (
    <motion.div style={{ x }} className={`relative select-none ${className ?? ''}`}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, scale: 0.4, y: 10, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.6, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute right-[2%] top-[0%] z-10 origin-bottom-left rounded-2xl rounded-bl-sm bg-bone px-4 py-1.5 font-hand text-2xl font-bold text-ink shadow-[0_10px_30px_rgba(255,90,31,.35)] sm:text-3xl"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'rolling' && (
        <div className="pointer-events-none absolute inset-y-[45%] right-[85%] w-[60vw]">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute right-0 h-[2px] rounded-full bg-gradient-to-l from-bone/50 to-transparent"
              style={{ top: `${i * 28}px`, width: `${40 + i * 12}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2], x: [0, -30, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      <svg ref={svgRef} viewBox="0 0 400 560" className="h-full w-full overflow-visible" aria-label="Animated character of Nabeel">
        <defs>
          <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={EMBER} stopOpacity="0.45" />
            <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="552" rx="150" ry="14" fill="url(#floorGlow)" />

        {phase === 'ready' && enter && (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.circle
                key={i}
                cx={110 + i * 10}
                cy={545}
                r={6}
                fill="#f2efe9"
                initial={{ opacity: 0.5, scale: 0.4 }}
                animate={{ opacity: 0, scale: 2.4, x: -30 - i * 14, y: -10 - (i % 2) * 10 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </g>
        )}

        <TG t={T.whole} onPointerEnter={onTickle} style={{ cursor: 'pointer' }}>
          {pose === 'sitting' && (
            <g>
              {/* chair base + wheels */}
              <rect x="194" y="420" width="12" height="80" rx="4" fill="#3a3a3a" />
              {wheelPositions.map(([wx, wy], i) => (
                <line key={`leg${i}`} x1="200" y1="500" x2={wx} y2={wy - 8} stroke="#2c2c2c" strokeWidth="10" strokeLinecap="round" />
              ))}
              {wheelPositions.map(([wx, wy], i) => (
                <TG key={`w${i}`} t={wheelTs[i]}>
                  <circle cx={wx} cy={wy} r="10" fill="#111" stroke="#444" strokeWidth="3" />
                  <line x1={wx - 7} y1={wy} x2={wx + 7} y2={wy} stroke={EMBER} strokeWidth="2" />
                </TG>
              ))}
              {/* chair back */}
              <rect x="128" y="196" width="144" height="206" rx="46" fill={CHAIR} stroke="#333" strokeWidth="3" />
              <rect x="146" y="214" width="108" height="10" rx="5" fill={EMBER} opacity="0.85" />
              {/* seat */}
              <rect x="122" y="384" width="156" height="30" rx="15" fill="#222" stroke="#383838" strokeWidth="3" />
              {/* armrests */}
              <rect x="104" y="342" width="34" height="12" rx="6" fill="#2a2a2a" />
              <rect x="262" y="342" width="34" height="12" rx="6" fill="#2a2a2a" />
              <rect x="114" y="352" width="8" height="34" fill="#2a2a2a" />
              <rect x="278" y="352" width="8" height="34" fill="#2a2a2a" />
            </g>
          )}

          {/* legs */}
          {pose === 'sitting' ? (
            <g>
              <path d="M150 386 h100 c10 0 16 10 14 22 l-6 18 h-116 l-6 -18 c-2 -12 4 -22 14 -22z" fill={PANTS} />
              <rect x="152" y="418" width="38" height="78" rx="16" fill={PANTS} />
              <rect x="210" y="418" width="38" height="78" rx="16" fill={PANTS} />
              <path d="M146 492 h46 c6 0 8 8 4 14 h-54 c-4 -6 -2 -14 4 -14z" fill={SNEAKER} />
              <path d="M208 492 h46 c6 0 8 8 4 14 h-54 c-4 -6 -2 -14 4 -14z" fill={SNEAKER} />
              <rect x="142" y="504" width="56" height="5" rx="2.5" fill={EMBER} />
              <rect x="202" y="504" width="56" height="5" rx="2.5" fill={EMBER} />
            </g>
          ) : (
            <g>
              <rect x="156" y="380" width="40" height="150" rx="16" fill={PANTS} />
              <rect x="204" y="380" width="40" height="150" rx="16" fill={PANTS} />
              <path d="M146 524 h52 c6 0 8 10 4 16 h-58 c-4 -6 -4 -16 2 -16z" fill={SNEAKER} />
              <path d="M202 524 h52 c6 0 8 10 4 16 h-58 c-4 -6 -4 -16 2 -16z" fill={SNEAKER} />
              <rect x="142" y="538" width="62" height="5" rx="2.5" fill={EMBER} />
              <rect x="198" y="538" width="62" height="5" rx="2.5" fill={EMBER} />
            </g>
          )}

          <TG t={T.upper}>
            {/* torso */}
            <path
              d="M150 240 C150 232 170 226 186 226 L214 226 C230 226 250 232 250 240 L262 330 C264 362 258 386 250 392 L150 392 C142 386 136 362 138 330 Z"
              fill={SHIRT}
            />
            <path d="M150 300 C170 306 230 306 250 300" stroke={SHIRT_SHADE} strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M180 226 C186 246 214 246 220 226 Z" fill={SKIN_SHADE} />
            <path d="M178 225 C184 250 216 250 222 225" stroke={SHIRT_SHADE} strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* "INFINITY ∞ EDITION" chest print */}
            <g fill="#2b2420" fontFamily="Anton, Impact, sans-serif" textAnchor="middle">
              <text x="200" y="283" fontSize="10.5" letterSpacing="0.3">INFINITY</text>
              <path d="M192 292 c-5 -6 -11 0 -6 4 c4 3 8 -1 14 -4 c6 -3 10 -7 14 -4 c5 4 -1 10 -6 4 c-5 -5 -10 -9 -16 0" stroke="#2b2420" strokeWidth="2.4" fill="none" transform="translate(-1 0)" />
              <text x="200" y="310" fontSize="10.5" letterSpacing="0.3">EDITION</text>
            </g>
            {/* left arm (viewer's left) */}
            <TG t={T.armL}>
              <line x1="145" y1="322" x2="145" y2="322" stroke={SKIN} strokeWidth="19" strokeLinecap="round" />
              <line x1="145" y1="250" x2="145" y2="322" stroke={SKIN} strokeWidth="19" strokeLinecap="round" />
              <line x1="145" y1="246" x2="145" y2="296" stroke={SHIRT} strokeWidth="32" strokeLinecap="round" />
              <TG t={T.foreL}>
                <line x1="145" y1="322" x2="145" y2="388" stroke={SKIN} strokeWidth="19" strokeLinecap="round" />
                <circle cx="145" cy="394" r="13" fill={SKIN} />
              </TG>
            </TG>

            {/* head */}
            <TG t={T.head}>
              <rect x="185" y="190" width="30" height="42" rx="10" fill={SKIN_SHADE} />
              <ellipse cx="142" cy="152" rx="9" ry="14" fill={SKIN_SHADE} />
              <ellipse cx="258" cy="152" rx="9" ry="14" fill={SKIN_SHADE} />
              <ellipse cx="200" cy="148" rx="58" ry="66" fill={SKIN} />
              <path d="M184 198 C186 214 194 220 200 220 C206 220 214 214 216 198 C210 204 190 204 184 198 Z" fill={BEARD} opacity="0.95" />
              <path d="M182 181 C190 174 210 174 218 181 C211 179 189 179 182 181 Z" fill={BEARD} />

              {/* eyes */}
              <g opacity={tickled ? 0 : 1}>
                <TG t={T.blinkL}>
                  <ellipse cx="180" cy="150" rx="10.5" ry="11.5" fill="#fff" />
                  <ellipse cx="220" cy="150" rx="10.5" ry="11.5" fill="#fff" />
                  <TG t={T.pupils}>
                    <circle cx="180" cy="151" r="6" fill="#140d0a" />
                    <circle cx="220" cy="151" r="6" fill="#140d0a" />
                    <circle cx="182" cy="148.5" r="1.8" fill="#fff" />
                    <circle cx="222" cy="148.5" r="1.8" fill="#fff" />
                  </TG>
                </TG>
              </g>
              <g opacity={tickled ? 1 : 0} stroke="#140d0a" strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M170 153 Q180 141 190 153" />
                <path d="M210 153 Q220 141 230 153" />
              </g>
              <ellipse cx="166" cy="172" rx="10" ry="6" fill={EMBER} opacity={tickled ? 0.55 : 0} />
              <ellipse cx="234" cy="172" rx="10" ry="6" fill={EMBER} opacity={tickled ? 0.55 : 0} />

              <path d="M166 131 Q180 124 192 130" stroke={HAIR} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M208 130 Q220 124 234 131" stroke={HAIR} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M200 152 Q196 166 200 170 Q204 172 207 168" stroke={SKIN_SHADE} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M187 186 Q200 196 213 186" stroke="#140d0a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <TG t={T.mouth}>
                <ellipse cx="200" cy="188" rx="8" ry="7" fill="#3a1410" />
              </TG>

              {/* hair: springs a little behind the head */}
              <TG t={T.hair}>
                <path
                  d="M142 150 C130 96 160 64 202 62 C246 60 274 92 260 150 C256 128 246 114 234 108 C224 120 200 126 176 124 C162 128 150 136 142 150 Z"
                  fill={HAIR}
                />
                {/* tousled spikes */}
                <path d="M150 96 C142 70 160 52 178 58 C170 64 168 72 170 80 C178 58 204 44 222 52 C212 56 208 62 208 70 C222 50 252 54 262 78 C250 74 242 76 238 84 C252 84 266 96 266 116 C254 100 236 94 222 96 Z" fill={HAIR} />
                {/* fringe falling over the forehead */}
                <path d="M166 104 C180 98 206 98 226 106 C234 118 238 132 232 142 C228 128 220 120 210 116 C206 126 196 132 184 134 C190 126 192 118 190 112 C182 118 172 120 162 120 Z" fill={HAIR} />
                <path d="M200 70 C214 56 240 58 250 76 C238 70 226 72 220 82 Z" fill="#2a2320" />
              </TG>
            </TG>

            {/* right arm (viewer's right) — waves & snaps */}
            <TG t={T.armR}>
              <line x1="255" y1="250" x2="255" y2="322" stroke={SKIN} strokeWidth="19" strokeLinecap="round" />
              <line x1="255" y1="246" x2="255" y2="296" stroke={SHIRT} strokeWidth="32" strokeLinecap="round" />
              <TG t={T.foreR}>
                <line x1="255" y1="322" x2="255" y2="388" stroke={SKIN} strokeWidth="19" strokeLinecap="round" />
                <TG t={T.hand}>
                  <circle cx="255" cy="394" r="13" fill={SKIN} />
                  <ellipse cx="244" cy="388" rx="5" ry="8" fill={SKIN_SHADE} transform="rotate(-30 244 388)" />
                </TG>
                <TG t={T.sparks} o={sparkO}>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const a = (i / 8) * Math.PI * 2
                    return (
                      <line
                        key={i}
                        x1={Math.cos(a) * 20}
                        y1={Math.sin(a) * 20}
                        x2={Math.cos(a) * 34}
                        y2={Math.sin(a) * 34}
                        stroke={i % 2 ? EMBER : '#d7ff3a'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    )
                  })}
                </TG>
              </TG>
            </TG>
          </TG>
        </TG>
      </svg>
    </motion.div>
  )
}
