import { motion, useReducedMotion } from 'framer-motion'
import { useSite } from '../lib/site'

export default function SeatedPortrait({ className = '', entrance = false }: { className?: string; entrance?: boolean }) {
  const { site } = useSite()
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={`relative h-full w-full ${className}`}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      initial={entrance && !reduceMotion ? { opacity: 0, y: 70, rotateX: 9, rotateY: -5, scale: 0.92 } : false}
      animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 }}
      transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { rotateY: 2, rotateX: -1, scale: 1.015 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-[7%_14%_16%] rounded-[48%] bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,164,107,.25),rgba(255,90,31,.12)_38%,transparent_72%)] blur-2xl"
        animate={reduceMotion ? undefined : { opacity: [0.48, 0.72, 0.48], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={site.hero.profileImage || '/char/seated-portrait-cutout-v2.png'}
        alt="Muhammed Nabeel MP seated in his studio chair"
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain object-bottom opacity-30 blur-[3px] [transform:translate3d(8px,10px,-18px)]"
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute bottom-[4%] left-1/2 h-[8%] w-[62%] -translate-x-1/2 rounded-full bg-black/70 blur-2xl"
        animate={reduceMotion ? undefined : { scaleX: [0.94, 1.04, 0.94], opacity: [0.48, 0.68, 0.48] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={site.hero.profileImage || '/char/seated-portrait-cutout-v2.png'}
        alt="Muhammed Nabeel MP seated in his studio chair"
        draggable={false}
        className="relative z-[1] h-full w-full select-none object-contain object-bottom drop-shadow-[0_30px_28px_rgba(0,0,0,.54)] drop-shadow-[0_0_22px_rgba(255,113,55,.12)]"
        style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
        animate={reduceMotion ? undefined : { y: [0, -7, 0], rotateZ: [0, 0.35, 0], rotateY: [-0.7, 0.7, -0.7] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
