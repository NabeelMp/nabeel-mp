import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const DEMO_SESSION_KEY = 'nabeel.demoAdmin'
const DEMO_CREDS_KEY = 'nabeel.demoCreds'

export const DEFAULT_DEMO_CREDENTIALS = { username: 'admin', password: 'admin' }

export interface Credentials {
  username: string
  password: string
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
      const isAdmin = sessionStorage.getItem(DEMO_SESSION_KEY) === '1'
      setState({ loading: false, isAdmin, email: isAdmin ? getDemoCredentials().username : null })
      return
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
    if (username.trim() === creds.username && password === creds.password) {
      sessionStorage.setItem(DEMO_SESSION_KEY, '1')
      window.location.reload()
      return
    }
    throw new Error('Invalid username or password')
  }
  const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password })
  if (error) throw error
}

export async function signOut() {
  sessionStorage.removeItem(DEMO_SESSION_KEY)
  if (supabase) await supabase.auth.signOut()
  window.location.reload()
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
