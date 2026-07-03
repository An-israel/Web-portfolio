-- ============================================================
-- Aniekan Israel — portfolio backend
-- Schema · RLS · storage · seed
-- Run against Supabase project (SQL editor or `supabase db push`).
-- Safe to re-run: guarded with IF NOT EXISTS / ON CONFLICT.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Admin identity ----------
-- Admin = an authenticated user whose profile row has is_admin = true.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER helper so policies can check admin without recursing on RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at helper ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- projects
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,                     -- 'AI Product' | 'SaaS' | 'Platform'
  one_liner text,
  problem text,
  architecture text,
  build_notes text,
  outcome text,
  stack text[] not null default '{}',
  role text not null default 'Founder & Sole Engineer',
  year text,
  status text not null default 'Live',        -- 'Live' | 'In Development' | 'Archived'
  live_url text,
  github_url text,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ============================================================
-- inquiries  (the Hire Me pipeline)
-- ============================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  role_at_company text,
  project_type text not null,                 -- see InquiryProjectType
  budget_range text,                          -- see InquiryBudget | 'Salary role'
  timeline text,                              -- see InquiryTimeline
  description text not null,
  how_found text,
  attachments text[] not null default '{}',
  status text not null default 'new',         -- new|reviewing|replied|call_booked|won|lost|archived
  priority text not null default 'normal',    -- high|normal|low
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists inquiries_touch on public.inquiries;
create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated_at();

-- ============================================================
-- testimonials
-- ============================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  avatar_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- site_settings  (single-row-per-key key/value)
-- ============================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ============================================================
-- page_views  (lightweight analytics)
-- ============================================================
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at);
create index if not exists page_views_path_idx on public.page_views (path);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.inquiries     enable row level security;
alter table public.testimonials  enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_views    enable row level security;

-- profiles: a user can read their own row; admins read all; no public writes.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- projects: public reads published; admin full access.
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select using (published = true or public.is_admin());

drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- testimonials: public reads published; admin full access.
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (published = true or public.is_admin());

drop policy if exists testimonials_admin_write on public.testimonials;
create policy testimonials_admin_write on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- site_settings: public reads keys not prefixed 'private_'; admin full access.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select using (key not like 'private_%' or public.is_admin());

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- inquiries: anon/public may INSERT only; admin full access. No public select.
drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert on public.inquiries
  for insert with check (true);

drop policy if exists inquiries_admin_all on public.inquiries;
create policy inquiries_admin_all on public.inquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- page_views: anon INSERT only; admin SELECT.
drop policy if exists page_views_public_insert on public.page_views;
create policy page_views_public_insert on public.page_views
  for insert with check (true);

drop policy if exists page_views_admin_read on public.page_views;
create policy page_views_admin_read on public.page_views
  for select using (public.is_admin());

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('project-media', 'project-media', true),
  ('inquiry-attachments', 'inquiry-attachments', false),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- project-media: public read, admin write
drop policy if exists project_media_read on storage.objects;
create policy project_media_read on storage.objects
  for select using (bucket_id = 'project-media');

drop policy if exists project_media_admin_write on storage.objects;
create policy project_media_admin_write on storage.objects
  for all using (bucket_id = 'project-media' and public.is_admin())
  with check (bucket_id = 'project-media' and public.is_admin());

-- site-assets: public read, admin write
drop policy if exists site_assets_read on storage.objects;
create policy site_assets_read on storage.objects
  for select using (bucket_id = 'site-assets');

drop policy if exists site_assets_admin_write on storage.objects;
create policy site_assets_admin_write on storage.objects
  for all using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

-- inquiry-attachments: anon may upload at submission; admin may read; private otherwise.
drop policy if exists inquiry_attach_insert on storage.objects;
create policy inquiry_attach_insert on storage.objects
  for insert with check (bucket_id = 'inquiry-attachments');

drop policy if exists inquiry_attach_admin_read on storage.objects;
create policy inquiry_attach_admin_read on storage.objects
  for select using (bucket_id = 'inquiry-attachments' and public.is_admin());

-- ============================================================
-- Seed — site_settings
-- ============================================================
insert into public.site_settings (key, value) values
  ('hero_headline',       to_jsonb('I build AI products that ship.'::text)),
  ('hero_subline',        to_jsonb('Founder-level engineer. I''ve designed, built, and launched multi-tenant SaaS, AI content systems, and autonomous tools — end to end, solo.'::text)),
  ('email',               to_jsonb('hello@aniekanisrael.com'::text)),
  ('github_url',          'null'::jsonb),
  ('x_url',               'null'::jsonb),
  ('linkedin_url',        'null'::jsonb),
  ('availability_status', to_jsonb('Available'::text)),
  ('resume_url',          'null'::jsonb),
  ('stats',               jsonb_build_object(
                            'products_shipped', '6+',
                            'years_building', '4+',
                            'stack_depth', 'FRONTEND → INFRA',
                            'response_time', '< 24H'))
on conflict (key) do nothing;

-- ============================================================
-- Seed — projects (mirrors src/lib/data/site.ts)
-- ============================================================
insert into public.projects
  (slug, title, category, one_liner, problem, architecture, build_notes, outcome, stack, year, status, featured, sort_order, published)
