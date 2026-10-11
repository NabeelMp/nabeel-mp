import { Star } from 'lucide-react'

export default function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-1" role={onChange ? 'radiogroup' : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        const icon = <Star size={size} className={filled ? 'fill-ember text-ember' : 'text-bone/25'} />
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star`} onClick={() => onChange(n)} className="transition-transform hover:scale-125">
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        )
      })}
    </div>
  )
}
