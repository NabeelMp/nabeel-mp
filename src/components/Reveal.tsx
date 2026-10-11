import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 40, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
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
      viewport={{ once: false, amount: 0.2 }}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%', rotate: 6 }, shown: { y: 0, rotate: 0 } }}
            transition={{ duration: 0.9, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