values
  ('skryveai', 'SkryveAI', 'AI Product',
   'AI-powered client acquisition platform for freelancers.',
   'Freelancers lose most of their week to prospecting instead of billable work — writing cold outreach, chasing leads, and second-guessing their pitch. The result is inconsistent income and burnout, not a pipeline.',
   'A Next.js front end talks to a Supabase backend where every table is protected by Row-Level Security so one user can never see another''s leads. An LLM layer sits behind server-side routes — never the browser — generating tailored outreach from a user''s profile and target. Auth, session handling, and a payments-ready billing structure were designed in from day one.',
   'Kept all model calls server-side so keys and prompts never reach the client. Built a prompt system that grounds every message in the user''s real profile to avoid generic AI slop. Structured the schema and RLS policies up front so multi-user data isolation was correct before the first real user.',
   'Shipped from idea to a live product: AI generation pipeline, authentication, and payments-ready architecture all working end to end.',
   array['Next.js','Supabase','TypeScript','LLM APIs','Postgres / RLS'], '2025', 'Live', true, 0, true),

  ('nexxoshq', 'NexxosHQ', 'SaaS',
   'Multi-tenant B2B SaaS operating system for African businesses.',
   'Small and mid-sized African businesses run on a patchwork of spreadsheets and WhatsApp. There is no affordable operating system that gives each company its own secure workspace, departments, and admin controls in one place.',
   'A true multi-tenant architecture: every row carries a tenant boundary enforced by Row-Level Security, so tenant data can never leak across companies. A super-admin dashboard sits above the tenants for oversight and provisioning. Seeded with 60+ departments to prove the structure holds at real organizational scale.',
   'The hard part was security correctness: RLS policies that isolate tenants perfectly while letting a super-admin see across the platform. Built instant workspace provisioning and modeled departments/roles generically enough to fit many industries without per-tenant schema changes.',
   'A working multi-tenant platform with full RLS security, a super-admin dashboard, and 60+ seeded departments — the backbone for an African business OS.',
   array['Next.js','Supabase','TypeScript','Postgres / RLS','Multi-tenant'], '2025', 'In Development', true, 1, true),

  ('sceneforge', 'SceneForge', 'AI Product',
   'Script-to-video AI asset factory.',
   'Turning a written script into finished video assets means juggling half a dozen tools — one for copy, one for voice, one for images — and manually stitching the output. It is slow, fragile, and impossible to scale.',
   'A single production pipeline orchestrates multiple AI services: an LLM breaks a script into scenes, a text-to-speech layer produces narration, and an image-generation layer renders the visuals. Each stage is a discrete, retryable step coordinated server-side.',
   'Orchestration was the real work: sequencing LLM → TTS → image generation, passing structured state between them, and handling the failure modes each external API throws. Built the pipeline to be resumable so a long job doesn''t restart from zero on one timeout.',
   'LLM orchestration, TTS, and image generation wired into one production pipeline that takes a script in and produces video-ready assets out.',
   array['Next.js','LLM APIs','TTS','Image Gen','TypeScript'], '2025', 'In Development', true, 2, true),

  ('brain', 'BRAIN', 'AI Product',
   'Personal AI operating system with Supabase-backed memory.',
   'General AI assistants forget everything between sessions. A tool meant to run your life needs persistent, structured memory it can read from and write to reliably.',
   'An AI layer sits on top of a Supabase-backed memory store, giving the assistant durable context across sessions. State is modeled as structured records rather than a single opaque blob, so the system can retrieve exactly what a task needs.',
   'Designed the memory schema so recall stays fast and relevant as it grows. Kept model access server-side and scoped to the owner.',
   'A working personal AI OS with persistent, queryable memory backing every interaction.',
   array['Next.js','Supabase','LLM APIs','TypeScript'], '2025', 'In Development', false, 3, true),

  ('ideal-media', 'Ideal Media', 'Platform',
   'AI-powered media operations platform.',
   'A media operation was tracking attendance and routing communication by hand across disconnected tools, with no single secure source of truth.',
   'A platform that ingests attendance data, routes messages through WhatsApp, and secures every record with Row-Level Security so access is scoped correctly by role.',
   'Built reliable attendance ingestion and WhatsApp routing, with RLS ensuring the right people see the right records.',
   'A working operations platform unifying attendance ingestion, WhatsApp routing, and role-based security.',
   array['Next.js','Supabase','WhatsApp API','Postgres / RLS'], '2025', 'In Development', false, 4, true),

  ('idlc-growth-tracker', 'IDLC Growth Tracker', 'Platform',
   '21-day habit-building web app.',
   'Habit programs fail when tracking is tedious. People need a frictionless way to log progress across a fixed 21-day cycle and actually see momentum.',
   'A focused web app modeling a 21-day cycle, with per-user progress stored securely and rendered as clear daily state. Built lean and mobile-first so logging takes seconds.',
   'Kept the data model tight around the 21-day loop and made the daily interaction as low-friction as possible.',
   'A shipped habit-tracking app that turns a 21-day commitment into visible daily progress.',
   array['Next.js','Supabase','TypeScript','Tailwind'], '2024', 'Live', false, 5, true)
on conflict (slug) do nothing;

-- ============================================================
-- After running: create your admin user in Supabase Auth, then:
--   update public.profiles set is_admin = true where email = 'you@example.com';
-- ============================================================
