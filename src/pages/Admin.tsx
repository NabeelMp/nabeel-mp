import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  Briefcase,
  ExternalLink,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Type,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import Stars from '../components/Stars'
import ThemeToggle from '../components/ThemeToggle'
import {
  CategoriesEditor,
  ContactEditor,
  GeneralEditor,
  HeroEditor,
  ProfileEditor,
  SectionsEditor,
  ServicesEditor,
  SiteSettingsBar,
} from '../components/admin/sections'
import { EmptyState, Field, ImageInput, PasswordInput, Section, TextArea, TextInput, Toast } from '../components/admin/ui'
import { createWork, deleteReview, deleteWork, listReviews, listWorks, uniqueSlug, updateWork } from '../lib/api'
import { changeCredentials, getDemoCredentials, resetDemoCredentials, signIn, signOut, useAdminSession } from '../lib/auth'
import { isSupabaseReady } from '../lib/supabase'
import { useSite } from '../lib/site'
import type { CategoryKey, NewWork, Review, Work } from '../lib/types'

type Tab = 'dashboard' | 'profile' | 'hero' | 'sections' | 'services' | 'disciplines' | 'contact' | 'works' | 'reviews' | 'general' | 'security'

const NAV: { group: string; items: { key: Tab; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { group: 'Overview', items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Site content',
    items: [
      { key: 'profile', label: 'Profile & About', icon: UserCog },
      { key: 'hero', label: 'Hero & Photos', icon: Sparkles },
      { key: 'sections', label: 'Section Copy', icon: Type },
      { key: 'services', label: 'Services & Process', icon: Wrench },
      { key: 'disciplines', label: 'Disciplines', icon: Layers },
      { key: 'contact', label: 'Contact', icon: Briefcase },
      { key: 'general', label: 'Footer & SEO', icon: Settings2 },
    ],
  },
  {
    group: 'Portfolio',
    items: [
      { key: 'works', label: 'Projects', icon: Boxes },
      { key: 'reviews', label: 'Reviews', icon: MessageSquareQuote },
    ],
  },
  { group: 'Account', items: [{ key: 'security', label: 'Security', icon: ShieldCheck }] },
]

/* -------------------------------------------------------------------- Login */

function Login() {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showChange, setShowChange] = useState(false)

  // Change-password state (available straight from the login screen).
  const [cpUser, setCpUser] = useState('')
  const [cpCurrent, setCpCurrent] = useState('')
  const [cpNext, setCpNext] = useState('')
  const [cpConfirm, setCpConfirm] = useState('')
  const [cpMsg, setCpMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [cpBusy, setCpBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await signIn(u, p)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const submitChange = async (e: FormEvent) => {
    e.preventDefault()
    setCpMsg(null)
    if (!cpNext || cpNext !== cpConfirm) {
      setCpMsg({ tone: 'err', text: 'New password and confirmation do not match' })
      return
    }
    setCpBusy(true)
    try {
      await changeCredentials({ username: isSupabaseReady ? undefined : cpUser || undefined, password: cpNext, current: cpCurrent || undefined })
      setCpCurrent('')
      setCpNext('')
      setCpConfirm('')
      setCpMsg({ tone: 'ok', text: 'Password updated — sign in with your new credentials.' })
    } catch (e) {
      setCpMsg({ tone: 'err', text: e instanceof Error ? e.message : 'Could not update password' })
    } finally {
      setCpBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-6">
      <div className="card grid w-full max-w-sm gap-4 p-8">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <p className="eyebrow">Restricted</p>
            <h1 className="mt-2 font-display text-5xl">Admin</h1>
          </div>
          <input className="input" placeholder={isSupabaseReady ? 'Email' : 'Username'} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required />
          <PasswordInput value={p} onChange={setP} placeholder="Password" autoComplete="current-password" />
          {err && <p className="text-sm text-ember">{err}</p>}
          <button className="btn-ember" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          {!isSupabaseReady && (
            <button type="button" onClick={() => setShowChange((v) => !v)} className="text-xs text-bone/50 hover:text-ember">
              {showChange ? '— Hide password options' : 'Change password'}
            </button>
          )}
          {!isSupabaseReady && (
            <p className="text-xs text-bone/40">
              Demo mode — username <span className="text-bone">{getDemoCredentials().username}</span> · password <span className="text-bone">{getDemoCredentials().password}</span>
            </p>
          )}
        </form>

        {!isSupabaseReady && showChange && (
          <motion.form
            onSubmit={submitChange}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid gap-3 overflow-hidden border-t border-line/10 pt-4"
          >
            <p className="eyebrow">Change password</p>
            <Field label="Username" hint="Leave blank to keep the current one.">
              <TextInput value={cpUser} onChange={setCpUser} placeholder={getDemoCredentials().username} />
            </Field>
            <Field label="Current password">
              <PasswordInput value={cpCurrent} onChange={setCpCurrent} autoComplete="current-password" />
            </Field>
            <Field label="New password">
              <PasswordInput value={cpNext} onChange={setCpNext} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password">
              <PasswordInput value={cpConfirm} onChange={setCpConfirm} autoComplete="new-password" />
            </Field>
            {cpMsg && <p className={`text-sm ${cpMsg.tone === 'ok' ? 'text-lime' : 'text-ember'}`}>{cpMsg.text}</p>}
            <button className="btn-ghost w-fit" disabled={cpBusy}>
              <KeyRound size={15} /> {cpBusy ? 'Updating…' : 'Update password'}
            </button>
          </motion.form>
        )}

        <Link to="/" className="text-center text-xs text-bone/40 hover:text-ember">
          ← Back to site
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Works */

const emptyWork = {
  title: '',
  category: 'branding' as CategoryKey,
  client: '',
  year: String(new Date().getFullYear()),
  summary: '',
  description: '',
  video_url: '',
  tags: '',
  cover_url: '',
  gallery: [] as string[],
}

type WorkDraft = typeof emptyWork

const toDraft = (w: Work): WorkDraft => ({
  title: w.title,
  category: w.category,
  client: w.client ?? '',
  year: w.year ?? '',
  summary: w.summary ?? '',
  description: w.description ?? '',
  video_url: w.video_url ?? '',
  tags: w.tags.join(', '),
  cover_url: w.cover_url ?? '',
  gallery: w.gallery.filter((g) => g && g !== w.cover_url),
})

function WorkEditor({ draft, setDraft, categories }: { draft: WorkDraft; setDraft: (d: WorkDraft) => void; categories: { key: CategoryKey; title: string }[] }) {
  const set = <K extends keyof WorkDraft>(k: K, v: WorkDraft[K]) => setDraft({ ...draft, [k]: v })
  const setGalleryAt = (i: number, v: string) => set('gallery', draft.gallery.map((g, k) => (k === i ? v : g)))
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *">
          <TextInput value={draft.title} onChange={(v) => set('title', v)} placeholder="Project title" />
        </Field>
        <Field label="Discipline">
          <select className="input" value={draft.category} onChange={(e) => set('category', e.target.value as CategoryKey)}>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Client">
          <TextInput value={draft.client} onChange={(v) => set('client', v)} />
        </Field>
        <Field label="Year">
          <TextInput value={draft.year} onChange={(v) => set('year', v)} />
        </Field>
      </div>
      <Field label="One-line summary">
        <TextInput value={draft.summary} onChange={(v) => set('summary', v)} />
      </Field>
      <Field label="Description" hint="Leave a blank line to start a new paragraph.">
        <TextArea value={draft.description} onChange={(v) => set('description', v)} rows={5} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Video URL" hint="YouTube, Vimeo or a direct .mp4">
          <TextInput value={draft.video_url} onChange={(v) => set('video_url', v)} />
        </Field>
        <Field label="Tags" hint="Comma separated">
          <TextInput value={draft.tags} onChange={(v) => set('tags', v)} placeholder="Identity, Print" />
        </Field>
      </div>
      <ImageInput label="Cover image" value={draft.cover_url} onChange={(v) => set('cover_url', v)} />
      <div className="grid gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">Gallery images</span>
        {draft.gallery.map((g, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <ImageInput label={`Image ${i + 1}`} value={g} onChange={(v) => setGalleryAt(i, v)} />
            </div>
            <button type="button" onClick={() => set('gallery', draft.gallery.filter((_, k) => k !== i))} className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Remove image">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set('gallery', [...draft.gallery, ''])} className="btn-ghost w-fit !px-4 !py-2 !text-xs">
          <Plus size={14} /> Add gallery image
        </button>
      </div>
    </>
  )
}

function WorksTab({ onToast }: { onToast: (m: string) => void }) {
  const { site } = useSite()
  const [works, setWorks] = useState<Work[]>([])
  const [filter, setFilter] = useState<CategoryKey | 'all'>('all')
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [draft, setDraft] = useState<WorkDraft>(emptyWork)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = () => listWorks().then(setWorks).catch(console.error)
  useEffect(() => {
    reload()
  }, [])

  const shown = filter === 'all' ? works : works.filter((w) => w.category === filter)

  const startNew = () => {
    setDraft({ ...emptyWork, category: site.categories[0]?.key ?? 'branding' })
    setEditingId(null)
    setStatus(null)
    setMode('new')
  }
  const startEdit = (w: Work) => {
    setDraft(toDraft(w))
    setEditingId(w.id)
    setStatus(null)
    setMode('edit')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    setBusy(true)
    try {
      const taken = works.filter((w) => w.id !== editingId && w.category === draft.category).map((w) => w.slug)
      const payload: NewWork = {
        title: draft.title.trim(),
        slug: uniqueSlug(draft.title, taken),
        category: draft.category,
        client: draft.client.trim() || null,
        year: draft.year.trim() || null,
        summary: draft.summary.trim() || null,
        description: draft.description.trim() || null,
        video_url: draft.video_url.trim() || null,
        tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
        cover_url: draft.cover_url.trim() || null,
        gallery: draft.gallery.map((g) => g.trim()).filter(Boolean),
      }
      if (mode === 'edit' && editingId) {
        await updateWork(editingId, payload)
        onToast('Project updated ✓')
      } else {
        await createWork(payload)
        onToast('Project published ✓')
      }
      await reload()
      setMode('list')
      setStatus(null)
    } catch (err) {
      setStatus(err instanceof Error ? `Error: ${err.message}` : 'Error saving project')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (w: Work) => {
    if (!confirm(`Delete "${w.title}"? Its reviews will be deleted too.`)) return
    await deleteWork(w.id)
    onToast('Project deleted')
    reload()
  }

  return (
    <div className="grid gap-6">
      <Section
        title="Projects"
        hint="Add, edit or remove portfolio works."
        aside={
          mode === 'list' ? (
            <button onClick={startNew} className="btn-ember !px-4 !py-2 !text-xs">
              <Plus size={14} /> New project
            </button>
          ) : (
            <button onClick={() => setMode('list')} className="btn-ghost !px-4 !py-2 !text-xs">
              Back to list
            </button>
          )
        }
      >
        {mode === 'list' ? (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {(['all', ...site.categories.map((c) => c.key)] as (CategoryKey | 'all')[]).map((k) => (
                <button key={k} onClick={() => setFilter(k)} className={`chip shrink-0 ${filter === k ? 'border-ember text-ember' : ''}`}>
                  {k === 'all' ? `All (${works.length})` : `${site.categories.find((c) => c.key === k)?.title ?? k} (${works.filter((w) => w.category === k).length})`}
                </button>
              ))}
            </div>
            <ul className="grid gap-3">
              {shown.map((w) => (
                <li key={w.id} className="flex items-center gap-4 rounded-2xl border border-line/10 bg-ash/40 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ash">{w.cover_url && <img src={w.cover_url} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{w.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">
                      {site.categories.find((c) => c.key === w.category)?.title ?? w.category} · {w.year}
                    </p>
                  </div>
                  <button onClick={() => startEdit(w)} className="btn-ghost !px-4 !py-2 !text-xs">
                    Edit
                  </button>
                  <Link to={`/projects/${w.category}/${w.slug}`} className="grid h-9 w-9 place-items-center rounded-full border border-line/15 hover:border-bone" aria-label="Open">
                    <ExternalLink size={14} />
                  </Link>
                  <button onClick={() => remove(w)} className="grid h-9 w-9 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
              {shown.length === 0 && (
                <li>
                  <EmptyState>No projects here yet — create one to get started.</EmptyState>
                </li>
              )}
            </ul>
          </>
        ) : (
          <form onSubmit={submit} className="grid gap-5">
            <WorkEditor draft={draft} setDraft={setDraft} categories={site.categories} />
            <div className="flex items-center justify-between gap-3 border-t border-line/10 pt-4">
              <span className="text-xs text-bone/50">{status}</span>
              <button className="btn-ember" disabled={busy}>
                <Save size={15} /> {busy ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Publish'}
              </button>
            </div>
          </form>
        )}
      </Section>
    </div>
  )
}

/* ----------------------------------------------------------------- Reviews */

function ReviewsTab({ onToast }: { onToast: (m: string) => void }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [works, setWorks] = useState<Work[]>([])
  useEffect(() => {
    listReviews().then(setReviews).catch(console.error)
    listWorks().then(setWorks).catch(console.error)
  }, [])
  const workById = useMemo(() => new Map(works.map((w) => [w.id, w])), [works])
  const remove = async (r: Review) => {
    if (!confirm(`Delete review by ${r.name}?`)) return
    await deleteReview(r.id)
    setReviews((rs) => rs.filter((x) => x.id !== r.id))
    onToast('Review deleted')
  }
  return (
    <Section title="Reviews" hint={`${reviews.length} total · star ratings are shown, only the best appear on the home page.`}>
      {reviews.length === 0 && <EmptyState>No reviews yet.</EmptyState>}
      <ul className="grid gap-3 md:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="grid gap-2 rounded-2xl border border-line/10 bg-ash/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">{r.position}</p>
              </div>
              <div className="flex items-center gap-3">
                <Stars value={r.rating} size={13} />
                <button onClick={() => remove(r)} className="grid h-8 w-8 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Delete review">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="text-sm text-bone/70">{r.message}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-bone/35">on {r.work_id ? workById.get(r.work_id)?.title ?? 'deleted work' : 'site'}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------------------------------------------------------------- Security */

function SecurityTab({ onToast }: { onToast: (m: string) => void }) {
  const creds = getDemoCredentials()
  const [username, setUsername] = useState(isSupabaseReady ? '' : creds.username)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!next || next !== confirmPw) {
      setErr('New password and confirmation do not match')
      return
    }
    setBusy(true)
    try {
      await changeCredentials({ username: isSupabaseReady ? undefined : username, password: next, current: current || undefined })
      setCurrent('')
      setNext('')
      setConfirmPw('')
      onToast('Credentials updated ✓')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update credentials')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Admin credentials" hint={isSupabaseReady ? 'Change the signed-in admin password (Supabase).' : 'Change the demo admin username and password.'}>
        <form onSubmit={submit} className="grid gap-4">
          {!isSupabaseReady && (
            <Field label="Username">
              <TextInput value={username} onChange={setUsername} />
            </Field>
          )}
          {!isSupabaseReady && (
            <Field label="Current password" hint="Required to confirm changes.">
              <PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" />
            </Field>
          )}
          <Field label="New password">
            <PasswordInput value={next} onChange={setNext} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput value={confirmPw} onChange={setConfirmPw} autoComplete="new-password" />
          </Field>
          {err && <p className="text-sm text-ember">{err}</p>}
          <button className="btn-ember w-fit" disabled={busy}>
            <KeyRound size={15} /> {busy ? 'Updating…' : 'Update credentials'}
          </button>
        </form>
      </Section>

      <Section title="Session & recovery" hint="Sign out or restore the default demo login.">
        <div className="grid gap-3">
          <button onClick={signOut} className="btn-ghost w-fit">
            <LogOut size={15} /> Sign out
          </button>
          {!isSupabaseReady && (
            <button
              onClick={() => {
                if (confirm('Restore the default demo login (admin / admin)?')) {
                  resetDemoCredentials()
                  onToast('Demo login restored')
                  window.location.reload()
                }
              }}
              className="btn-ghost w-fit"
            >
              <RotateCcw size={15} /> Restore default demo login
            </button>
          )}
          <p className="text-xs text-bone/40">
            {isSupabaseReady
              ? 'Admin access is enforced by Supabase Row Level Security and the is_admin() check.'
              : 'Demo mode stores content and credentials in this browser only (localStorage). Configure Supabase for production.'}
          </p>
        </div>
      </Section>
    </div>
  )
}

/* --------------------------------------------------------------- Dashboard */

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof BarChart3; label: string; value: string | number; accent?: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: `${accent ?? '#ff5a1f'}22`, color: accent ?? '#ff5a1f' }}>
        <Icon size={22} />
      </span>
      <div>
        <p className="font-display text-4xl leading-none">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-bone/45">{label}</p>
      </div>
    </div>
  )
}

function Dashboard({ go }: { go: (t: Tab) => void }) {
  const { site } = useSite()
  const [works, setWorks] = useState<Work[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  useEffect(() => {
    listWorks().then(setWorks).catch(console.error)
    listReviews().then(setReviews).catch(console.error)
  }, [])
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Projects" value={works.length} />
        <StatCard icon={MessageSquareQuote} label="Reviews" value={reviews.length} accent="#d7ff3a" />
        <StatCard icon={Star} label="Avg rating" value={avg} accent="#ffd23f" />
        <StatCard icon={Layers} label="Disciplines" value={site.categories.length} accent="#7cc6ff" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Section title="Projects by discipline" hint="Distribution of your portfolio.">
          <div className="grid gap-3">
            {site.categories.map((c) => {
              const n = works.filter((w) => w.category === c.key).length
              const pct = works.length ? Math.round((n / works.length) * 100) : 0
              return (
                <div key={c.key} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-bone/70">{c.title}</span>
                    <span className="text-bone/40">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ash">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c.accent }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Quick actions" hint="Jump straight to common tasks.">
          <div className="grid gap-2">
            {[
              { label: 'Edit profile & about', tab: 'profile' as Tab, icon: UserCog },
              { label: 'Manage projects', tab: 'works' as Tab, icon: Boxes },
              { label: 'Update services', tab: 'services' as Tab, icon: Wrench },
              { label: 'Footer & SEO', tab: 'general' as Tab, icon: Settings2 },
              { label: 'Change credentials', tab: 'security' as Tab, icon: ShieldCheck },
            ].map((a) => (
              <button key={a.tab} onClick={() => go(a.tab)} className="flex items-center gap-3 rounded-2xl border border-line/10 bg-ash/40 px-4 py-3 text-left text-sm text-bone/80 transition-colors hover:border-ember/40 hover:text-bone">
                <a.icon size={16} className="text-ember" /> {a.label}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Shell */

export default function Admin() {
  const session = useAdminSession()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const go = (t: Tab) => {
    setTab(t)
    setNavOpen(false)
  }

  if (session.loading) return <div className="grid min-h-screen place-items-center text-bone/50">Loading…</div>
  if (!session.isAdmin)
    return session.email && isSupabaseReady ? (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-bone/70">{session.email} is not an admin.</p>
          <button onClick={signOut} className="btn-ghost mt-4">
            Sign out
          </button>
        </div>
      </div>
    ) : (
      <Login />
    )

  const activeItem = NAV.flatMap((g) => g.items).find((i) => i.key === tab)

  return (
    <div className="min-h-screen bg-ink text-bone">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setNavOpen((o) => !o)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line/15 lg:hidden" aria-label="Toggle menu">
              {navOpen ? <X size={16} /> : <LayoutDashboard size={16} />}
            </button>
            <Link to="/" className="flex items-center gap-2" title="Back to portfolio">
              <span className="h-2 w-2 shrink-0 rounded-full bg-ember" />
              <span className="text-[11px] font-bold tracking-[0.4em]">NABEEL · ADMIN</span>
            </Link>
            {!isSupabaseReady && <span className="chip hidden !text-[9px] text-ember sm:inline-flex">demo mode</span>}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SiteSettingsBar onToast={setToast} />
            <Link to="/" className="btn-ghost !px-4 !py-2 !text-xs" title="Back to portfolio">
              <ArrowLeft size={14} /> <span className="hidden sm:inline">Exit</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-8 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className={`${navOpen ? 'block' : 'hidden'} lg:block`}>
          <nav className="grid gap-6 lg:sticky lg:top-24">
            {NAV.map((group) => (
              <div key={group.group} className="grid gap-1.5">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-bone/35">{group.group}</p>
                {group.items.map((it) => {
                  const active = tab === it.key
                  return (
                    <button
                      key={it.key}
                      onClick={() => go(it.key)}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${active ? 'bg-bone text-ink' : 'text-bone/70 hover:bg-ash hover:text-bone'}`}
                    >
                      <it.icon size={16} className={active ? 'text-ember' : ''} />
                      {it.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Panel */}
        <main className="min-w-0">
          {activeItem && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line/10 pb-5">
              <div>
                <p className="eyebrow">{NAV.find((g) => g.items.some((i) => i.key === tab))?.group}</p>
                <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">{activeItem.label}</h1>
              </div>
              <p className="text-xs text-bone/40">Changes save to this browser instantly.</p>
            </div>
          )}

          <div className="grid gap-6">
            {tab === 'dashboard' && <Dashboard go={go} />}
            {tab === 'profile' && <ProfileEditor />}
            {tab === 'hero' && <HeroEditor />}
            {tab === 'sections' && <SectionsEditor />}
            {tab === 'services' && <ServicesEditor />}
            {tab === 'disciplines' && <CategoriesEditor />}
            {tab === 'contact' && <ContactEditor />}
            {tab === 'general' && <GeneralEditor />}
            {tab === 'works' && <WorksTab onToast={setToast} />}
            {tab === 'reviews' && <ReviewsTab onToast={setToast} />}
            {tab === 'security' && <SecurityTab onToast={setToast} />}
          </div>
        </main>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
