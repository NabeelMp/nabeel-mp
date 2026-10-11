-- Nabeel portfolio schema. Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('branding','packaging','package','video-editing','motion-graphics','3d-animation')),
  slug text not null,
  title text not null,
  client text,
  year text,
  summary text,
  description text,
  cover_url text,
  gallery text[] not null default '{}',
  video_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (category, slug)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  position text check (position is null or char_length(position) <= 80),
  rating int not null check (rating between 1 and 5),
  message text not null check (char_length(message) between 1 and 800),
  created_at timestamptz not null default now()
);
create index if not exists reviews_work_id_idx on public.reviews(work_id);

alter table public.admins enable row level security;
alter table public.works enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select using (user_id = auth.uid());

drop policy if exists "works public read" on public.works;
create policy "works public read" on public.works for select using (true);
drop policy if exists "works admin write" on public.works;
create policy "works admin write" on public.works for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select using (true);
drop policy if exists "reviews public insert" on public.reviews;
create policy "reviews public insert" on public.reviews for insert with check (work_id is not null);
drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete" on public.reviews for delete using (public.is_admin());

insert into storage.buckets (id, name, public) values ('works', 'works', true)
on conflict (id) do update set public = true;

drop policy if exists "works media public read" on storage.objects;
create policy "works media public read" on storage.objects for select using (bucket_id = 'works');
drop policy if exists "works media admin insert" on storage.objects;
create policy "works media admin insert" on storage.objects for insert with check (bucket_id = 'works' and public.is_admin());
drop policy if exists "works media admin delete" on storage.objects;
create policy "works media admin delete" on storage.objects for delete using (bucket_id = 'works' and public.is_admin());

-- Admin: create the user in Authentication → Users first, then this grants it admin rights.
insert into public.admins (user_id)
select id from auth.users where lower(email) = lower('nabeelmp3506@gmail.com')
on conflict do nothing;
