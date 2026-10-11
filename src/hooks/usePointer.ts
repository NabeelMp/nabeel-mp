import { useEffect } from 'react'
import { motionValue } from 'framer-motion'

// Window-level pointer position in px, shared by everything that tracks the cursor.
const x = motionValue(typeof window === 'undefined' ? 0 : window.innerWidth / 2)
const y = motionValue(typeof window === 'undefined' ? 0 : window.innerHeight / 2)
let listeners = 0
const move = (e: PointerEvent) => {
  x.set(e.clientX)
  y.set(e.clientY)
}

export function usePointer() {
  useEffect(() => {
    if (listeners++ === 0) window.addEventListener('pointermove', move, { passive: true })
    return () => {
      if (--listeners === 0) window.removeEventListener('pointermove', move)
    }
  }, [])
  return { x, y }
}
