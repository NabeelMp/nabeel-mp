import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  Briefcase,
  ExternalLink,
  FileUp,
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
import { createWork, createWorks, deleteReview, deleteWork, listReviews, listWorks, uniqueSlug, updateWork, uploadMedia } from '../lib/api'
import { changeCredentials, getDemoCredentials, resetDemoCredentials, signIn, signOut, useAdminSession, useAutoLock } from '../lib/auth'
import { isSupabaseReady, supabase } from '../lib/supabase'
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot' | 'recovery'>(() => {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    return query.has('code') || hash.get('type') === 'recovery' ? 'recovery' : 'login'
  })
  const [err, setErr] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('recovery')
    })
    return () => data.subscription.unsubscribe()
  }, [])

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

  const sendRecovery = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setErr(null)
    setNotice(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(u.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      })
      if (error) throw error
      setNotice('If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not send a reset email')
    } finally {
      setBusy(false)
    }
  }

  const updatePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setErr(null)
    setNotice(null)
    if (p.length < 8) {
      setErr('Use a password with at least 8 characters.')
      return
    }
    if (p !== confirmPassword) {
      setErr('New password and confirmation do not match.')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: p })
      if (error) throw error
      window.history.replaceState({}, document.title, window.location.pathname)
      setP('')
      setConfirmPassword('')
      setMode('login')
      setNotice('Password updated. Sign in with your new password.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update password')
    } finally {
      setBusy(false)
    }
  }

  const recoveryMode = mode === 'forgot' || mode === 'recovery'
  const submitHandler = mode === 'forgot' ? sendRecovery : mode === 'recovery' ? updatePassword : submit

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-6">
      <div className="card grid w-full max-w-sm gap-4 p-8">
        <form onSubmit={submitHandler} className="grid gap-4">
          <div>
            <p className="eyebrow">Restricted</p>
            <h1 className="mt-2 font-display text-5xl">{mode === 'forgot' ? 'Reset password' : mode === 'recovery' ? 'Choose a password' : 'Admin'}</h1>
          </div>
          {mode !== 'recovery' && (
            <input
              className="input"
              type={isSupabaseReady ? 'email' : 'text'}
              placeholder={isSupabaseReady ? 'Email' : 'Username'}
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoComplete={isSupabaseReady ? 'email' : 'username'}
              required
            />
          )}
          {mode !== 'forgot' && (
            <PasswordInput
              value={p}
              onChange={setP}
              placeholder={mode === 'recovery' ? 'New password (8+ characters)' : 'Password'}
              autoComplete={mode === 'recovery' ? 'new-password' : 'current-password'}
            />
          )}
          {mode === 'recovery' && (
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" autoComplete="new-password" />
          )}
          {err && <p className="text-sm text-ember">{err}</p>}
          {notice && <p className="text-sm text-bone/70">{notice}</p>}
          <button className="btn-ember" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : mode === 'recovery' ? 'Update password' : 'Sign in'}
          </button>
        </form>

        {mode === 'login' && isSupabaseReady && (
          <button type="button" onClick={() => { setErr(null); setNotice(null); setMode('forgot') }} className="w-full text-center text-xs text-ember hover:text-bone">
            Forgot password?
          </button>
        )}
        {recoveryMode && (
          <button type="button" onClick={() => { setErr(null); setNotice(null); setMode('login') }} className="w-full text-center text-xs text-bone/40 hover:text-ember">
            ← Back to sign in
          </button>
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

function isVideoMedia(url: string) {
  if (url.startsWith('data:video/')) return true
  try {
    return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(url, window.location.origin).pathname)
  } catch {
    return false
  }
}

async function sampleVideoFrames(file: File): Promise<string[]> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.src = objectUrl
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('This video format could not be previewed for AI analysis.'))
    })
    if (!Number.isFinite(video.duration) || video.duration <= 0) return []
    const times = [...new Set([video.duration * 0.15, video.duration * 0.5, video.duration * 0.85].map((time) => Math.min(time, Math.max(0, video.duration - 0.1))))]
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 640 / (video.videoWidth || 640))
    canvas.width = Math.max(1, Math.round((video.videoWidth || 640) * scale))
    canvas.height = Math.max(1, Math.round((video.videoHeight || 360) * scale))
    const context = canvas.getContext('2d')
    if (!context) return []
    const frames: string[] = []
    for (const time of times) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve()
        video.onerror = () => reject(new Error('Could not read a video frame.'))
        video.currentTime = time
      })
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      frames.push(canvas.toDataURL('image/jpeg', 0.68))
    }
    return frames
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
      row = []; cell = ''
    } else cell += char
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
  return rows
}

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
  const [mediaBusy, setMediaBusy] = useState(false)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiNotes, setAiNotes] = useState('')
  const [videoFrames, setVideoFrames] = useState<string[]>([])
  const set = <K extends keyof WorkDraft>(k: K, v: WorkDraft[K]) => setDraft({ ...draft, [k]: v })
  const addMedia = async (files: FileList | null) => {
    if (!files?.length) return
    const selected = Array.from(files)
    setMediaBusy(true)
    setMediaStatus(`Uploading ${selected.length} file${selected.length === 1 ? '' : 's'}…`)
    setAiError(null)
    try {
      const sampledFrames = await Promise.all(selected.filter((file) => file.type.startsWith('video/')).map((file) => sampleVideoFrames(file).catch(() => [])))
      let coverUrl = draft.cover_url
      let videoUrl = draft.video_url
      const gallery = [...draft.gallery]
      let uploaded = 0
      for (const file of selected) {
        const url = await uploadMedia(file)
        if (file.type.startsWith('image/')) {
          if (!coverUrl) coverUrl = url
          else gallery.push(url)
        } else if (file.type.startsWith('video/')) {
          if (!videoUrl) videoUrl = url
          else gallery.push(url)
        } else {
          continue
        }
        uploaded += 1
        setMediaStatus(`Uploaded ${uploaded} of ${selected.length} files…`)
      }
      setDraft({ ...draft, cover_url: coverUrl, video_url: videoUrl, gallery })
      setVideoFrames((current) => [...current, ...sampledFrames.flat()].slice(0, 9))
      setMediaStatus(`${uploaded} media file${uploaded === 1 ? '' : 's'} added.`)
    } catch (error) {
      setMediaStatus(error instanceof Error ? error.message : 'Media upload failed.')
    } finally {
      setMediaBusy(false)
    }
  }
  const generateWithAI = async () => {
    if (!supabase) {
      setAiError('AI generation requires the shared Supabase admin login.')
      return
    }
    const imageUrls = [draft.cover_url, ...draft.gallery].filter((url) => url && !isVideoMedia(url)).slice(0, 7)
    const media = [...imageUrls, ...videoFrames].slice(0, 10)
    if (!media.length) {
      setAiError('Upload at least one image or video first. Video analysis uses a few sampled frames.')
      return
    }
    setAiBusy(true)
    setAiError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Your admin session expired. Sign in again.')
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ title: draft.title, category: draft.category, client: draft.client, year: draft.year, notes: aiNotes, categories, media }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'AI generation failed.')
      setDraft({
        ...draft,
        title: result.title || draft.title,
        category: result.category || draft.category,
        summary: result.summary || draft.summary,
        description: result.description || draft.description,
        tags: Array.isArray(result.tags) ? result.tags.join(', ') : draft.tags,
      })
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI generation failed.')
    } finally {
      setAiBusy(false)
    }
  }
  return (
    <>
      <div className="rounded-2xl border border-ember/25 bg-ember/[0.06] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">AI project assistant</p>
            <p className="mt-1 text-xs text-bone/50">Generate a title, category, summary, description and keywords from your media. Review the draft before saving.</p>
          </div>
          <button type="button" onClick={() => void generateWithAI()} disabled={aiBusy || mediaBusy} className="btn-ember !px-4 !py-2 !text-xs">
            <Sparkles size={14} /> {aiBusy ? 'Analyzing media…' : 'Generate details'}
          </button>
        </div>
        <div className="mt-3">
          <TextInput value={aiNotes} onChange={setAiNotes} placeholder="Optional notes for the AI (project goal, audience, style…)" />
        </div>
        <p className="mt-2 text-[11px] text-bone/40">Selected images and sampled video frames are sent to OpenAI only when you generate. Client and year are never guessed.</p>
        {aiError && <p className="mt-2 text-xs text-ember">{aiError}</p>}
      </div>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">Project media</span>
          <label className={`btn-ghost w-fit cursor-pointer !px-4 !py-2 !text-xs ${mediaBusy ? 'pointer-events-none opacity-50' : ''}`}>
            <FileUp size={14} /> {mediaBusy ? 'Uploading…' : 'Choose images & videos'}
            <input type="file" accept="image/*,video/*" multiple className="hidden" disabled={mediaBusy} onChange={(event) => { void addMedia(event.target.files); event.target.value = '' }} />
          </label>
        </div>
        <p className="text-[11px] text-bone/40">Select several images and videos together. The first image fills the cover if empty; the first video fills Video URL and the rest appear in the gallery.</p>
        {mediaStatus && <p className="text-xs text-bone/60">{mediaStatus}</p>}
        {draft.gallery.map((g, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Media ${i + 1}`}>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-line/10 bg-ash">
                    {isVideoMedia(g) ? <video src={g} muted playsInline className="h-full w-full object-cover" /> : <img src={g} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <input className="input min-w-0 flex-1" value={g} onChange={(event) => set('gallery', draft.gallery.map((item, index) => index === i ? event.target.value : item))} />
                </div>
              </Field>
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
  const [importBusy, setImportBusy] = useState(false)

  const reload = () => listWorks().then(setWorks).catch(console.error)
  useEffect(() => {
    reload()
  }, [])

  const shown = filter === 'all' ? works : works.filter((w) => w.category === filter)

  const importCsv = async (file?: File) => {
    if (!file) return
    setImportBusy(true)
    setStatus(null)
    try {
      const [headerRow, ...rows] = parseCsv(await file.text())
      const headers = (headerRow ?? []).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '_'))
      const column = (r: string[], name: string) => r[headers.indexOf(name)]?.trim() ?? ''
      const taken = new Map<string, Set<string>>()
      for (const work of works) {
        if (!taken.has(work.category)) taken.set(work.category, new Set())
        taken.get(work.category)!.add(work.slug)
      }
      const imported: NewWork[] = rows.map((r) => {
        const category = column(r, 'category') as CategoryKey
        if (!column(r, 'title')) throw new Error('Every row needs a title.')
        if (!site.categories.some((c) => c.key === category)) throw new Error(`Unknown category "${category}". Use a category key from the site.`)
        const slugs = taken.get(category) ?? new Set<string>()
        const slug = uniqueSlug(column(r, 'slug') || column(r, 'title'), slugs)
        slugs.add(slug); taken.set(category, slugs)
        return {
          title: column(r, 'title'), slug, category,
          client: column(r, 'client') || null, year: column(r, 'year') || null,
          summary: column(r, 'summary') || null, description: column(r, 'description') || null,
          video_url: column(r, 'video_url') || null, cover_url: column(r, 'cover_url') || null,
          tags: (column(r, 'tags') || '').split('|').map((t) => t.trim()).filter(Boolean),
          gallery: (column(r, 'gallery') || '').split('|').map((g) => g.trim()).filter(Boolean),
        }
      })
      await createWorks(imported)
      await reload()
      onToast(`${imported.length} projects imported ✓`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not import CSV')
    } finally {
      setImportBusy(false)
    }
  }

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
            <div className="flex flex-wrap gap-2">
              <label className="btn-ghost !px-4 !py-2 !text-xs cursor-pointer">
                <FileUp size={14} /> {importBusy ? 'Importing…' : 'Import CSV'}
                <input type="file" accept=".csv,text/csv" className="hidden" disabled={importBusy} onChange={(e) => { void importCsv(e.target.files?.[0]); e.target.value = '' }} />
              </label>
              <button onClick={startNew} className="btn-ember !px-4 !py-2 !text-xs">
                <Plus size={14} /> New project
              </button>
            </div>
          ) : (
            <button onClick={() => setMode('list')} className="btn-ghost !px-4 !py-2 !text-xs">
              Back to list
            </button>
          )
        }
      >
        {mode === 'list' ? (
          <>
            <p className="text-xs text-bone/45">Import a CSV with columns: title, category, client, year, summary, description, video_url, cover_url, tags and gallery. Separate multiple tags or gallery URLs with |. No app-level row limit.</p>
            {status && <p className="text-sm text-ember">{status}</p>}
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

      <Section title="Session & recovery" hint="Sign out or reset the demo login to its original credentials.">
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
  const { syncStatus } = useSite()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  useAutoLock(session.isAdmin)
  const go = (t: Tab) => {
    setTab(t)
    setNavOpen(false)
  }

  const authQuery = new URLSearchParams(window.location.search)
  const authHash = new URLSearchParams(window.location.hash.slice(1))
  const isRecoveryRedirect = authQuery.has('code') || authHash.get('type') === 'recovery'

  if (isSupabaseReady && isRecoveryRedirect) return <Login />

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
        {(!isSupabaseReady || syncStatus === 'error') && (
          <div className="rounded-2xl border border-ember/35 bg-ember/10 px-5 py-4 text-sm text-bone/80 lg:col-span-2">
            <p className="font-semibold text-ember">{!isSupabaseReady ? 'Changes are saved only in this browser' : 'Shared database needs attention'}</p>
            <p className="mt-1 text-xs leading-relaxed text-bone/65">
              {!isSupabaseReady
                ? 'Projects, uploads and site edits are not shared across browsers yet. Connect Supabase in the Vercel project and run supabase/schema.sql to enable shared updates.'
                : 'The shared site settings could not be loaded or saved. Check the Supabase project configuration and schema.'}
            </p>
          </div>
        )}
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
