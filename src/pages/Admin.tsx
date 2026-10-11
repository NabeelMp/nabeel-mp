import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, LogOut, Plus, Trash2, Upload } from 'lucide-react'
import Stars from '../components/Stars'
import { categories, categoryByKey } from '../lib/data'
import { createWork, deleteReview, deleteWork, listReviews, listWorks, slugify, uploadMedia } from '../lib/api'
import { signIn, signOut, useAdminSession } from '../lib/auth'
import { isSupabaseReady } from '../lib/supabase'
import type { CategoryKey, Review, Work } from '../lib/types'

function Login() {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
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
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-6">
      <form onSubmit={submit} className="card grid w-full max-w-sm gap-4 p-8">
        <div>
          <p className="eyebrow">Restricted</p>
          <h1 className="mt-2 font-display text-5xl">Admin</h1>
        </div>
        <input className="input" placeholder={isSupabaseReady ? 'Email' : 'Username'} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required />
        <input className="input" type="password" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
        {err && <p className="text-sm text-ember">{err}</p>}
        <button className="btn-ember" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {!isSupabaseReady && <p className="text-xs text-bone/40">Demo mode (Supabase not configured): admin / admin</p>}
        <Link to="/" className="text-center text-xs text-bone/40 hover:text-ember">
          ← Back to site
        </Link>
      </form>
    </div>
  )
}

const empty = { title: '', category: 'branding' as CategoryKey, client: '', year: String(new Date().getFullYear()), summary: '', description: '', video_url: '', tags: '' }

