import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSite } from '../lib/site'

const spring = { type: 'spring' as const, stiffness: 240, damping: 22, mass: 0.7 }

export default function HowIWork() {
  const { site } = useSite()
  const steps = site.process.slice(0, 6)
  const [active, setActive] = useState(0)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const reduceMotion = useReducedMotion()
  const count = Math.max(steps.length, 1)
  const lineStart = 50 / count
  const lineSpan = 100 - 100 / count
  const progress = steps.length > 1 ? (active / (steps.length - 1)) * lineSpan : 0

  const moveFocus = (index: number) => {
    const next = (index + steps.length) % steps.length
    setActive(next)
    buttons.current[next]?.focus()
  }

  return (
    <section id="how-i-work" className="relative isolate overflow-hidden bg-bone py-20 text-ink sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] top-1/2 h-px bg-ink/[0.035]" />
      <div className="container-x relative mx-auto max-w-[1480px]">
        <motion.h2
          className="text-center text-[10px] font-semibold uppercase tracking-[0.5em] text-ink/45 sm:text-xs"
          initial={reduceMotion ? false : { opacity: 0, y: 12, letterSpacing: '0.75em' }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: '0.5em' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {site.content.whatIDo.processEyebrow || 'How I work'}
        </motion.h2>

        <ol className="relative mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:mt-16 md:grid-cols-6 md:gap-x-0 md:gap-y-0">
          {steps.length > 1 && (
            <>
              <span aria-hidden="true" className="pointer-events-none absolute left-[8%] right-[8%] top-5 hidden h-px bg-ink/15 md:block" />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute top-5 hidden h-px origin-left bg-ember md:block"
                style={{ left: `${lineStart}%` }}
                animate={{ width: `${progress}%` }}
                transition={reduceMotion ? { duration: 0 } : spring}
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute top-[17px] hidden h-[7px] w-[7px] rounded-full bg-ember shadow-[0_0_14px_rgba(255,90,31,.8)] md:block"
                style={{ left: `${lineStart}%` }}
                animate={{ left: `calc(${lineStart}% + ${progress}%)` }}
                transition={reduceMotion ? { duration: 0 } : spring}
              />
            </>
          )}

          {steps.map((step, index) => {
            const selected = active === index
            return (
              <motion.li
                key={`${index}-${step}`}
                className="relative flex min-w-0 flex-col items-center text-center"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ ...spring, delay: reduceMotion ? 0 : index * 0.07 }}
                onMouseEnter={() => setActive(index)}
              >
                <button
                  ref={(element) => { buttons.current[index] = element }}
                  type="button"
                  aria-label={`${String(index + 1).padStart(2, '0')} ${step}`}
                  aria-pressed={selected}
                  aria-current={selected ? 'step' : undefined}
                  className="group flex w-full flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-4 focus-visible:ring-offset-bone"
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                      event.preventDefault()
                      moveFocus(index + 1)
                    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      moveFocus(index - 1)
                    } else if (event.key === 'Home') {
                      event.preventDefault()
                      moveFocus(0)
                    } else if (event.key === 'End') {
                      event.preventDefault()
                      moveFocus(steps.length - 1)
                    }
                  }}
                >
                  <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-ink/20 bg-bone transition-colors duration-300 group-hover:border-ember/60">
                    {selected && !reduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-[-5px] rounded-full border border-ember/40"
                        initial={{ opacity: 0.7, scale: 0.8 }}
                        animate={{ opacity: [0.55, 0], scale: [0.85, 1.35] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <motion.span
                      className="h-[10px] w-[10px] rounded-full bg-ember"
                      animate={{ scale: selected ? 1.25 : 0.82, boxShadow: selected ? '0 0 0 5px rgba(255,90,31,.13)' : '0 0 0 0px rgba(255,90,31,0)' }}
                      transition={reduceMotion ? { duration: 0 } : spring}
                    />
                  </span>
                  <span className={`mt-3 text-[10px] font-semibold tabular-nums transition-colors duration-300 sm:text-[11px] ${selected ? 'text-ember' : 'text-ink/45'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`mt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] transition-all duration-300 sm:text-xs sm:tracking-[0.18em] ${selected ? 'text-ink' : 'text-ink/65 group-hover:text-ink'}`}>
                    {step}
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
