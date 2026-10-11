import { useEffect, useRef, type RefObject } from 'react'
import { scrollToId } from '../lib/scroll'

// Shared lock so trackpad inertia after one snap doesn't immediately trigger the next section's snap.
let lockedUntil = 0

export function useSnapScroll(
  ref: RefObject<HTMLElement | null>,
  nextId: string,
  onSnap: () => void,
  delay = 520,
) {
  const cb = useRef(onSnap)
  useEffect(() => {
    cb.current = onSnap
  }, [onSnap])

  useEffect(() => {
    let touchY = 0
    const locked = () => performance.now() < lockedUntil
    const atBottomOfSection = () => {
      const el = ref.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      return r.top <= 48 && r.bottom >= vh - 48 && r.bottom <= vh + 48
    }
    const fire = (e: Event) => {
      if (locked()) {
        if (e.cancelable) e.preventDefault()
        return
      }
      if (!atBottomOfSection()) return
      if (e.cancelable) e.preventDefault()
      lockedUntil = performance.now() + 60_000
      cb.current()
      window.setTimeout(async () => {
        await scrollToId(nextId, 1150)
        lockedUntil = performance.now() + 650
      }, delay)
    }
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 6) fire(e)
      else if (locked() && e.cancelable) e.preventDefault()
    }
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - (e.touches[0]?.clientY ?? 0)
      if (dy > 18) fire(e)
      else if (locked() && e.cancelable) e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) fire(e)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [ref, nextId, delay])
}
