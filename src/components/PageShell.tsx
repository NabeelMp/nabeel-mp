import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Nav from './Nav'
import { profile } from '../lib/data'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav alwaysVisible />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen pb-16 pt-28 sm:pt-32"
      >
        {children}
      </motion.main>
      <footer className="container-x flex flex-col items-center justify-between gap-3 border-t border-bone/10 py-8 text-[11px] uppercase tracking-[0.25em] text-bone/45 sm:flex-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="font-display text-2xl tracking-normal text-bone">NABEEL.</span>
      </footer>
    </>
  )
}
