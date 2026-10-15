import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const DEMO_SESSION_KEY = 'nabeel.demoAdmin'
const DEMO_CREDS_KEY = 'nabeel.demoCreds'

export const DEFAULT_DEMO_CREDENTIALS = { username: 'admin', password: 'admin' }

/**
 * Auto-lock delay for the admin panel. The session is dropped after this much
 * inactivity, and whenever the admin tab is closed/hidden.
 */
export const ADMIN_AUTO_LOCK_MS = 5 * 60 * 1000

export interface Credentials {
  username: string
  password: string
}

/* Demo-mode session lives in sessionStorage, so it is cleared automatically
 * when the browser session ends (tab/window closed). A tiny listener set keeps
 * the UI in sync without a full page reload. */
const demoListeners = new Set<() => void>()
const emitDemo = () => demoListeners.forEach((fn) => fn())

function readDemoSession(): { loading: boolean; isAdmin: boolean; email: string | null } {
  const isAdmin = sessionStorage.getItem(DEMO_SESSION_KEY) === '1'
  return { loading: false, isAdmin, email: isAdmin ? getDemoCredentials().username : null }
}

/** Demo credentials, overridable by the admin from the Security tab. */
export function getDemoCredentials(): Credentials {
  try {
    const raw = localStorage.getItem(DEMO_CREDS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Credentials>
      if (parsed.username && parsed.password) return { username: parsed.username, password: parsed.password }
    }
  } catch {
    /* ignore malformed storage */
  }
  return { ...DEFAULT_DEMO_CREDENTIALS }
}

export function useAdminSession() {
  const [state, setState] = useState<{ loading: boolean; isAdmin: boolean; email: string | null }>({
    loading: true,
    isAdmin: false,
    email: null,
  })

  useEffect(() => {
    if (!supabase) {
      const sync = () => setState(readDemoSession())
      sync()
      demoListeners.add(sync)
      return () => {
        demoListeners.delete(sync)
      }
    }
    const client = supabase
    const check = async () => {
      const { data } = await client.auth.getSession()
      const user = data.session?.user
      if (!user) return setState({ loading: false, isAdmin: false, email: null })
      const { data: ok } = await client.rpc('is_admin')
      setState({ loading: false, isAdmin: Boolean(ok), email: user.email ?? null })
    }
    check()
    const { data: sub } = client.auth.onAuthStateChange(() => check())
    return () => sub.subscription.unsubscribe()
  }, [])

  return state
}

export async function signIn(username: string, password: string) {
  if (!supabase) {
    const creds = getDemoCredentials()
    const u = username.trim()
    // The default admin/admin pair always works as a master fallback, so
    // changing the demo password can never lock the owner out of the panel.
    const isDefault = u === DEFAULT_DEMO_CREDENTIALS.username && password === DEFAULT_DEMO_CREDENTIALS.password
    const isCustom = u === creds.username && password === creds.password
    if (isDefault || isCustom) {
      sessionStorage.setItem(DEMO_SESSION_KEY, '1')
      emitDemo()
      return
    }
    throw new Error('Invalid username or password')
  }
  const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) {
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    emitDemo()
    return
  }
  await supabase.auth.signOut()
}

/**
 * Locks (signs out of) the admin panel automatically:
 *  - after `ADMIN_AUTO_LOCK_MS` of inactivity, and
 *  - as soon as the admin tab/page is hidden or the window is closed.
 */
export function useAutoLock(isAdmin: boolean) {
  useEffect(() => {
    if (!isAdmin) return
    let timer = window.setTimeout(() => void signOut(), ADMIN_AUTO_LOCK_MS)
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => void signOut(), ADMIN_AUTO_LOCK_MS)
    }
    const hide = () => {
      if (document.visibilityState === 'hidden') void signOut()
    }
    const bye = () => void signOut()
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', bye)
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', bye)
    }
  }, [isAdmin])
}

/**
 * Demo mode: change the admin username/password.
 * Supabase mode: change the signed-in admin's password (and optionally email).
 */
export async function changeCredentials(next: { username?: string; password: string; current?: string }): Promise<void> {
  if (!supabase) {
    const creds = getDemoCredentials()
    if (next.current && next.current !== creds.password) throw new Error('Current password is incorrect')
    const username = (next.username ?? creds.username).trim()
    if (!username) throw new Error('Username cannot be empty')
    if (next.password.length < 4) throw new Error('Password must be at least 4 characters')
    localStorage.setItem(DEMO_CREDS_KEY, JSON.stringify({ username, password: next.password }))
    return
  }
  const { error } = await supabase.auth.updateUser({ password: next.password })
  if (error) throw error
}

/** Demo mode only: restore the default admin/admin login. */
export function resetDemoCredentials() {
  localStorage.removeItem(DEMO_CREDS_KEY)
}
