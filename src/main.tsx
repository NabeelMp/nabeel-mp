import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { preloadStore } from './lib/store'
import { SITE_KEY, SiteProvider } from './lib/site'
import { ThemeProvider } from './lib/theme'

const STORE_KEYS = [SITE_KEY, 'nabeel.works', 'nabeel.reviews', 'nabeel.demoCreds']

// Load persisted content (migrating legacy localStorage data) before the first
// render so the synchronous read paths resolve against a warm cache.
preloadStore(STORE_KEYS).finally(() => {
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
