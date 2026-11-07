import { Link } from 'react-router-dom'
import { useSite } from '../lib/site'
import { useWorks } from '../hooks/useWorks'
import { Reveal, SplitWords } from './Reveal'

function isVideoUrl(src: string) {
  if (src.startsWith('data:video/')) return true
  try {
    return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(src, window.location.origin).pathname)
  } catch {
    return false
  }
}

export default function Projects() {
  const { site } = useSite()
  const copy = site.content.projects
  const loadedWorks = useWorks()
  const works = loadedWorks ?? []
  const images = works.flatMap((work) =>
    [...new Set([work.cover_url, ...work.gallery].filter((src): src is string => typeof src === 'string' && src.length > 0 && !isVideoUrl(src)))].map((src) => ({ work, src })),
  )

  return (
    <section id="projects" className="relative bg-ink py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">{copy.eyebrow}</p>
            </Reveal>
            <h2 className="h-section mt-4">
              <SplitWords text={copy.title} />
              <br />
              <SplitWords text={copy.titleAccent} className="text-ember" delay={0.1} />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-[15px] text-bone/55">{copy.lead}</p>
          </Reveal>
        </div>

        {loadedWorks === null ? (
          <div className="mt-14 columns-1 gap-5 sm:columns-2 xl:columns-3" aria-label="Loading project gallery">
            {[0, 1, 2].map((item) => <div key={item} className="mb-5 h-72 break-inside-avoid animate-pulse rounded-2xl bg-coal" />)}
          </div>
        ) : images.length > 0 ? (
          <div className="mt-14 columns-1 gap-5 sm:columns-2 xl:columns-3">
            {images.map(({ work, src }, index) => (
              <Link
                key={`${work.id}-${src}`}
                to={`/projects/${work.category}/${work.slug}`}
                className="group mb-5 block break-inside-avoid rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                aria-label={`Open ${work.title}`}
              >
                <img
                  src={src}
                  alt={work.title}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block h-auto w-full rounded-2xl bg-coal/40"
                />
                <p className="mt-3 text-sm font-medium text-bone transition-colors duration-200 group-hover:text-ember">{work.title}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-14 text-sm text-bone/50">No project images have been added yet.</p>
        )}
      </div>
    </section>
  )
}
