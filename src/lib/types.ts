/** Discipline keys are free-form strings now that categories are editable in the admin. */
export type CategoryKey = string

export interface Category {
  key: CategoryKey
  title: string
  short: string
  blurb: string
  accent: string
  index: string
}

export interface Work {
  id: string
  category: CategoryKey
  slug: string
  title: string
  client: string | null
  year: string | null
  summary: string | null
  description: string | null
  cover_url: string | null
  gallery: string[]
  video_url: string | null
  tags: string[]
  created_at: string
}

export interface Review {
  id: string
  work_id: string | null
  name: string
  position: string | null
  rating: number
  message: string
  created_at: string
}

export type NewWork = Omit<Work, 'id' | 'created_at'>
export type NewReview = Omit<Review, 'id' | 'created_at'>
