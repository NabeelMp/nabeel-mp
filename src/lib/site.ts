import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Category } from './types'
import { supabase } from './supabase'

export const SITE_KEY = 'nabeel.site'

export interface ContactInfo {
  emails: string[]
  whatsappNumber: string
  whatsappDisplay: string
  instagram: string
  behance: string
}

export interface FooterInfo {
  adminLabel: string
  showAdmin: boolean
  backToTopLabel: string
  showBackToTop: boolean
  tagline: string
}

export interface HeroInfo {
  word: string
  eyebrow: string
  name: string
  sub: string
  scrollLabel: string
  /** Illustrated "character" portrait shown on the front of the About card. */
  profileImage: string
  /** The real photo revealed on the flip side of the About card. */
  realImage: string
}

/** Editable section headings/copy so every part of the site can be reworded. */
export interface ContentInfo {
  about: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    hoverHint: string
    flipHint: string
    fallbackText: string
  }
  whatIDo: {
    eyebrow: string
    title: string
    lead: string
    processEyebrow: string
  }
  projects: {
    eyebrow: string
    title: string
    titleAccent: string
    lead: string
  }
  reviews: {
    eyebrow: string
    title: string
    titleAccent: string
  }
  contact: {
    eyebrow: string
    title: string
    titleAccent: string
    lead: string
    ctaLabel: string
  }
}

export interface SiteContent {
  siteTitle: string
  metaDescription: string
  footer: FooterInfo
  hero: HeroInfo
  content: ContentInfo
  profile: {
    name: string
    short: string
    roles: string[]
    tagline: string
    intro: string
    about: string
    values: string[]
    stats: { value: number; suffix: string; label: string }[]
  }
  contact: ContactInfo
  services: { title: string; text: string }[]
  process: string[]
  categories: Category[]
}

export const defaultSite: SiteContent = {
  siteTitle: 'Muhammed Nabeel MP — Portfolio',
  metaDescription:
    'Muhammed Nabeel MP — graphic designer, brand designer and multimedia expert. Branding, packaging, video editing, motion graphics and 3D animation.',
  footer: {
    adminLabel: 'Admin',
    showAdmin: true,
    backToTopLabel: 'Back to top ↑',
    showBackToTop: true,
    tagline: 'NABEEL.',
  },
  hero: {
    word: 'PORTFOLIO',
    eyebrow: 'NABEEL',
    name: 'Muhammed Nabeel MP',
    sub: 'Designer · Storyteller',
    scrollLabel: 'Scroll',
    profileImage: '/char/mr-me.png',
    realImage: '/me-original.jpg',
  },
  content: {
    about: {
      eyebrow: 'About · 01',
      titleLine1: 'Muhammed',
      titleLine2: 'Nabeel MP',
      hoverHint: 'hover me',
      flipHint: "that's me →",
      fallbackText: 'THE REAL\nNABEEL',
    },
    whatIDo: {
      eyebrow: 'Services · 02',
      title: 'What I do',
      lead: 'From a single logo to a full brand world — strategy, design, motion and 3D, crafted under one roof with one consistent voice.',
      processEyebrow: 'How I work',
    },
    projects: {
      eyebrow: 'Projects · 03',
      title: 'Selected',
      titleAccent: 'works.',
      lead: 'Six disciplines, one obsession with detail. Pick a door — every work has its own story page.',
    },
    reviews: {
      eyebrow: 'Kind words · 04',
      title: 'What people',
      titleAccent: 'say.',
    },
    contact: {
      eyebrow: 'Connect · 05',
      title: "Let's",
      titleAccent: 'talk.',
      lead: 'Have a brand, a product or a story that needs a voice? Tell me about it.',
      ctaLabel: 'Start a project',
    },
  },
  profile: {
    name: 'Muhammed Nabeel MP',
    short: 'Nabeel',
    roles: ['Graphic Designer', 'Brand Designer', 'Multimedia Expert'],
    tagline: 'Built to be remembered.',
    intro:
      'A branding & visual identity designer building expressive systems for brands with ambition.',
    about:
      "For the past eight years I've partnered with founders, agencies and cultural institutions to craft identity systems that feel considered, alive and unmistakably theirs. My work sits at the intersection of strategy, typography and a slight obsession with detail — from brand strategy to the smallest kerning pair.",
    values: ['Minimal', 'Purposeful', 'Systematic', 'Creative', 'Timeless', 'Experimental'],
    stats: [
      { value: 8, suffix: '+', label: 'Years' },
      { value: 120, suffix: '+', label: 'Projects' },
      { value: 60, suffix: '+', label: 'Studios & founders' },
    ],
  },
  contact: {
    emails: ['nabeelmp3506@gmail.com', 'evoquestudio01@gmail.com'],
    whatsappNumber: '919778252520',
    whatsappDisplay: '+91 97782 52520',
    instagram: 'nabeel.omr',
    behance: 'nabeelmp3506',
  },
  services: [
    { title: 'Brand Strategy', text: 'Positioning, naming, voice and the foundations that give identity meaning.' },
    { title: 'Logo Design', text: 'Marks built to endure, scale and speak fluently across every medium.' },
    { title: 'Visual Systems', text: 'Typography, colour, grids and motion operating as one cohesive language.' },
    { title: 'Packaging', text: 'Tactile, considered structures that turn products into objects of desire.' },
    { title: 'Creative Direction', text: 'Campaign concepting and art direction across film, print and digital.' },
    { title: 'Motion & 3D', text: 'Video editing, motion graphics and 3D animation that make brands move.' },
  ],
  process: ['Discover', 'Research', 'Strategy', 'Concept', 'Identity', 'Execution'],
  categories: [
    { key: 'branding', index: '01', title: 'Branding', short: 'Identity', accent: '#ff5a1f', blurb: 'Identity systems, logos and brand worlds with a spine.' },
    { key: 'packaging', index: '02', title: 'Packaging', short: 'Structure', accent: '#d7ff3a', blurb: 'Boxes, bottles and labels that beg to be picked up.' },
    { key: 'package', index: '03', title: 'DESIGNS', short: 'Designs', accent: '#7cc6ff', blurb: 'Complete product packages — from concept to shelf-ready.' },
    { key: 'video-editing', index: '04', title: 'Video Editing', short: 'Cut', accent: '#ff7ad9', blurb: 'Rhythm, story and pace — edits that keep eyes glued.' },
    { key: 'motion-graphics', index: '05', title: 'Motion Graphics', short: 'Motion', accent: '#ffd23f', blurb: 'Type, shape and logo animation with personality.' },
    { key: '3d-animation', index: '06', title: '3D Animation', short: 'Depth', accent: '#9b8cff', blurb: 'Products, scenes and characters rendered in depth.' },
  ],
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function normalizePortrait(site: SiteContent): SiteContent {
  const image = site.hero.profileImage
  if (
    image === '/char/rig.webp' ||
    image === '/char/seated-portrait.png' ||
    image === '/char/seated-portrait-cutout-v2.png' ||
    image.startsWith('data:image/')
  ) {
    site.hero.profileImage = defaultSite.hero.profileImage
  }
  return site
}

/** Recursive merge so content saved by older versions still gains newly added fields. */
function merge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T
  if (isObject(base)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    if (isObject(override)) {
      for (const k of Object.keys(base as Record<string, unknown>)) {
        out[k] = merge((base as Record<string, unknown>)[k], override[k])
      }
    }
    return out as T
  }
  return (override === undefined || override === null ? base : override) as T
}

