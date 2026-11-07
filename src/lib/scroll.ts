export function smoothScrollTo(target: number, maxDuration = 700) {
  const start = window.scrollY
  const delta = target - start
  if (Math.abs(delta) < 2) return Promise.resolve()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, target)
    return Promise.resolve()
  }

  const duration = Math.min(maxDuration, Math.max(260, Math.min(620, Math.abs(delta) * 0.13)))
  const t0 = performance.now()
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
  return new Promise<void>((resolve) => {
    const step = (now: number) => {
      const t = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, start + delta * ease(t))
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

export function scrollToId(id: string, duration = 700) {
  const el = document.getElementById(id)
  if (!el) return Promise.resolve()
  return smoothScrollTo(window.scrollY + el.getBoundingClientRect().top, duration)
}
