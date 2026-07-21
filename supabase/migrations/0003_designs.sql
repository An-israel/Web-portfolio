-- ============================================================
-- Designs — visual / graphic-design portfolio
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run.
-- Reuses the existing `project-media` storage bucket for images.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Other',
  summary text,
  story text,
  dimensions text,                       -- e.g. "1080 × 1080 px" or "A4 (2480 × 3508)"
  tools text[] not null default '{}',    -- e.g. {Figma, Photoshop, Illustrator}
  client text,
  year text,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger (function created by the main migration).
drop trigger if exists designs_touch on public.designs;
create trigger designs_touch before update on public.designs
  for each row execute function public.touch_updated_at();

alter table public.designs enable row level security;

drop policy if exists designs_public_read on public.designs;
create policy designs_public_read on public.designs
  for select using (published = true or public.is_admin());

drop policy if exists designs_admin_write on public.designs;
create policy designs_admin_write on public.designs
  for all using (public.is_admin()) with check (public.is_admin());
