import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { uploadMedia } from '../../lib/api'

export function Section({ title, hint, children, aside }: { title: string; hint?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/10 px-6 py-5">
        <div>
          <h2 className="font-display text-2xl leading-none">{title}</h2>
          {hint && <p className="mt-1 text-xs text-bone/45">{hint}</p>}
        </div>
        {aside}
      </header>
      <div className="grid gap-5 p-6">{children}</div>
    </motion.section>
  )
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1.5 ${className ?? ''}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-bone/35">{hint}</span>}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <input className="input" type={type} value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} />
}

/** Password field with a show/hide toggle. */
export function PasswordInput({ value, onChange, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        className="input pr-11"
        type={show ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-bone/40 transition-colors hover:text-bone"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea className="input resize-y" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      className="input"
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
    />
  )
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line/10 bg-ash px-3 py-2">
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-mono text-xs uppercase text-bone outline-none" />
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? 'border-ember bg-ember' : 'border-line/20 bg-ash'}`}>
      <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-bone ${checked ? 'right-0.5' : 'left-0.5'}`} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
    </button>
  )
}

/** Repeatable list of plain strings (roles, values, process steps, emails, tags). */
export function StringListEditor({ items, onChange, placeholder, addLabel = 'Add item' }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string }) {
  const setAt = (i: number, v: string) => onChange(items.map((x, k) => (k === i ? v : x)))
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i))
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="input" value={it} placeholder={placeholder} onChange={(e) => setAt(i, e.target.value)} />
          <button type="button" onClick={() => remove(i)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Remove">
            <X size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="btn-ghost mt-1 w-fit !px-4 !py-2 !text-xs">
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}

/** Editable rows for objects with a fixed set of string keys. */
export function RecordListEditor<T extends Record<string, string>>({
  items,
  onChange,
  fields,
  blank,
  addLabel = 'Add row',
  title,
}: {
  items: T[]
  onChange: (v: T[]) => void
  fields: { key: keyof T; label: string; placeholder?: string; grow?: boolean }[]
  blank: T
  addLabel?: string
  title?: (item: T, i: number) => string
}) {
  const setAt = (i: number, key: keyof T, v: string) => onChange(items.map((row, k) => (k === i ? { ...row, [key]: v } : row)))
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i))
  return (
    <div className="grid gap-3">
      {items.map((row, i) => (
        <div key={i} className="rounded-2xl border border-line/10 bg-ash/50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/40">{title ? title(row, i) : `Row ${i + 1}`}</span>
            <button type="button" onClick={() => remove(i)} className="grid h-8 w-8 place-items-center rounded-full border border-line/15 text-ember transition-colors hover:bg-ember hover:text-onaccent" aria-label="Remove row">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <input
                key={String(f.key)}
                className={`input ${f.grow ? 'sm:col-span-2' : ''}`}
                value={row[f.key] ?? ''}
                placeholder={f.placeholder ?? f.label}
                onChange={(e) => setAt(i, f.key, e.target.value)}
              />
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { ...blank }])} className="btn-ghost w-fit !px-4 !py-2 !text-xs">
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}

/** Uploads a file (Supabase storage when configured, data URL in demo mode). */
export function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      onChange(await uploadMedia(file))
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }
  return (
    <div className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/50">{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line/10 bg-ash">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="grid gap-1">
          <label className="btn-ghost w-fit cursor-pointer !px-4 !py-2 !text-xs">
            <ImagePlus size={14} /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input type="file" accept="image/*" className="hidden" onChange={pick} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-[11px] text-ember hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>
      <input className="input !py-2 !text-xs" value={value} placeholder="…or paste an image URL" onChange={(e) => onChange(e.target.value)} />
      {err && <span className="text-[11px] text-ember">{err}</span>}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line/15 p-8 text-center text-sm text-bone/45">{children}</p>
}

/** Small transient toast for save confirmations. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-ember/40 bg-ink/90 px-5 py-2 text-sm text-bone shadow-[0_10px_40px_rgba(255,90,31,.25)] backdrop-blur">
      {message}
    </motion.div>
  )
}
