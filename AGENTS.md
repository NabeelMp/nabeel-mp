# AGENTS.md

Portfolio site — React 19 + Vite + TypeScript + Tailwind + framer-motion +
react-router-dom + Supabase + lucide-react.

## Commands
- `npm run dev` — dev server (port 12000)
- `npm run build` — production build
- `npm run lint` — oxlint

## Structure
- `src/lib/site.ts` — single source of truth for editable site content
  (profile, hero, categories, contact, footer). Categories drive the
  Projects section; `key` is the URL slug, `title` is the displayed label.
- `src/lib/auth.ts` — admin auth. Supabase mode when `VITE_SUPABASE_URL` is
  set; otherwise demo mode with `admin`/`admin`. The default pair is always a
  valid master fallback so changing the demo password cannot lock the owner out.
- `src/pages/Admin.tsx` — admin panel (login + tabs).
- `src/components/Contact.tsx` — footer + contact section. Footer holds the
  admin lock link; the "Start a project" CTA is a mailto with both contact
  emails prefilled.

## Notes
- Persistence (demo mode, no Supabase env vars): site content, works and
  reviews live in an IndexedDB key/value store (`src/lib/store.ts`,
  DB `nabeel-store`) with a synchronous in-memory cache filled by
  `preloadStore()` before render. IndexedDB replaced localStorage because
  uploaded images are stored inline as data URLs and blow past the ~5 MB
  localStorage cap after a few works — every later save then threw
  `QuotaExceededError` and edits looked lost. `saveKey` now throws a clear
  "storage is full" error instead of failing silently.
- **Demo mode is per-browser.** IndexedDB and `sessionStorage` do not travel
  between browsers, devices or Chrome profiles, so admin edits made in demo mode
  are only visible in the browser that made them. To make edits show up for
  everyone, configure Supabase (below); every reader then loads shared content.
- **Where edits persist with Supabase configured:**
  - works → `public.works`, uploads → the `works` storage bucket
  - reviews → `public.reviews`
  - site copy, profile, hero, disciplines/categories, contact and footer → the
    single `public.site_meta` row (`id = 'default'`, whole document in the
    `content` jsonb). `SiteProvider` loads this on mount (`loadSiteRemote`) and
    every `update`/`save` writes it back, so a heading edited in the admin shows
    on any other browser/device.
  - Env: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, or the un-prefixed
    `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Re-run `supabase/schema.sql` to create
    the `site_meta` table and policies.
  - One-time migration: `migrateLocalToSupabase()` (`src/lib/api.ts`, called from
    `src/main.tsx`) uploads this browser's demo-mode works/reviews when the
    backend is configured but empty, so previously-only-local edits are not
    stranded.
- Uploads are downscaled before storing (`src/lib/image.ts`): raster images
  larger than 400 KB are re-encoded to a max 1600 px JPEG at quality 0.82, so
  many images fit and hundreds of works are possible. With Supabase configured,
  images go to the `works` storage bucket instead and are not inlined.
- **This is a client-side SPA, not a Next.js/SSR app.** It uses
  `@supabase/supabase-js` in the browser only. Do **not** add `@supabase/ssr`,
  `next/headers`, middleware, or `NEXT_PUBLIC_*` env vars — they do not apply to
  Vite and would break the build. Supabase's "create a Next.js app" snippets are
  for a different framework; the browser client here is `src/lib/supabase.ts`.
- Supabase keys: use the **public** key only (`sb_publishable_…` publishable key
  or the legacy anon JWT). Vite only exposes `VITE_`-prefixed variables, so set
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or
  `VITE_SUPABASE_PUBLISHABLE_KEY`). **Never** use the secret key
  (`sb_secret_…`) client-side — it bypasses RLS. Run `supabase/schema.sql` in the
  project's SQL editor to create `works`, `reviews`, `site_meta` and the storage
  bucket before edits can persist.
- Disciplines (categories) are fully editable in the admin — add, rename,
  re-key or delete any of them, and each can hold any number of works. There is
  no cap on the number of works or gallery images per work. The Supabase
  `works.category` column has no fixed `CHECK` constraint (schema.sql drops the
  legacy one), so new discipline keys persist.
- The work editor's gallery (`ImageGalleryEditor`) accepts a multi-file select
  in one click, with per-image progress, reorder, remove and "use as cover".
- Routing is client-side (`BrowserRouter`). Hosting must rewrite all paths to
  `/index.html` or deep links like `/admin` return the host's own 404 page.
  `vercel.json` provides that SPA rewrite. Do **not** use `window.location.reload()`
  for navigation/auth, because a full page load re-requests the route from the
  server and can 404 on hosts without the rewrite.
- Admin auth (`src/lib/auth.ts`) is fully client-side in demo mode: sign in and
  sign out update React state through a listener set, no reload. The demo
  session lives in `sessionStorage` (cleared when the tab/browser closes).
- The admin panel auto-locks: it signs out after `ADMIN_AUTO_LOCK_MS` (5 min)
  of inactivity, and immediately when the tab is hidden or the window unloads.
- Admin lock lives in the **footer only** (not the navbar).
- Local dev in this environment may need `server.allowedHosts = true` in
  `vite.config.ts` when accessed through the proxied work host. That change is
  environment-specific — don't commit it unless the project wants it permanent.
- Pushing from this environment is currently blocked: the remote URL embeds a
  `ghu_` token that GitHub rejects as `Bad credentials` ("Password
  authentication is not supported for Git operations"), and the managed
  `GITHUB_TOKEN` is empty here. The repo is public, so `git fetch`/`pull` work
  anonymously, but `git push` needs a valid PAT (or SSH) with
  `Contents: write` for `NabeelMp/nabeel-mp`.
