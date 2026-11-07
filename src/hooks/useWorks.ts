import { useEffect, useState } from 'react'
import { listWorks, subscribeToWorks } from '../lib/api'
import type { CategoryKey, Work } from '../lib/types'

/** Loads works once and refreshes the list when the shared portfolio changes. */
export function useWorks(category?: CategoryKey) {
  const [works, setWorks] = useState<Work[] | null>(null)

  useEffect(() => {
    let active = true
    let latestRequest = 0
    const refresh = () => {
      const request = ++latestRequest
      void listWorks(category)
        .then((next) => { if (active && request === latestRequest) setWorks(next) })
        .catch((error) => {
          console.error('Could not load portfolio projects:', error)
          if (active && request === latestRequest) setWorks([])
        })
    }
    refresh()
    const unsubscribe = subscribeToWorks(refresh)
    return () => {
      active = false
      unsubscribe()
    }
  }, [category])

  return works
}

