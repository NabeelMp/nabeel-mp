import { useState, type FormEvent } from 'react'
import { addReview } from '../lib/api'
import type { Review } from '../lib/types'
import Stars from './Stars'

export default function ReviewForm({ workId, onAdded }: { workId: string; onAdded: (r: Review) => void }) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setState('saving')
    try {
      const r = await addReview({ work_id: workId, name: name.trim(), position: position.trim() || null, rating, message: message.trim() })
      onAdded(r)
      setName('')
      setPosition('')
      setMessage('')
      setRating(5)
      setState('done')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-3xl">Leave your opinion</h3>
        <Stars value={rating} onChange={setRating} size={22} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="input" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
        <input className="input" placeholder="Position (e.g. Founder, Acme)" value={position} onChange={(e) => setPosition(e.target.value)} maxLength={80} />
      </div>
      <textarea className="input min-h-[120px] resize-y" placeholder="What did you think of this work? *" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={800} required />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-bone/40">
          {state === 'done' ? 'Thanks! Your review is live.' : state === 'error' ? 'Something went wrong — please try again.' : '5-star reviews also appear on the home page.'}
        </p>
        <button className="btn-ember" disabled={state === 'saving'}>
          {state === 'saving' ? 'Posting…' : 'Post review'}
        </button>
      </div>
    </form>
  )
}
