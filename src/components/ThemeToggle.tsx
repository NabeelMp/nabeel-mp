import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'

/**
 * Minimal light/dark switch. A two-slot pill with an accent knob that springs
 * between the sun and moon, so the active theme reads at a glance.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`group relative grid h-9 w-[68px] shrink-0 grid-cols-2 items-center rounded-full border border-line/15 bg-ash/60 p-1 transition-colors hover:border-ember/50 ${className}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className={`absolute top-1 h-7 w-7 rounded-full bg-ember shadow-[0_4px_14px_rgba(255,90,31,.4)] ${isDark ? 'left-1' : 'left-[36px]'}`}
      />
      <span className="relative z-10 grid place-items-center">
        <Moon size={14} className={isDark ? 'text-onaccent' : 'text-bone/45'} />
      </span>
      <span className="relative z-10 grid place-items-center">
        <Sun size={14} className={!isDark ? 'text-onaccent' : 'text-bone/45'} />
      </span>
    </button>
  )
}
