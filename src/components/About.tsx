import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import Character from './Character'
import { Reveal, SplitWords } from './Reveal'
import { useSnapScroll } from '../hooks/useSnapScroll'
import { profile } from '../lib/data'

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { amount: 0.6 })
  useEffect(() => {
    if (!inView || !ref.current) return
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => ref.current && (ref.current.textContent = Math.round(v) + suffix) })
    return () => c.stop()
  }, [inView, to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const [snap, setSnap] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [photoOk, setPhotoOk] = useState(true)
  useSnapScroll(ref, 'what-i-do', useCallback(() => {
    setFlipped(false)
    setSnap((s) => s + 1)
  }, []))

  return (
    <section id="about" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink py-24 sm:py-28">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      <div className="container-x grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="mx-auto w-full max-w-[420px]">
          <div
            className="group relative aspect-[4/5] w-full [perspective:1400px]"
            onPointerEnter={() => setFlipped(true)}
            onPointerLeave={() => setFlipped(false)}
            onClick={() => setFlipped((f) => !f)}
            data-cursor
          >
            <motion.div
              className="relative h-full w-full [transform-style:preserve-3d]"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="card absolute inset-0 overflow-hidden [backface-visibility:hidden]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,31,.22),transparent_60%)]" />
                <div className="absolute inset-x-0 bottom-0 top-[6%] flex justify-center">
                  <div className="aspect-[400/560] h-full">
                    <Character pose="standing" idleMoves snapSignal={snap} className="h-full w-full" />
                  </div>
                </div>
                <span className="chip absolute left-4 top-4 bg-ink/60 backdrop-blur">hover me</span>
                <span className="absolute bottom-4 right-4 font-hand text-xl text-bone/60">that's me →</span>
              </div>
              <div className="card absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {photoOk ? (
                  <img src="/me.png" alt={profile.name} className="h-full w-full object-cover" onError={() => setPhotoOk(false)} />
                ) : (
                  <div className="grid h-full place-items-center bg-ash p-8 text-center font-display text-5xl text-bone/70">
                    THE REAL
                    <br />
                    NABEEL
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
                  <p className="font-display text-3xl">{profile.name}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">About · 01</p>
          </Reveal>
          <h2 className="mt-4 font-display text-[clamp(3rem,7.5vw,7rem)] leading-[0.88]">
            <SplitWords text="Muhammed" />
            <br />
            <SplitWords text="Nabeel MP" className="text-ember" delay={0.1} />
          </h2>
          <Reveal delay={0.15} className="mt-5 flex flex-wrap gap-2">
            {profile.roles.map((r) => (
              <span key={r} className="chip border-ember/40 text-bone">
                {r}
              </span>
            ))}
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-bone/65 sm:text-base">{profile.about}</p>
          </Reveal>
          <Reveal delay={0.3} className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {profile.values.map((v, i) => (
              <motion.div
                key={v}
                whileHover={{ y: -6, rotate: i % 2 ? 3 : -3 }}
                className="min-w-0 rounded-2xl border border-bone/10 px-2 py-3 text-center"
              >
                <p className="text-[10px] text-ember">0{i + 1}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider">{v}</p>
              </motion.div>
            ))}
          </Reveal>
          <Reveal delay={0.35} className="mt-10 grid grid-cols-3 gap-6 border-t border-bone/10 pt-8">
            {profile.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-5xl leading-none sm:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-bone/45">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
