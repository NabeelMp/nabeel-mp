import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 40, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 94%', 'start 56%'] })
  const start = Math.min(0.42, 0.08 + delay * 0.7)
  const opacity = useTransform(scrollYProgress, [0, start, 1], [0, 0, 1])
  const offsetY = useTransform(scrollYProgress, [0, start, 1], [y, y * 0.55, 0])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduceMotion ? { opacity: 1, y: 0 } : { opacity, y: offsetY, willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

export function SplitWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  // The trigger lives on the outer span: the inner words start clipped, so observing them would never fire.
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%', rotate: 6 }, shown: { y: 0, rotate: 0 } }}
            transition={{ duration: 0.42, delay: delay + Math.min(i * 0.025, 0.18), ease: [0.16, 1, 0.3, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
