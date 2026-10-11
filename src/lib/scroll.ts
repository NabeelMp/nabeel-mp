export function smoothScrollTo(target: number, duration = 1000) {
  const start = window.scrollY
  const delta = target - start
  if (Math.abs(delta) < 2) return Promise.resolve()
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

export function scrollToId(id: string, duration = 1000) {
  const el = document.getElementById(id)
  if (!el) return Promise.resolve()
  return smoothScrollTo(window.scrollY + el.getBoundingClientRect().top, duration)
}
