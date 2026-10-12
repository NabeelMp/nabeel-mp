import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useSite } from '../../lib/site'
import { ColorInput, EmptyState, Field, ImageInput, RecordListEditor, Section, StringListEditor, TextArea, TextInput, Toggle } from './ui'
import type { Category } from '../../lib/types'

/* ------------------------------------------------------------------ General */

export function GeneralEditor() {
  const { site, update } = useSite()
  return (
    <Section title="General" hint="Browser title, SEO description and the site footer.">
      <Field label="Site title" hint="Shown in the browser tab and search results.">
        <TextInput value={site.siteTitle} onChange={(v) => update({ siteTitle: v })} />
      </Field>
      <Field label="Meta description">
        <TextArea value={site.metaDescription} onChange={(v) => update({ metaDescription: v })} rows={3} />
      </Field>
      <div className="grid gap-4 border-t border-line/10 pt-5 sm:grid-cols-2">
        <Field label="Footer tagline">
          <TextInput value={site.footer.tagline} onChange={(v) => update({ footer: { ...site.footer, tagline: v } })} />
        </Field>
        <Field label="Back-to-top label">
          <TextInput value={site.footer.backToTopLabel} onChange={(v) => update({ footer: { ...site.footer, backToTopLabel: v } })} />
        </Field>
        <Field label="Footer admin link text" hint="Rename the admin link shown in the footer.">
          <TextInput value={site.footer.adminLabel} onChange={(v) => update({ footer: { ...site.footer, adminLabel: v } })} />
        </Field>
        <div className="flex items-end justify-between gap-4 rounded-2xl border border-line/10 bg-ash/50 px-4 py-3">
          <span className="text-xs text-bone/60">Show admin link</span>
          <Toggle checked={site.footer.showAdmin} label="Show admin link" onChange={(v) => update({ footer: { ...site.footer, showAdmin: v } })} />
        </div>
        <div className="flex items-end justify-between gap-4 rounded-2xl border border-line/10 bg-ash/50 px-4 py-3">
          <span className="text-xs text-bone/60">Show back-to-top</span>
          <Toggle checked={site.footer.showBackToTop} label="Show back to top" onChange={(v) => update({ footer: { ...site.footer, showBackToTop: v } })} />
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------- Hero */

export function HeroEditor() {
  const { site, update } = useSite()
  const h = site.hero
  const set = (patch: Partial<typeof h>) => update({ hero: { ...h, ...patch } })
  return (
    <>
      <Section title="Hero" hint="The opening full-screen section.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Big word" hint="Rendered letter by letter.">
            <TextInput value={h.word} onChange={(v) => set({ word: v })} />
          </Field>
          <Field label="Top-left label">
            <TextInput value={h.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          </Field>
          <Field label="Name (bottom-left)">
            <TextInput value={h.name} onChange={(v) => set({ name: v })} />
          </Field>
          <Field label="Subtitle (bottom-left)">
            <TextInput value={h.sub} onChange={(v) => set({ sub: v })} />
          </Field>
          <Field label="Scroll label">
            <TextInput value={h.scrollLabel} onChange={(v) => set({ scrollLabel: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Images of me" hint="The illustrated portrait and the real photo, used in the hero and the About card.">
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageInput label="Illustrated portrait" value={h.profileImage} onChange={(v) => set({ profileImage: v })} />
          <ImageInput label="Real photo (About flip side)" value={h.realImage} onChange={(v) => set({ realImage: v })} />
        </div>
      </Section>
    </>
  )
}

/* ----------------------------------------------------------------- Profile */

export function ProfileEditor() {
  const { site, update } = useSite()
  const p = site.profile
  const set = (patch: Partial<typeof p>) => update({ profile: { ...p, ...patch } })
  return (
    <>
      <Section title="Profile" hint="Name, roles and the About copy.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={p.name} onChange={(v) => set({ name: v })} />
          </Field>
          <Field label="Short name" hint="Used in the nav brand mark.">
            <TextInput value={p.short} onChange={(v) => set({ short: v })} />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <TextInput value={p.tagline} onChange={(v) => set({ tagline: v })} />
          </Field>
          <Field label="Intro" className="sm:col-span-2">
            <TextArea value={p.intro} onChange={(v) => set({ intro: v })} rows={2} />
          </Field>
          <Field label="About paragraph" className="sm:col-span-2">
            <TextArea value={p.about} onChange={(v) => set({ about: v })} rows={5} />
          </Field>
        </div>
        <div className="grid gap-5 border-t border-line/10 pt-5 lg:grid-cols-2">
          <div className="grid content-start gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">Roles</span>
            <StringListEditor items={p.roles} onChange={(v) => set({ roles: v })} placeholder="e.g. Brand Designer" addLabel="Add role" />
          </div>
          <div className="grid content-start gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">Values</span>
            <StringListEditor items={p.values} onChange={(v) => set({ values: v })} placeholder="e.g. Minimal" addLabel="Add value" />
          </div>
        </div>
      </Section>

      <Section title="Stats" hint="The animated counters in the About section.">
        <RecordListEditor
          items={p.stats.map((s) => ({ value: String(s.value), suffix: s.suffix, label: s.label }))}
          onChange={(rows) => set({ stats: rows.map((r) => ({ value: Number(r.value) || 0, suffix: r.suffix, label: r.label })) })}
          blank={{ value: '0', suffix: '+', label: 'New stat' }}
          addLabel="Add stat"
          title={(r) => r.label || 'Stat'}
          fields={[
            { key: 'label', label: 'Label', placeholder: 'Projects' },
            { key: 'value', label: 'Number', placeholder: '120' },
            { key: 'suffix', label: 'Suffix', placeholder: '+' },
          ]}
        />
      </Section>
    </>
  )
}

/* --------------------------------------------------------------- Services */

export function ServicesEditor() {
  const { site, update } = useSite()
  return (
    <>
      <Section title="Services" hint="The six capability cards in “What I do”.">
        <RecordListEditor
          items={site.services}
          onChange={(v) => update({ services: v })}
          blank={{ title: '', text: '' }}
          addLabel="Add service"
          title={(r, i) => r.title || `Service ${i + 1}`}
          fields={[
            { key: 'title', label: 'Title', placeholder: 'Brand Strategy' },
            { key: 'text', label: 'Description', placeholder: 'Short description', grow: true },
          ]}
        />
      </Section>
      <Section title="Process" hint="The numbered “How I work” timeline.">
        <StringListEditor items={site.process} onChange={(v) => update({ process: v })} placeholder="e.g. Discover" addLabel="Add step" />
      </Section>
    </>
  )
}

/* ------------------------------------------------------------- Categories */

const blankCategory: Category = { key: '', index: '', title: '', short: '', accent: '#ff5a1f', blurb: '' }

export function CategoriesEditor() {
  const { site, update } = useSite()
  const setAt = (i: number, patch: Partial<Category>) => update({ categories: site.categories.map((c, k) => (k === i ? { ...c, ...patch } : c)) })
  const remove = (i: number) => update({ categories: site.categories.filter((_, k) => k !== i) })
  const add = () => update({ categories: [...site.categories, { ...blankCategory, key: `discipline-${site.categories.length + 1}`, index: String(site.categories.length + 1).padStart(2, '0') }] })
  return (
    <Section title="Disciplines" hint="The category tiles on the home page and their detail routes." aside={
      <button onClick={add} className="btn-ember !px-4 !py-2 !text-xs"><Plus size={14} /> Add discipline</button>
    }>
      {site.categories.length === 0 && <EmptyState>No disciplines yet.</EmptyState>}
      <div className="grid gap-4">
        {site.categories.map((c, i) => (
          <div key={i} className="rounded-2xl border border-line/10 bg-ash/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="chip" style={{ borderColor: c.accent, color: c.accent }}>{c.index || '—'} {c.title || 'Untitled'}</span>
              <button onClick={() => remove(i)} className="grid h-9 w-9 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Delete discipline">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Route key" hint="URL segment, e.g. branding">
                <TextInput value={c.key} onChange={(v) => setAt(i, { key: v })} />
              </Field>
              <Field label="Index" hint="Display order number">
                <TextInput value={c.index} onChange={(v) => setAt(i, { index: v })} />
              </Field>
              <Field label="Title">
                <TextInput value={c.title} onChange={(v) => setAt(i, { title: v })} />
              </Field>
              <Field label="Short label">
                <TextInput value={c.short} onChange={(v) => setAt(i, { short: v })} />
              </Field>
              <Field label="Accent colour">
                <ColorInput value={c.accent} onChange={(v) => setAt(i, { accent: v })} />
              </Field>
              <Field label="Blurb" className="sm:col-span-2">
                <TextInput value={c.blurb} onChange={(v) => setAt(i, { blurb: v })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- Contact */

export function ContactEditor() {
  const { site, update } = useSite()
  const c = site.contact
  const set = (patch: Partial<typeof c>) => update({ contact: { ...c, ...patch } })
  return (
    <Section title="Contact" hint="Emails, WhatsApp and social handles used across the site.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp number" hint="Digits only, incl. country code.">
          <TextInput value={c.whatsappNumber} onChange={(v) => set({ whatsappNumber: v })} />
        </Field>
        <Field label="WhatsApp display">
          <TextInput value={c.whatsappDisplay} onChange={(v) => set({ whatsappDisplay: v })} />
        </Field>
        <Field label="Instagram handle">
          <TextInput value={c.instagram} onChange={(v) => set({ instagram: v })} />
        </Field>
        <Field label="Behance handle">
          <TextInput value={c.behance} onChange={(v) => set({ behance: v })} />
        </Field>
      </div>
      <div className="grid gap-2 border-t border-line/10 pt-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">Email addresses</span>
        <StringListEditor items={c.emails} onChange={(v) => set({ emails: v })} placeholder="name@example.com" addLabel="Add email" />
      </div>
    </Section>
  )
}

/* --------------------------------------------------------------- Sections */

export function SectionsEditor() {
  const { site, update } = useSite()
  const c = site.content
  const set = <K extends keyof typeof c>(key: K, patch: Partial<(typeof c)[K]>) => update({ content: { ...c, [key]: { ...c[key], ...patch } } })
  return (
    <>
      <Section title="About section" hint="The About · 01 heading and card hints.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <TextInput value={c.about.eyebrow} onChange={(v) => set('about', { eyebrow: v })} />
          </Field>
          <Field label="Hover hint" hint="Chip on the front of the card.">
            <TextInput value={c.about.hoverHint} onChange={(v) => set('about', { hoverHint: v })} />
          </Field>
          <Field label="Heading line 1">
            <TextInput value={c.about.titleLine1} onChange={(v) => set('about', { titleLine1: v })} />
          </Field>
          <Field label="Heading line 2" hint="Shown in the accent colour.">
            <TextInput value={c.about.titleLine2} onChange={(v) => set('about', { titleLine2: v })} />
          </Field>
          <Field label="Flip hint" hint="Handwritten note on the front.">
            <TextInput value={c.about.flipHint} onChange={(v) => set('about', { flipHint: v })} />
          </Field>
          <Field label="Photo fallback text" hint="Shown if the photo fails to load. Use a blank line to split lines.">
            <TextInput value={c.about.fallbackText} onChange={(v) => set('about', { fallbackText: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Services section" hint="The What I do · 02 heading.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <TextInput value={c.whatIDo.eyebrow} onChange={(v) => set('whatIDo', { eyebrow: v })} />
          </Field>
          <Field label="Title">
            <TextInput value={c.whatIDo.title} onChange={(v) => set('whatIDo', { title: v })} />
          </Field>
          <Field label="Lead paragraph" className="sm:col-span-2">
            <TextArea value={c.whatIDo.lead} onChange={(v) => set('whatIDo', { lead: v })} rows={2} />
          </Field>
          <Field label="Process eyebrow" hint="Heading above the How I work timeline.">
            <TextInput value={c.whatIDo.processEyebrow} onChange={(v) => set('whatIDo', { processEyebrow: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Projects section" hint="The Selected works · 03 heading.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <TextInput value={c.projects.eyebrow} onChange={(v) => set('projects', { eyebrow: v })} />
          </Field>
          <Field label="Title line 1">
            <TextInput value={c.projects.title} onChange={(v) => set('projects', { title: v })} />
          </Field>
          <Field label="Title line 2" hint="Shown in the accent colour.">
            <TextInput value={c.projects.titleAccent} onChange={(v) => set('projects', { titleAccent: v })} />
          </Field>
          <Field label="Lead paragraph" className="sm:col-span-2">
            <TextArea value={c.projects.lead} onChange={(v) => set('projects', { lead: v })} rows={2} />
          </Field>
        </div>
      </Section>

      <Section title="Reviews section" hint="The Kind words · 04 heading.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <TextInput value={c.reviews.eyebrow} onChange={(v) => set('reviews', { eyebrow: v })} />
          </Field>
          <Field label="Title line 1">
            <TextInput value={c.reviews.title} onChange={(v) => set('reviews', { title: v })} />
          </Field>
          <Field label="Title line 2" hint="Shown in the accent colour.">
            <TextInput value={c.reviews.titleAccent} onChange={(v) => set('reviews', { titleAccent: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Contact section" hint="The Let's talk · 05 heading and call to action.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <TextInput value={c.contact.eyebrow} onChange={(v) => set('contact', { eyebrow: v })} />
          </Field>
          <Field label="Title line 1">
            <TextInput value={c.contact.title} onChange={(v) => set('contact', { title: v })} />
          </Field>
          <Field label="Title line 2" hint="Shown in the accent colour.">
            <TextInput value={c.contact.titleAccent} onChange={(v) => set('contact', { titleAccent: v })} />
          </Field>
          <Field label="Call-to-action label">
            <TextInput value={c.contact.ctaLabel} onChange={(v) => set('contact', { ctaLabel: v })} />
          </Field>
          <Field label="Lead paragraph" className="sm:col-span-2">
            <TextArea value={c.contact.lead} onChange={(v) => set('contact', { lead: v })} rows={2} />
          </Field>
        </div>
      </Section>
    </>
  )
}

/* --------------------------------------------------------------- Settings */

export function SiteSettingsBar({ onToast }: { onToast: (m: string) => void }) {
  const { site, save, reset } = useSite()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => {
          save(site)
          onToast('Saved ✓')
        }}
        className="btn-ember !px-5 !py-2 !text-xs"
      >
        <Save size={14} /> Save changes
      </button>
      <button
        onClick={() => {
          if (confirm('Reset all site content to defaults? This cannot be undone.')) {
            reset()
            onToast('Content reset')
          }
        }}
        className="btn-ghost !px-5 !py-2 !text-xs"
      >
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  )
}
