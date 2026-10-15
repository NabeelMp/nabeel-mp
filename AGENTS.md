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
- The environment's `GITHUB_TOKEN` is an integration token with read-only
  contents (`403 Resource not accessible by integration`). To push, use a PAT
  with `Contents: write` for `NabeelMp/nabeel-mp`.
