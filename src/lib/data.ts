import type { Category, Review, Work } from './types'

export const profile = {
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
}

export const contact = {
  emails: ['nabeelmp3506@gmail.com', 'evoquestudio01@gmail.com'],
  whatsappNumber: '919778252520',
  whatsappDisplay: '+91 97782 52520',
  instagram: 'nabeel.omr',
  behance: 'nabeelmp3506',
}

export const mailtoAll = `mailto:${contact.emails.join(',')}?subject=${encodeURIComponent(
  "Let's build something remarkable",
)}`
export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
  'Hi Nabeel! I saw your portfolio and would love to talk.',
)}`
export const instagramUrl = `https://www.instagram.com/${contact.instagram}/`
export const behanceUrl = `https://www.behance.net/${contact.behance}`

export const services = [
  { title: 'Brand Strategy', text: 'Positioning, naming, voice and the foundations that give identity meaning.' },
  { title: 'Logo Design', text: 'Marks built to endure, scale and speak fluently across every medium.' },
  { title: 'Visual Systems', text: 'Typography, colour, grids and motion operating as one cohesive language.' },
  { title: 'Packaging', text: 'Tactile, considered structures that turn products into objects of desire.' },
  { title: 'Creative Direction', text: 'Campaign concepting and art direction across film, print and digital.' },
  { title: 'Motion & 3D', text: 'Video editing, motion graphics and 3D animation that make brands move.' },
]

export const process = ['Discover', 'Research', 'Strategy', 'Concept', 'Identity', 'Execution']

export const categories: Category[] = [
  { key: 'branding', index: '01', title: 'Branding', short: 'Identity', accent: '#ff5a1f', blurb: 'Identity systems, logos and brand worlds with a spine.' },
  { key: 'packaging', index: '02', title: 'Packaging', short: 'Structure', accent: '#d7ff3a', blurb: 'Boxes, bottles and labels that beg to be picked up.' },
  { key: 'package', index: '03', title: 'Package', short: 'Product', accent: '#7cc6ff', blurb: 'Complete product packages — from concept to shelf-ready.' },
  { key: 'video-editing', index: '04', title: 'Video Editing', short: 'Cut', accent: '#ff7ad9', blurb: 'Rhythm, story and pace — edits that keep eyes glued.' },
  { key: 'motion-graphics', index: '05', title: 'Motion Graphics', short: 'Motion', accent: '#ffd23f', blurb: 'Type, shape and logo animation with personality.' },
  { key: '3d-animation', index: '06', title: '3D Animation', short: 'Depth', accent: '#9b8cff', blurb: 'Products, scenes and characters rendered in depth.' },
]

export const categoryByKey = (key?: string) => categories.find((c) => c.key === key)

const seed = (
  id: string,
  category: Work['category'],
  title: string,
  client: string,
  year: string,
  cover: string,
  summary: string,
  tags: string[],
): Work => ({
  id,
  category,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  title,
  client,
  year,
  summary,
  description:
    `${summary} The brief called for a system that could flex from a favicon to a billboard without losing its voice. ` +
    'We started with research and positioning, explored three distinct directions, then refined one into a complete toolkit: mark, typography, colour, layout rules and motion principles.',
  cover_url: cover,
  gallery: [cover],
  video_url: null,
  tags,
  created_at: new Date(2025, 0, Number(id.replace(/\D/g, '')) || 1).toISOString(),
})

export const seedWorks: Work[] = [
  seed('s1', 'branding', 'Meridian Studio', 'Meridian Studio', '2025', '/works/work-2.jpg', 'A calm, architectural identity for an independent design studio.', ['Identity', 'Print']),
  seed('s2', 'branding', 'Nova Ledger', 'Nova Ledger', '2023', '/works/work-6.jpg', 'A confident fintech brand that makes money feel human.', ['Fintech', 'Product']),
  seed('s3', 'branding', 'Suiss Type Foundry', 'Suiss', '2024', '/works/work-3.jpg', 'Editorial identity for a contemporary type foundry.', ['Typography', 'Editorial']),
  seed('s4', 'packaging', 'Sartfaure', 'Sartfaure', '2025', '/works/work-1.jpg', 'Luxury perfume packaging with sculpted, quiet confidence.', ['Perfume', 'Luxury']),
  seed('s5', 'packaging', 'Orbit Coffee Co.', 'Orbit Co.', '2024', '/works/work-4.jpg', 'Retail coffee packaging built around a playful orbit system.', ['Retail', 'Coffee']),
  seed('s6', 'package', 'Halo Wear', 'Halo Wear', '2024', '/works/work-5.jpg', 'A full launch package for a fashion label — direction, packaging and campaign.', ['Fashion', 'Direction']),
  seed('s7', 'video-editing', 'Halo Wear — Launch Film', 'Halo Wear', '2024', '/works/work-5.jpg', 'A 60-second launch edit cut to the beat of the brand.', ['Edit', 'Campaign']),
  seed('s8', 'motion-graphics', 'Nova Ledger — Logo Motion', 'Nova Ledger', '2023', '/works/work-6.jpg', 'Logo animation and UI motion language for the Nova app.', ['Logo', 'UI Motion']),
  seed('s9', '3d-animation', 'Sartfaure — Bottle in 3D', 'Sartfaure', '2025', '/works/work-1.jpg', 'Photoreal 3D product animation for the Sartfaure bottle.', ['3D', 'Product']),
]

export const seedReviews: Review[] = [
  { id: 'r1', work_id: 's4', name: 'Ilana Rowe', position: 'CEO, Sartfaure', rating: 5, message: "Nabeel doesn't just design — he thinks. He reframed our entire brand in a way that finally felt like us.", created_at: '2025-03-01' },
  { id: 'r2', work_id: 's2', name: 'Marcus Field', position: 'Founder, Nova Ledger', rating: 5, message: 'A rare combination of taste, strategy and craft. Every deliverable felt three levels beyond what we asked for.', created_at: '2025-02-01' },
  { id: 'r3', work_id: 's5', name: 'Priya Menon', position: 'Creative Lead, Orbit Co.', rating: 5, message: "The identity system he built for us still holds up two years later. That's the real test.", created_at: '2025-01-01' },
  { id: 'r4', work_id: 's1', name: 'Tomasz Beck', position: 'Founder, Meridian Studio', rating: 5, message: 'Every meeting felt like a strategy session and a masterclass rolled into one. Our brand finally has a spine.', created_at: '2024-12-01' },
  { id: 'r5', work_id: 's3', name: 'Lena Voss', position: 'Director, Suiss Type Foundry', rating: 5, message: 'Rare taste, rarer discipline. Nabeel treats a wordmark like a piece of architecture — every proportion earned.', created_at: '2024-11-01' },
  { id: 'r6', work_id: 's6', name: 'Kai Rhen', position: 'Founder, Halo Wear', rating: 5, message: 'He gave a small label the visual language of a house ten times its size — without a single hollow gesture.', created_at: '2024-10-01' },
  { id: 'r7', work_id: 's5', name: 'Arjun Das', position: 'Barista, Orbit Co.', rating: 4, message: 'Customers literally pick the bags up just to look at them. Lovely work.', created_at: '2024-09-01' },
]
