/**
 * IndexedDB-backed key/value store with a synchronous in-memory cache.
 *
 * Site content used to live in localStorage, which is capped around 5 MB. That
 * is too small once uploaded images are stored inline as data URLs — a couple
 * of photos fill it and every later save throws, silently losing edits.
 *
 * IndexedDB gives roughly half the free disk, so it is now the source of truth.
 * Reads still go through the cache, so existing synchronous call sites keep
 * working; the cache is filled once by `preloadStore()` before the app renders.
 */
const DB_NAME = 'nabeel-store'
const DB_VERSION = 1
const STORE = 'kv'
const OPEN_TIMEOUT_MS = 2000

const cache = new Map<string, unknown>()
let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      let settled = false
      const done = (db: IDBDatabase | null) => {
        if (settled) return
        settled = true
        resolve(db)
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
          const db = req.result
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
        }
        req.onsuccess = () => done(req.result)
        req.onerror = () => done(null)
        req.onblocked = () => done(null)
      } catch {
        done(null)
      }
      setTimeout(() => done(null), OPEN_TIMEOUT_MS)
    })
  }
  return dbPromise
}

function run<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = op(tx.objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

export function cacheGet<T>(key: string): T | null {
  return cache.has(key) ? (cache.get(key) as T) : null
}

/**
 * Loads the given keys into the cache. Values written by the previous
 * localStorage-backed build are migrated into IndexedDB and then removed from
 * localStorage. When IndexedDB is unavailable the cache is filled straight
 * from localStorage so the app still works (private mode, very old browsers).
 */
export async function preloadStore(keys: string[]): Promise<void> {
  const db = await openDb()
  if (db) {
    await Promise.all(
      keys.map(async (key) => {
        try {
          const value = await run<unknown>(db, 'readonly', (s) => s.get(key))
          if (value !== undefined && value !== null) {
            cache.set(key, value)
            return
          }
        } catch {
          /* fall through to legacy migration */
        }
        try {
          const legacy = localStorage.getItem(key)
          if (legacy === null) return
          const parsed = JSON.parse(legacy) as unknown
          cache.set(key, parsed)
          await run(db, 'readwrite', (s) => s.put(parsed, key))
          localStorage.removeItem(key)
        } catch {
          /* ignore malformed legacy value */
        }
      }),
    )
    return
  }
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) cache.set(key, JSON.parse(raw) as unknown)
    } catch {
      /* ignore malformed value */
    }
  }
}

export async function saveKey(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  if (db) {
    try {
      await run(db, 'readwrite', (s) => s.put(value, key))
      cache.set(key, value)
      return
    } catch {
      /* fall through to localStorage so the write is not lost */
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error('Browser storage is full — remove some images or connect Supabase storage.')
  }
  cache.set(key, value)
}

export async function removeKey(key: string): Promise<void> {
  cache.delete(key)
  const db = await openDb()
  if (db) {
    try {
      await run(db, 'readwrite', (s) => s.delete(key))
      return
    } catch {
      /* ignore */
    }
  }
  localStorage.removeItem(key)
}
