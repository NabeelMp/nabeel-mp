import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const DEMO_KEY = 'nabeel.demoAdmin'

export function useAdminSession() {
  const [state, setState] = useState<{ loading: boolean; isAdmin: boolean; email: string | null }>({
    loading: true,
    isAdmin: false,
    email: null,
  })

  useEffect(() => {
    if (!supabase) {
      setState({ loading: false, isAdmin: sessionStorage.getItem(DEMO_KEY) === '1', email: 'demo' })
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
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(DEMO_KEY, '1')
      window.location.reload()
      return
    }
    throw new Error('Demo mode: use admin / admin')
  }
  const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password })
  if (error) throw error
}

export async function signOut() {
  sessionStorage.removeItem(DEMO_KEY)
  if (supabase) await supabase.auth.signOut()
  window.location.reload()
}
