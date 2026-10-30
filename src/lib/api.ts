import { seedReviews, seedWorks } from './data'
import { prepareImage } from './image'
import { supabase, WORKS_BUCKET } from './supabase'
import { cacheGet, saveKey } from './store'
import type { CategoryKey, NewReview, NewWork, Review, Work } from './types'

// Without Supabase env vars the site runs on seed data persisted to IndexedDB (demo mode).
const LS_WORKS = 'nabeel.works'
const LS_REVIEWS = 'nabeel.reviews'
const read = <T,>(key: string, fallback: T): T => cacheGet<T>(key) ?? fallback
const write = (key: string, value: unknown) => saveKey(key, value)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
const byNewest = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at)

export async function listWorks(category?: CategoryKey): Promise<Work[]> {
  if (supabase) {
    try {
      let q = supabase.from('works').select('*').order('created_at', { ascending: false })
      if (category) q = q.eq('category', category)
      const { data, error } = await q
      if (!error) return (data ?? []) as Work[]
      console.warn('Supabase works unavailable, showing starter content:', error.message)
    } catch (err) {
      console.warn('Supabase works unavailable, showing starter content:', err)
    }
  }
  const all = [...read<Work[]>(LS_WORKS, seedWorks)].sort(byNewest)
  return category ? all.filter((w) => w.category === category) : all
}

export async function getWork(category: string, slug: string): Promise<Work | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('works').select('*').eq('category', category).eq('slug', slug).maybeSingle()
      if (!error) return data as Work | null
      console.warn('Supabase works unavailable, showing starter content:', error.message)
    } catch (err) {
      console.warn('Supabase works unavailable, showing starter content:', err)
    }
  }
  return read<Work[]>(LS_WORKS, seedWorks).find((w) => w.category === category && w.slug === slug) ?? null
}

export async function createWork(work: NewWork): Promise<Work> {
  if (supabase) {
    const { data, error } = await supabase.from('works').insert(work).select().single()
    if (error) throw error
    return data as Work
  }
  const created: Work = { ...work, id: uid(), created_at: new Date().toISOString() }
  await write(LS_WORKS, [created, ...read<Work[]>(LS_WORKS, seedWorks)])
  return created
}

export async function updateWork(id: string, patch: Partial<NewWork>): Promise<Work> {
  if (supabase) {
    const { data, error } = await supabase.from('works').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data as Work
  }
  const all = read<Work[]>(LS_WORKS, seedWorks)
  const current = all.find((w) => w.id === id)
  if (!current) throw new Error('Work not found')
  const updated: Work = { ...current, ...patch }
  await write(LS_WORKS, all.map((w) => (w.id === id ? updated : w)))
  return updated
}

export async function deleteWork(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('works').delete().eq('id', id)
    if (error) throw error
    return
  }
  await write(LS_WORKS, read<Work[]>(LS_WORKS, seedWorks).filter((w) => w.id !== id))
  await write(LS_REVIEWS, read<Review[]>(LS_REVIEWS, seedReviews).filter((r) => r.work_id !== id))
}

export async function listReviews(opts: { workId?: string; fiveStarOnly?: boolean } = {}): Promise<Review[]> {
  if (supabase) {
    try {
      let q = supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (opts.workId) q = q.eq('work_id', opts.workId)
      if (opts.fiveStarOnly) q = q.eq('rating', 5)
      const { data, error } = await q
      if (!error) return (data ?? []) as Review[]
      console.warn('Supabase reviews unavailable, showing starter content:', error.message)
    } catch (err) {
      console.warn('Supabase reviews unavailable, showing starter content:', err)
    }
  }
  return [...read<Review[]>(LS_REVIEWS, seedReviews)]
    .filter((r) => (opts.workId ? r.work_id === opts.workId : true))
    .filter((r) => (opts.fiveStarOnly ? r.rating === 5 : true))
    .sort(byNewest)
}

export async function addReview(review: NewReview): Promise<Review> {
  if (supabase) {
    const { data, error } = await supabase.from('reviews').insert(review).select().single()
    if (error) throw error
    return data as Review
  }
  const created: Review = { ...review, id: uid(), created_at: new Date().toISOString() }
  await write(LS_REVIEWS, [created, ...read<Review[]>(LS_REVIEWS, seedReviews)])
  return created
}

export async function deleteReview(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    return
  }
  await write(LS_REVIEWS, read<Review[]>(LS_REVIEWS, seedReviews).filter((r) => r.id !== id))
}

export async function uploadMedia(file: File): Promise<string> {
  const prepared = await prepareImage(file)
  if (supabase) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${prepared.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage.from(WORKS_BUCKET).upload(path, prepared, { upsert: false })
    if (error) throw error
    return supabase.storage.from(WORKS_BUCKET).getPublicUrl(path).data.publicUrl
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(prepared)
  })
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/**
 * One-time migration from the old browser-only demo mode.
 *
 * Before Supabase was configured, works/reviews/site content lived only in this
 * browser's IndexedDB. When the shared backend is switched on and is still
 * empty, copy that local content up once so the owner's existing edits are not
 * stranded in the browser they were made in. It is a no-op when Supabase is not
 * configured, when the backend already has works, or after it has run once.
 */
const MIGRATED_KEY = 'nabeel.migratedToSupabase'

export async function migrateLocalToSupabase(): Promise<void> {
  if (!supabase) return
  if (cacheGet<boolean>(MIGRATED_KEY)) return
  try {
    const { count, error } = await supabase.from('works').select('id', { count: 'exact', head: true })
    if (error) return
    if (count && count > 0) {
      await saveKey(MIGRATED_KEY, true)
      return
    }
  } catch {
    return
  }

  const localWorks = read<Work[]>(LS_WORKS, [])
  const localReviews = read<Review[]>(LS_REVIEWS, [])
  let migrated = false
  if (localWorks.length) {
    const { error } = await supabase.from('works').upsert(localWorks, { onConflict: 'category,slug' })
    if (error) throw error
    migrated = true
  }
  if (localReviews.length) {
    const ids = new Set(localWorks.map((w) => w.id))
    const rows = localReviews
      .filter((r) => !r.work_id || ids.has(r.work_id))
      .map(({ id, work_id, name, position, rating, message, created_at }) => ({ id, work_id, name, position, rating, message, created_at }))
    if (rows.length) {
      const { error } = await supabase.from('reviews').upsert(rows, { onConflict: 'id' })
      if (error) throw error
      migrated = true
    }
  }
  if (migrated) await saveKey(MIGRATED_KEY, true)
}

/** Slugify and append -2, -3, … until it is unique within the given existing slugs. */
export const uniqueSlug = (title: string, taken: Iterable<string>) => {
  const base = slugify(title) || 'work'
  const used = new Set(taken)
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
