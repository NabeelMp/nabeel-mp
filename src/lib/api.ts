import { seedReviews, seedWorks } from './data'
import { supabase, WORKS_BUCKET } from './supabase'
import type { CategoryKey, NewReview, NewWork, Review, Work } from './types'

// Without Supabase env vars the site runs on seed data persisted to localStorage (demo mode).
const LS_WORKS = 'nabeel.works'
const LS_REVIEWS = 'nabeel.reviews'
const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
const byNewest = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at)

export async function listWorks(category?: CategoryKey): Promise<Work[]> {
  if (supabase) {
    let q = supabase.from('works').select('*').order('created_at', { ascending: false })
    if (category) q = q.eq('category', category)
    const { data, error } = await q
    if (!error) return (data ?? []) as Work[]
    console.warn('Supabase works unavailable, showing starter content:', error.message)
  }
  const all = read<Work[]>(LS_WORKS, seedWorks).sort(byNewest)
  return category ? all.filter((w) => w.category === category) : all
}

export async function getWork(category: string, slug: string): Promise<Work | null> {
  if (supabase) {
    const { data, error } = await supabase.from('works').select('*').eq('category', category).eq('slug', slug).maybeSingle()
    if (!error) return data as Work | null
    console.warn('Supabase works unavailable, showing starter content:', error.message)
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
  write(LS_WORKS, [created, ...read<Work[]>(LS_WORKS, seedWorks)])
  return created
}

export async function deleteWork(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('works').delete().eq('id', id)
    if (error) throw error
    return
  }
  write(LS_WORKS, read<Work[]>(LS_WORKS, seedWorks).filter((w) => w.id !== id))
  write(LS_REVIEWS, read<Review[]>(LS_REVIEWS, seedReviews).filter((r) => r.work_id !== id))
}

export async function listReviews(opts: { workId?: string; fiveStarOnly?: boolean } = {}): Promise<Review[]> {
  if (supabase) {
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (opts.workId) q = q.eq('work_id', opts.workId)
    if (opts.fiveStarOnly) q = q.eq('rating', 5)
    const { data, error } = await q
    if (!error) return (data ?? []) as Review[]
    console.warn('Supabase reviews unavailable, showing starter content:', error.message)
  }
  return read<Review[]>(LS_REVIEWS, seedReviews)
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
  write(LS_REVIEWS, [created, ...read<Review[]>(LS_REVIEWS, seedReviews)])
  return created
}

export async function deleteReview(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    return
  }
  write(LS_REVIEWS, read<Review[]>(LS_REVIEWS, seedReviews).filter((r) => r.id !== id))
}

export async function uploadMedia(file: File): Promise<string> {
  if (supabase) {
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage.from(WORKS_BUCKET).upload(path, file, { upsert: false })
    if (error) throw error
    return supabase.storage.from(WORKS_BUCKET).getPublicUrl(path).data.publicUrl
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
