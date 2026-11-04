# Nabeel portfolio

React 19, TypeScript, Vite, Tailwind, Framer Motion and Supabase.

## Shared admin content

The admin panel saves globally only when Supabase is configured. Without it, the site runs in local demo mode and saves projects, reviews, uploads and site edits in that browser's `localStorage`.

1. Create a Supabase project.
2. In Supabase Authentication, create the admin user `nabeelmp3506@gmail.com`.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. It creates the tables and storage bucket and grants admin access to that email. Run [`supabase/seed.sql`](supabase/seed.sql) if you want the starter projects and reviews.
4. In Vercel, open the portfolio project settings and add these environment variables for Production (and Preview if needed):
   - `VITE_SUPABASE_URL` — the Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — the project's publishable/anon key
5. Redeploy the Vercel project. Sign in through `/admin` using the Supabase admin account.

The schema is safe to run again after updates. Site copy and images edited in the admin panel are saved to the shared `site_settings` table; project records, reviews and uploaded media use the shared tables and `works` bucket.

Existing demo data in a browser's local storage is not automatically copied into Supabase. Export or copy that content before switching the site to shared storage.

For local development, copy `.env.example` to `.env.local` and fill in the same two Supabase values. Never use a Supabase `service_role` key in the browser or in a `VITE_` variable.

## Commands

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and build the production site
- `npm run lint` — run Oxlint

Vercel's [`vercel.json`](vercel.json) rewrites client-side routes such as `/admin` to the SPA entry point.
