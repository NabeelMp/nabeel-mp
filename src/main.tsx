import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { migrateLocalToSupabase } from './lib/api'
import { preloadStore } from './lib/store'
import { SITE_KEY, SiteProvider } from './lib/site'
import { ThemeProvider } from './lib/theme'

const STORE_KEYS = [SITE_KEY, 'nabeel.works', 'nabeel.reviews', 'nabeel.demoCreds']

// Load persisted content (migrating legacy localStorage data) before the first
// render so the synchronous read paths resolve against a warm cache.
preloadStore(STORE_KEYS).finally(() => {
  // When Supabase is configured but still empty, publish any content this
  // browser has locally (one-time) before the app renders its data.
  void migrateLocalToSupabase()
    .catch((err) => console.warn('Local→Supabase migration skipped:', err))
    .finally(() => {
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <ThemeProvider>
            <SiteProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </SiteProvider>
          </ThemeProvider>
        </StrictMode>,
      )
    })
})
