import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { usePointer } from '../hooks/usePointer'

// The photo is one un-cut image; all motion is a smooth warp applied in a fragment shader.
const IMG = '/char/rig.webp'
const IW = 731
const IH = 1207
const CHAIR_H = 330 // extra viewBox height below the photo for the chair base
const TICKLE_LINES = ['hehe!', 'hey, that tickles!', 'oi!', 'hi there!', 'nice cursor 👀']

const VERT = `attribute vec2 p; varying vec2 vUv;
void main(){ vUv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`

const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D img;
uniform float t, headRot, nod, blink, hairLag, breath, sway;
uniform vec2 look;
const vec2 RES = vec2(${IW}., ${IH}.);

vec2 eye(vec2 q, vec2 c, vec2 r){
  float d = length((q - c) / r);
  float e = 1. - smoothstep(.45, 1., d);
  q -= vec2(look.x * 4.5, look.y * 2.4) * e;
  float lid = 1. - smoothstep(.75, 1.25, d);
  float top = c.y - r.y * 1.35;
  q.y = mix(q.y, top + (q.y - top) * .12, blink * lid);
  return q;
}

void main(){
  vec2 P = vUv * RES;
  vec2 q = P;

  // body: breathing + sway, anchored at the seat
  q.y = RES.y - (RES.y - q.y) / breath;
  q.x -= sway * (RES.y - q.y) / RES.y;

  // head: shift + turn + tilt, fading out smoothly into the neck
  vec2 hc = vec2(368., 205.);
  float wh = (1. - smoothstep(.35, 1., length((q - hc) / vec2(250., 230.)))) * (1. - smoothstep(340., 440., q.y));
  float face = 1. - clamp(pow((q.x - hc.x) / 170., 2.), 0., 1.);
  q -= vec2(look.x * 8. + look.x * 6. * face, look.y * 5. + nod) * wh;
  float a = -headRot * wh;
  vec2 pv = vec2(375., 420.);
  q = pv + mat2(cos(a), sin(a), -sin(a), cos(a)) * (q - pv);

  // hair: every strand drifts on its own phase, tips move most, plus lag from head motion
  float k = clamp((185. - q.y) / 160., 0., 1.) * smoothstep(0., 1., wh + .2);
  q.x += (sin(t * 2.1 + q.x * .09 + q.y * .05) * 1.5 + sin(t * 3.4 + q.x * .27) * .7 + hairLag * 7.) * k;
  q.y += sin(t * 2.7 + q.x * .13) * .9 * k;

  // eyes follow the cursor and blink
  q = eye(q, vec2(317., 200.), vec2(24., 11.));
  q = eye(q, vec2(403., 186.), vec2(24., 11.));

  vec2 uv = q / RES;
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) { gl_FragColor = vec4(0.); return; }
  vec4 c = texture2D(img, uv);
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`

type Uniforms = {
  look: [MotionValue<number>, MotionValue<number>]
  headRot: MotionValue<number>
  nod: MotionValue<number>
  blink: MotionValue<number>
  hairLag: MotionValue<number>
  breath: MotionValue<number>
  sway: MotionValue<number>
}

function PhotoRig({ u, className, style }: { u: Uniforms; className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true })
    if (!gl) {
      setFallback(true)
      return
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const uT = U('t'), uLook = U('look'), uRot = U('headRot'), uNod = U('nod'), uBlink = U('blink'), uHair = U('hairLag'), uBreath = U('breath'), uSway = U('sway')

    const tex = gl.createTexture()
    let ready = false
    const img = new Image()
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      ready = true
    }
    img.src = IMG

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    let raf = 0
    const t0 = performance.now()
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!ready) return
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uT, (performance.now() - t0) / 1000)
      gl.uniform2f(uLook, u.look[0].get(), u.look[1].get())
      gl.uniform1f(uRot, (u.headRot.get() * Math.PI) / 180)
      gl.uniform1f(uNod, u.nod.get())
      gl.uniform1f(uBlink, u.blink.get())
      gl.uniform1f(uHair, u.hairLag.get())
      gl.uniform1f(uBreath, u.breath.get())
      gl.uniform1f(uSway, u.sway.get())
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    frame()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [u])

  if (fallback) return <img src={IMG} alt="Muhammed Nabeel MP" className={`${className ?? ''} object-contain`} style={style} />
  return <canvas ref={canvasRef} role="img" aria-label="Muhammed Nabeel MP" className={className} style={style} />
}

const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v))
const WHEELS: [number, number][] = [
  [130, 1500],
  [250, 1518],
  [366, 1524],
  [482, 1518],
  [602, 1500],
]

function ChairBack() {
  return (
    <svg viewBox={`0 0 ${IW} ${IH + CHAIR_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="leather" x1="0" x2="1">
          <stop offset="0" stopColor="#141414" />
          <stop offset=".5" stopColor="#2b2b2b" />
          <stop offset="1" stopColor="#121212" />
        </linearGradient>
      </defs>
      {/* headrest + tall back */}
      <rect x="236" y="250" width="260" height="230" rx="80" fill="url(#leather)" stroke="#3a3a3a" strokeWidth="3" />
      <rect x="300" y="276" width="132" height="14" rx="7" fill="#ff5a1f" opacity=".9" />
      <path d="M150 480 C150 430 200 410 366 410 C532 410 582 430 582 480 L600 1150 L132 1150 Z" fill="url(#leather)" stroke="#3a3a3a" strokeWidth="3" />
    </svg>
  )
}

