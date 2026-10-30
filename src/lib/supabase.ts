import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase is optional. When the URL and a public (anon/publishable) key are
 * present the whole site reads and writes a shared backend, so admin edits show
 * up in every browser and device. Without them the site falls back to demo mode
 * (IndexedDB, this browser only).
 *
 * Only the PUBLIC key belongs here — the anon key (`sb_publishable_…`) or the
 * legacy anon JWT. Never use the secret key (`sb_secret_…`) in client code: it
 * bypasses Row Level Security. Vite only exposes `VITE_`-prefixed variables to
 * the browser, so the `VITE_` names are the ones that take effect in the app.
 */
const env = import.meta.env as Record<string, string | undefined>
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const anon =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null
export const isSupabaseReady = Boolean(supabase)
export const WORKS_BUCKET = 'works'
