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
- Admin lock lives in the **footer only** (not the navbar).
- Local dev in this environment may need `server.allowedHosts = true` in
  `vite.config.ts` when accessed through the proxied work host. That change is
  environment-specific — don't commit it unless the project wants it permanent.
- Git push is currently blocked in this environment: the provided
  `GITHUB_TOKEN` / origin credentials are integration tokens with read-only
  contents permission (`403 Resource not accessible by integration` over both
  git receive-pack and the Git Data API). Commits are made locally and stay on
  `main` until a credential with `Contents: write` is supplied.
