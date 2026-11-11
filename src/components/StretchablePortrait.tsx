import { useEffect, useRef, useState } from 'react'

const GRID_X = 72
const GRID_Y = 112
const SLOTS = 4

type Pull = {
  id: number
  anchorX: number
  anchorY: number
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  held: boolean
}

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 aPosition;
in vec2 aUv;
uniform vec2 uAnchor[4];
uniform vec2 uPull[4];
uniform float uActive[4];
uniform float uAspect;
out vec2 vUv;
void main() {
  vec2 p = aPosition;
  for (int i = 0; i < 4; i++) {
    if (uActive[i] > 0.5) {
      vec2 d = (aUv - uAnchor[i]) * vec2(uAspect, 1.0);
      float reach = 0.035 + length(uPull[i]) * 0.36;
      float weight = exp(-dot(d, d) / (2.0 * reach * reach));
      p += uPull[i] * weight;
    }
  }
  gl_Position = vec4(p, 0.0, 1.0);
  vUv = aUv;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage;
out vec4 outColor;
void main() { outColor = texture(uImage, vUv); }`

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create portrait shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Portrait shader compilation failed'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

/** A real-photo mesh that gently stretches under the pointer and springs back on release. */
export default function StretchablePortrait({ src, className = '' }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const hitRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const pullsRef = useRef<Pull[]>([])
  const [size, setSize] = useState({ width: 0, height: 0, left: 0 })
  const [holding, setHolding] = useState(false)
  const [ready, setReady] = useState(false)
  const [mood, setMood] = useState(0)

  useEffect(() => {
    const stage = stageRef.current
    const image = imageRef.current
    if (!stage || !image) return

    const measure = () => {
      const box = stage.getBoundingClientRect()
      if (!image.naturalWidth || !image.naturalHeight) return
      const aspect = image.naturalWidth / image.naturalHeight
      const width = Math.min(box.width, box.height * aspect)
      const next = { width, height: width / aspect, left: (box.width - width) / 2 }
      setSize((current) => (
        Math.abs(current.width - next.width) < 0.5 &&
        Math.abs(current.height - next.height) < 0.5 &&
        Math.abs(current.left - next.left) < 0.5
          ? current
          : next
      ))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    image.addEventListener('load', measure)
    measure()
    return () => {
      observer.disconnect()
      image.removeEventListener('load', measure)
    }
  }, [src])

  useEffect(() => {
    const canvas = canvasRef.current
    const hit = hitRef.current
    const image = imageRef.current
    if (!canvas || !hit || !image) return
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true })
    if (!gl) return

    let program: WebGLProgram | null = null
    let raf = 0
    let disposed = false
    try {
      program = gl.createProgram()
      if (!program) throw new Error('Unable to create portrait program')
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Portrait program failed to link')
      gl.useProgram(program)

      const positions: number[] = []
      const uvs: number[] = []
      const indices: number[] = []
      for (let y = 0; y <= GRID_Y; y++) {
        const v = y / GRID_Y
        for (let x = 0; x <= GRID_X; x++) {
          const u = x / GRID_X
          positions.push(u * 2 - 1, 1 - v * 2)
          uvs.push(u, v)
          if (x < GRID_X && y < GRID_Y) {
            const a = y * (GRID_X + 1) + x
            const b = a + GRID_X + 1
            indices.push(a, b, a + 1, a + 1, b, b + 1)
          }
        }
      }

      const bindAttribute = (name: string, values: number[], size: number) => {
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW)
        const location = gl.getAttribLocation(program!, name)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      }
      bindAttribute('aPosition', positions, 2)
      bindAttribute('aUv', uvs, 2)
      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

      const texture = gl.createTexture()
      if (!texture) throw new Error('Unable to create portrait texture')
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      const alphaCanvas = document.createElement('canvas')
      alphaCanvas.width = image.naturalWidth
      alphaCanvas.height = image.naturalHeight
      const alphaContext = alphaCanvas.getContext('2d', { willReadFrequently: true })
      alphaContext?.drawImage(image, 0, 0)

      const anchors = gl.getUniformLocation(program, 'uAnchor[0]')
      const offsets = gl.getUniformLocation(program, 'uPull[0]')
      const active = gl.getUniformLocation(program, 'uActive[0]')
      const aspectLoc = gl.getUniformLocation(program, 'uAspect')
      const sampler = gl.getUniformLocation(program, 'uImage')
      gl.uniform1i(sampler, 0)
      gl.uniform1f(aspectLoc, image.naturalWidth / image.naturalHeight)

      const draw = (time: number) => {
        if (disposed) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
        const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
          gl.viewport(0, 0, width, height)
        }

        const pulls = pullsRef.current
        const aa = new Float32Array(SLOTS * 2)
        const dd = new Float32Array(SLOTS * 2)
        const on = new Float32Array(SLOTS)
        const dt = Math.min(0.032, Math.max(0.001, (time - (draw as typeof draw & { last?: number }).last!) / 1000 || 0.016))
        ;(draw as typeof draw & { last?: number }).last = time
        let animating = false
        for (let i = pulls.length - 1; i >= 0; i--) {
          const pull = pulls[i]
          if (!pull.held) {
            // Three small spring steps keep release motion stable at varied frame rates.
            for (let step = 0; step < 3; step++) {
              const h = dt / 3
              pull.vx += (-260 * pull.x - 11 * pull.vx) * h
              pull.vy += (-260 * pull.y - 11 * pull.vy) * h
              pull.x += pull.vx * h
              pull.y += pull.vy * h
            }
            if (Math.hypot(pull.x, pull.y) < 0.003 && Math.hypot(pull.vx, pull.vy) < 0.03) pulls.splice(i, 1)
          }
          if (pulls.includes(pull)) {
            aa[i * 2] = pull.anchorX
            aa[i * 2 + 1] = pull.anchorY
            dd[i * 2] = pull.x
            dd[i * 2 + 1] = pull.y
            on[i] = 1
            animating ||= pull.held || Math.hypot(pull.x, pull.y, pull.vx, pull.vy) > 0.003
          }
        }
        gl.uniform2fv(anchors, aa)
        gl.uniform2fv(offsets, dd)
        gl.uniform1fv(active, on)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        if (animating) raf = requestAnimationFrame(draw)
      }

      const start = () => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(draw)
      }
      const onDown = (event: PointerEvent) => {
        if (pullsRef.current.some((pull) => pull.id === event.pointerId) || pullsRef.current.length >= SLOTS) return
        event.preventDefault()
        const bounds = canvas.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width
        const y = (event.clientY - bounds.top) / bounds.height
        const pull: Pull = { id: event.pointerId, anchorX: x, anchorY: y, x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0, held: true }
        if (alphaContext && alphaContext.getImageData(Math.min(image.naturalWidth - 1, Math.floor(x * image.naturalWidth)), Math.min(image.naturalHeight - 1, Math.floor(y * image.naturalHeight)), 1, 1).data[3] < 32) return
        pullsRef.current.push(pull)
        hit.setPointerCapture(event.pointerId)
        setHolding(true)
        setMood((value) => value + 1)
        start()
      }
      const onMove = (event: PointerEvent) => {
        const pull = pullsRef.current.find((item) => item.id === event.pointerId && item.held)
        if (!pull) return
        const bounds = canvas.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width
        const y = (event.clientY - bounds.top) / bounds.height
        const dx = (x - pull.anchorX) * 2
        const dy = -(y - pull.anchorY) * 2
        const magnitude = Math.hypot(dx, dy)
        const scale = magnitude > 1.55 ? (1.55 * Math.tanh(magnitude / 1.55)) / magnitude : 1
        pull.targetX = dx * scale
        pull.targetY = dy * scale
        // Follow the pointer closely while held; release uses the spring above.
        pull.x = pull.targetX
        pull.y = pull.targetY
        start()
      }
      const release = (event: PointerEvent) => {
        const pull = pullsRef.current.find((item) => item.id === event.pointerId)
        if (!pull) return
        pull.held = false
        setHolding(pullsRef.current.some((item) => item.held))
        start()
      }
      hit.addEventListener('pointerdown', onDown)
      hit.addEventListener('pointermove', onMove)
      hit.addEventListener('pointerup', release)
      hit.addEventListener('pointercancel', release)
      hit.addEventListener('lostpointercapture', release)
      setReady(true)

      return () => {
        hit.removeEventListener('pointerdown', onDown)
        hit.removeEventListener('pointermove', onMove)
        hit.removeEventListener('pointerup', release)
        hit.removeEventListener('pointercancel', release)
        hit.removeEventListener('lostpointercapture', release)
        cancelAnimationFrame(raf)
        gl.deleteTexture(texture)
        gl.deleteBuffer(indexBuffer)
        gl.deleteProgram(program!)
      }
    } catch (error) {
      console.error('Portrait interaction unavailable:', error)
      return () => { disposed = true; cancelAnimationFrame(raf) }
    }
  }, [src, size.width, size.height])

  return (
    <div ref={stageRef} className={`pointer-events-none absolute inset-0 ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt="Muhammed Nabeel MP seated in his studio chair"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-contain object-bottom"
      />
      {size.width > 0 && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute max-w-none"
          style={{ left: size.left, bottom: 0, width: size.width, height: size.height, opacity: ready ? 1 : 0, cursor: holding ? 'grabbing' : 'grab' }}
          aria-hidden="true"
        />
      )}
      <div
        ref={hitRef}
        className={`absolute z-[2] rounded-[45%] outline-none focus-visible:ring-2 focus-visible:ring-ember ${ready ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        style={{ left: size.left + size.width * 0.29, bottom: size.height * 0.74, width: size.width * 0.42, height: size.height * 0.24, touchAction: 'none' }}
        role="button"
        tabIndex={ready ? 0 : -1}
        aria-label="Stretch Nabeel’s face. Drag to pull, release to let it spring back."
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setMood((value) => value + 1) } }}
      />
      <span key={mood} className={`pointer-events-none absolute left-[72%] top-[12%] z-[3] rounded-full border border-bone/15 bg-ink/35 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-bone/60 backdrop-blur-sm transition-opacity duration-300 ${mood ? 'opacity-0' : 'opacity-100'} ${holding ? '!opacity-100' : ''}`}>
        {holding ? 'easy there' : 'drag my face'}
      </span>
      <span className="sr-only" aria-live="polite">{holding ? 'Portrait stretched; release to spring back.' : 'Portrait ready to interact.'}</span>
    </div>
  )
}