export function loadSite(): SiteContent {
  if (typeof window === 'undefined') return defaultSite
  try {
    // In cloud mode the shared database is authoritative; don't seed it from one browser's cache.
    if (supabase) return defaultSite
    const raw = localStorage.getItem(SITE_KEY)
    if (!raw) return defaultSite
    return normalizePortrait(merge(defaultSite, JSON.parse(raw)))
  } catch {
    return defaultSite
  }
}

function persist(site: SiteContent) {
  try {
    localStorage.setItem(SITE_KEY, JSON.stringify(site))
  } catch {
    /* storage unavailable — keep in-memory copy */
  }
}

export interface SiteContextValue {
  site: SiteContent
  syncStatus: 'local-only' | 'loading' | 'shared' | 'error'
  save: (next: SiteContent) => void
  update: (patch: Partial<SiteContent>) => void
  reset: () => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteContent>(() => loadSite())
  const [syncStatus, setSyncStatus] = useState<SiteContextValue['syncStatus']>(supabase ? 'loading' : 'local-only')
  const sharedSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sharedSaveQueue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase
      .from('site_settings')
      .select('content')
      .eq('id', 'portfolio')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Could not load shared site settings:', error.message)
          setSyncStatus('error')
          return
        }
        if (data?.content) {
          const shared = normalizePortrait(merge(defaultSite, data.content))
          setSite(shared)
          persist(shared)
        }
        setSyncStatus('shared')
      })
    return () => { active = false }
  }, [])

  const persistShared = useCallback((next: SiteContent) => {
    if (!supabase) {
      setSyncStatus('local-only')
      return
    }
    const client = supabase
    if (sharedSaveTimer.current) clearTimeout(sharedSaveTimer.current)
    setSyncStatus('loading')
    sharedSaveTimer.current = setTimeout(() => {
      sharedSaveQueue.current = sharedSaveQueue.current
        .catch(() => undefined)
        .then(async () => {
          const { error } = await client
            .from('site_settings')
            .upsert({ id: 'portfolio', content: next, updated_at: new Date().toISOString() })
          if (error) {
            console.error('Could not save shared site settings:', error.message)
            setSyncStatus('error')
          } else {
            setSyncStatus('shared')
          }
        })
    }, 500)
  }, [])

  const save = useCallback((next: SiteContent) => {
    setSite(next)
    persist(next)
    persistShared(next)
  }, [persistShared])

  const update = useCallback((patch: Partial<SiteContent>) => {
    setSite((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      persistShared(next)
      return next
    })
  }, [persistShared])

  const reset = useCallback(() => {
    setSite(defaultSite)
    try {
      localStorage.removeItem(SITE_KEY)
    } catch {
      /* ignore */
    }
    persistShared(defaultSite)
  }, [persistShared])

  // Keep the document title/meta in sync with editable content.
  useEffect(() => {
    document.title = site.siteTitle || defaultSite.siteTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta && site.metaDescription) meta.setAttribute('content', site.metaDescription)
  }, [site.siteTitle, site.metaDescription])

  const value = useMemo<SiteContextValue>(
    () => ({ site, syncStatus, save, update, reset }),
    [site, syncStatus, save, update, reset],
  )

  return createElement(SiteContext.Provider, { value }, children)
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within a SiteProvider')
  return ctx
}