function ChairFront({ wheel }: { wheel: MotionValue<number> }) {
  return (
    <svg viewBox={`0 0 ${IW} ${IH + CHAIR_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#333" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" x2="1">
          <stop offset="0" stopColor="#5a5a5a" />
          <stop offset=".5" stopColor="#bdbdbd" />
          <stop offset="1" stopColor="#4a4a4a" />
        </linearGradient>
      </defs>
      {/* seat cushion overlapping the hips */}
      <ellipse cx="366" cy="1150" rx="300" ry="34" fill="#2a2a2a" opacity=".9" />
      <path d="M96 1168 C96 1150 120 1140 150 1140 L582 1140 C612 1140 636 1150 636 1168 L626 1236 C624 1252 610 1262 590 1262 L142 1262 C122 1262 108 1252 106 1236 Z" fill="url(#seat)" stroke="#444" strokeWidth="3" />
      <path d="M140 1160 H592" stroke="#ff5a1f" strokeWidth="4" strokeLinecap="round" opacity=".85" />
      {/* gas lift */}
      <rect x="340" y="1262" width="52" height="40" rx="8" fill="#1c1c1c" />
      <rect x="350" y="1300" width="32" height="150" rx="10" fill="url(#chrome)" />
      {/* five-star base */}
      {WHEELS.map(([x, y], i) => (
        <path key={`leg${i}`} d={`M366 1452 L${x} ${y - 18}`} stroke="#1e1e1e" strokeWidth="22" strokeLinecap="round" />
      ))}
      <circle cx="366" cy="1452" r="26" fill="#222" stroke="#444" strokeWidth="3" />
      {WHEELS.map(([x, y], i) => (
        <motion.g key={`w${i}`} style={{ rotate: wheel, originX: `${x}px`, originY: `${y}px` }}>
          <circle cx={x} cy={y} r="18" fill="#0d0d0d" stroke="#3d3d3d" strokeWidth="5" />
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
}

export default function Character({ enter = false, chair = false, snapSignal = 0, idleMoves = false, className, onArrive }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pointer = usePointer()
  const [bubble, setBubble] = useState<string | null>(null)
  const [phase, setPhase] = useState<'rolling' | 'ready'>(enter ? 'rolling' : 'ready')
  const [burst, setBurst] = useState(0)
  const busy = useRef(false)

  const lookX = useMotionValue(0)
  const lookY = useMotionValue(0)
  const glanceX = useMotionValue(0)
  const glanceY = useMotionValue(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const headY = r.top + r.height * (chair ? 0.13 : 0.17)
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
  }, [pointer, lookX, lookY, chair])

  const spring = { stiffness: 120, damping: 15 }
  const sx = useSpring(useTransform([lookX, glanceX], ([a, b]: number[]) => clamp(a + b)), spring)
  const sy = useSpring(useTransform([lookY, glanceY], ([a, b]: number[]) => clamp(a + b)), spring)
  const headRot = useSpring(useTransform(sx, (v) => v * 4), { stiffness: 110, damping: 13 })
  const hairSpring = useSpring(headRot, { stiffness: 40, damping: 5 })
  const hairLag = useTransform([headRot, hairSpring], ([r, l]: number[]) => (l - r) * 0.5)
  const nod = useMotionValue(0)
  const blink = useMotionValue(0)
  const breath = useMotionValue(1)
  const swayRaw = useMotionValue(0)
  const sway = useSpring(useTransform([swayRaw, sx], ([s, x]: number[]) => s + x * 6), { stiffness: 40, damping: 8 })

  const rollX = useMotionValue(enter ? -1 : 0)
  const x = useTransform(rollX, (v) => `${v * 120}vw`)
  const blurPx = useMotionValue(enter ? 6 : 0)
  const filter = useTransform(blurPx, (b) => (b > 0.05 ? `blur(${b}px)` : 'none'))
  const tilt = useMotionValue(0)
  const hop = useMotionValue(0)
  const wheel = useMotionValue(0)

  const [uniforms] = useState<Uniforms>(() => ({ look: [sx, sy], headRot, nod, blink, hairLag, breath, sway }))

  useEffect(() => {
    const c = animate(breath, [1, 1.008, 1], { duration: 3.6, repeat: Infinity, ease: 'easeInOut' })
    let t: number
    const loop = () => {
      animate(blink, [0, 1, 0], { duration: 0.22 })
      t = window.setTimeout(loop, 2200 + Math.random() * 3200)
    }
    t = window.setTimeout(loop, 1600)
    return () => {
      c.stop()
      clearTimeout(t)
    }
  }, [breath, blink])

  const say = (text: string, ms = 1400) => {
    setBubble(text)
    window.setTimeout(() => setBubble((b) => (b === text ? null : b)), ms)
  }
  const nodHead = (amount = 8) => animate(nod, [0, -amount, 3, 0], { duration: 0.7, ease: 'easeInOut' })

  useEffect(() => {
    if (!enter) return
    let cancelled = false
    const run = async () => {
      busy.current = true
      await new Promise((r) => setTimeout(r, 60))
      animate(wheel, 1440, { duration: 1.05, ease: [0.3, 0, 0.9, 0.7] })
      animate(blurPx, [6, 6, 0], { duration: 1.2, times: [0, 0.6, 1] })
      animate(tilt, [-5, -5, 8, -3, 1, 0], { duration: 1.6, times: [0, 0.6, 0.7, 0.82, 0.92, 1] })
      animate(swayRaw, [0, 0, 22, -8, 3, 0], { duration: 1.6, times: [0, 0.6, 0.7, 0.82, 0.92, 1] })
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

  useEffect(() => {
    if (!snapSignal) return
    busy.current = true
    say('*snap*', 900)
    setBurst((b) => b + 1)
    nodHead(7)
    animate(blink, [0, 1, 0], { duration: 0.2 })
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
        animate(glanceX, Math.random() * 0.8 - 0.4, { type: 'spring', stiffness: 30, damping: 9 })
        animate(glanceY, Math.random() * 0.4 - 0.15, { type: 'spring', stiffness: 30, damping: 9 })
        animate(swayRaw, Math.random() * 10 - 5, { type: 'spring', stiffness: 30, damping: 9 })
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
    animate(tilt, [0, -2, 1.5, 0], { duration: 0.6 })
  }

  const photoH = chair ? `${(IH / (IH + CHAIR_H)) * 100}%` : '100%'

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
            className="absolute right-[-4%] top-[2%] z-20 origin-bottom-left rounded-2xl rounded-bl-sm bg-bone px-4 py-1.5 font-hand text-2xl font-bold text-ink shadow-[0_10px_30px_rgba(255,90,31,.35)] sm:text-3xl"
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
        <div className="pointer-events-none absolute bottom-[1%] left-[14%] h-10 w-1/3">
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

      <motion.div ref={ref} onPointerEnter={onTickle} className="relative h-full w-full" style={{ rotate: tilt, y: hop, transformOrigin: '50% 100%' }}>
        <div className="pointer-events-none absolute -bottom-[1%] left-1/2 h-[6%] w-[90%] -translate-x-1/2 rounded-full bg-ember/35 blur-2xl" />
        {chair && <ChairBack />}
        <PhotoRig u={uniforms} className="absolute left-0 top-0 w-full" style={{ height: photoH }} />
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
