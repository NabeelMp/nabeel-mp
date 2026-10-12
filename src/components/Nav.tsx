import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Lock } from 'lucide-react'
import { scrollToId } from '../lib/scroll'
import { useSite } from '../lib/site'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'what-i-do', label: 'What I Do' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Connect' },
]

/** On the home page the nav stays hidden while the hero is on screen. */
export default function Nav({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible)
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { site } = useSite()

  useEffect(() => {
    if (alwaysVisible) return
    const onScroll = () => {
      const hero = document.getElementById('home')
      const threshold = hero ? hero.offsetHeight * 0.6 : 400
      setVisible(window.scrollY > threshold)
      let current = 'home'
      for (const l of LINKS) {
        const el = document.getElementById(l.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = l.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [alwaysVisible])

  const go = (id: string) => {
    setOpen(false)
    if (pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    scrollToId(id, 1000)
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.header
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 top-3 z-50 sm:top-5"
          >
            <nav className="mx-auto flex w-[min(94vw,980px)] items-center justify-between rounded-full border border-bone/10 bg-ink/70 py-2 pl-5 pr-2 backdrop-blur-xl">
              <Link to="/" onClick={() => go('home')} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ember" />
                <span className="text-[11px] font-bold tracking-[0.4em]">{site.profile.short.toUpperCase()}</span>
              </Link>
              <ul className="hidden items-center gap-1 md:flex">
                {LINKS.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => go(l.id)}
                      className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                        active === l.id && pathname === '/' ? 'text-ink' : 'text-bone/60 hover:text-bone'
                      }`}
                    >
                      {active === l.id && pathname === '/' && (
                        <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-bone" />
                      )}
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/admin" aria-label="Admin" title="Admin" className="grid h-9 w-9 place-items-center rounded-full border border-bone/15 text-bone/60 transition-colors hover:border-ember hover:text-ember">
                  <Lock size={14} />
                </Link>
                <button onClick={() => go('contact')} className="btn-ember !py-2 !text-[13px]">
                  Let's talk
                </button>
              </div>
              <button aria-label="Menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-bone text-ink md:hidden">
                <Menu size={18} />
              </button>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-ink/95 p-6 backdrop-blur-xl"
            initial={{ clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ clipPath: 'circle(150% at 92% 6%)' }}
            exit={{ clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <button aria-label="Close" onClick={() => setOpen(false)} className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-bone text-ink">
              <X size={18} />
            </button>
            <ul className="mt-10 flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
                  <button onClick={() => go(l.id)} className="font-display text-6xl text-bone/90 hover:text-ember">
                    {l.label}
                  </button>
                </motion.li>
              ))}
            </ul>
            <Link to="/admin" onClick={() => setOpen(false)} className="mt-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-bone/50 hover:text-ember">
              <Lock size={14} /> Admin
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
