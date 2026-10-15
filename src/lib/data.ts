import type { Review, Work } from './types'

// Static profile/contact/services/categories now live in the editable site store
// (src/lib/site.ts) and are exposed through the SiteProvider. What remains here is
// the demo seed content used when Supabase is not configured.
export { defaultSite } from './site'

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
