import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'
import { usePointer } from '../hooks/usePointer'

export default function CursorDot() {
  const { x, y } = usePointer()
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    setEnabled(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      setHover(Boolean(t?.closest('a,button,[data-cursor]')))
    }
    window.addEventListener('pointerover', over)
    return () => window.removeEventListener('pointerover', over)
  }, [])

  if (!enabled) return null
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-ember mix-blend-difference"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: hover ? 56 : 18, height: hover ? 56 : 18, backgroundColor: hover ? 'rgba(255,90,31,0.9)' : 'rgba(255,90,31,0)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    />
  )
}
