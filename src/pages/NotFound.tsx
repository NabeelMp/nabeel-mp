import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-6 text-center">
      <div>
        <p className="font-display text-[clamp(6rem,25vw,16rem)] leading-none text-ember">404</p>
        <p className="font-hand text-3xl text-bone/70">Oops — this page snapped out of existence.</p>
        <Link to="/" className="btn-ember mt-8">
          Back home
        </Link>
      </div>
    </div>
  )
}