function WorkForm({ onCreated }: { onCreated: (w: Work) => void }) {
  const [f, setF] = useState(empty)
  const [cover, setCover] = useState<File | null>(null)
  const [gallery, setGallery] = useState<File[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setStatus('Uploading media…')
      const cover_url = cover ? await uploadMedia(cover) : null
      const galleryUrls: string[] = []
      for (const g of gallery) galleryUrls.push(await uploadMedia(g))
      setStatus('Saving…')
      const w = await createWork({
        title: f.title.trim(),
        slug: slugify(f.title),
        category: f.category,
        client: f.client.trim() || null,
        year: f.year.trim() || null,
        summary: f.summary.trim() || null,
        description: f.description.trim() || null,
        video_url: f.video_url.trim() || null,
        tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
        cover_url,
        gallery: galleryUrls,
      })
      onCreated(w)
      setF(empty)
      setCover(null)
      setGallery([])
      ;(e.target as HTMLFormElement).reset()
      setStatus('Published ✓')
    } catch (err) {
      setStatus(err instanceof Error ? `Error: ${err.message}` : 'Error saving work')
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-6">
      <h2 className="flex items-center gap-2 font-display text-3xl">
        <Plus size={22} /> Add work
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="input" placeholder="Title *" value={f.title} onChange={set('title')} required />
        <select className="input" value={f.category} onChange={set('category')}>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.title}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Client" value={f.client} onChange={set('client')} />
        <input className="input" placeholder="Year" value={f.year} onChange={set('year')} />
      </div>
      <input className="input" placeholder="One-line summary" value={f.summary} onChange={set('summary')} />
      <textarea className="input min-h-[120px]" placeholder="Description (blank line = new paragraph)" value={f.description} onChange={set('description')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="input" placeholder="Video URL (YouTube, Vimeo or .mp4)" value={f.video_url} onChange={set('video_url')} />
        <input className="input" placeholder="Tags, comma separated" value={f.tags} onChange={set('tags')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="input flex cursor-pointer items-center gap-2 text-bone/60">
          <Upload size={16} /> {cover ? cover.name : 'Cover image'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        </label>
        <label className="input flex cursor-pointer items-center gap-2 text-bone/60">
          <Upload size={16} /> {gallery.length ? `${gallery.length} gallery files` : 'Gallery images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setGallery(Array.from(e.target.files ?? []))} />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-bone/50">{status}</span>
        <button className="btn-ember">Publish</button>
      </div>
    </form>
  )
}

export default function Admin() {
  const session = useAdminSession()
  const [works, setWorks] = useState<Work[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [tab, setTab] = useState<'works' | 'reviews'>('works')
  const [filter, setFilter] = useState<CategoryKey | 'all'>('all')

  useEffect(() => {
    if (!session.isAdmin) return
    listWorks().then(setWorks)
    listReviews().then(setReviews)
  }, [session.isAdmin])

  const workById = useMemo(() => new Map(works.map((w) => [w.id, w])), [works])
  const shown = filter === 'all' ? works : works.filter((w) => w.category === filter)

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

  const removeWork = async (w: Work) => {
    if (!confirm(`Delete "${w.title}"? Its reviews will be deleted too.`)) return
    await deleteWork(w.id)
    setWorks((ws) => ws.filter((x) => x.id !== w.id))
    setReviews((rs) => rs.filter((r) => r.work_id !== w.id))
  }
  const removeReview = async (r: Review) => {
    if (!confirm(`Delete review by ${r.name}?`)) return
    await deleteReview(r.id)
    setReviews((rs) => rs.filter((x) => x.id !== r.id))
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-10 border-b border-bone/10 bg-ink/80 backdrop-blur-xl">
        <div className="container-x flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-ember" />
            <span className="text-[11px] font-bold tracking-[0.4em]">NABEEL · ADMIN</span>
            {!isSupabaseReady && <span className="chip !text-[9px] text-ember">demo mode</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost !px-4 !py-2 !text-xs">
              <ExternalLink size={14} /> View site
            </Link>
            <button onClick={signOut} className="btn-ghost !px-4 !py-2 !text-xs">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-10">
        <div className="flex gap-2">
          {(['works', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`btn !px-5 !py-2 !text-sm ${tab === t ? 'bg-bone text-ink' : 'border border-bone/15 text-bone/70'}`}>
              {t === 'works' ? `Works (${works.length})` : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {tab === 'works' ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <WorkForm onCreated={(w) => setWorks((ws) => [w, ...ws])} />
            <div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
                {(['all', ...categories.map((c) => c.key)] as const).map((k) => (
                  <button key={k} onClick={() => setFilter(k)} className={`chip shrink-0 ${filter === k ? 'border-ember text-ember' : ''}`}>
                    {k === 'all' ? 'All' : categoryByKey(k)?.title}
                  </button>
                ))}
              </div>
              <ul className="mt-4 grid gap-3">
                {shown.map((w) => (
                  <li key={w.id} className="card flex items-center gap-4 p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ash">{w.cover_url && <img src={w.cover_url} alt="" className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{w.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">
                        {categoryByKey(w.category)?.title} · {w.year}
                      </p>
                    </div>
                    <Link to={`/projects/${w.category}/${w.slug}`} className="grid h-9 w-9 place-items-center rounded-full border border-bone/15 hover:border-bone" aria-label="Open">
                      <ExternalLink size={14} />
                    </Link>
                    <button onClick={() => removeWork(w)} className="grid h-9 w-9 place-items-center rounded-full border border-bone/15 text-ember hover:bg-ember hover:text-ink" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
                {shown.length === 0 && <li className="card p-6 text-bone/50">No works here yet.</li>}
              </ul>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="card grid gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">{r.position}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars value={r.rating} size={13} />
                    <button onClick={() => removeReview(r)} className="grid h-8 w-8 place-items-center rounded-full border border-bone/15 text-ember hover:bg-ember hover:text-ink" aria-label="Delete review">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-bone/70">{r.message}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-bone/35">on {r.work_id ? workById.get(r.work_id)?.title ?? 'deleted work' : 'site'}</p>
              </li>
            ))}
            {reviews.length === 0 && <li className="card p-6 text-bone/50">No reviews yet.</li>}
          </ul>
        )}
      </main>
    </div>
  )
}
