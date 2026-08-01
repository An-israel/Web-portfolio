-- ============================================================
-- Coaching — courses Aniekan teaches
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  description text,
  curriculum text[] not null default '{}',
  price_naira int not null default 0,
  duration text,
  level text,
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

alter table public.courses enable row level security;

drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses
  for select using (published = true or public.is_admin());

drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Seed — the four courses
-- ============================================================
insert into public.courses
  (slug, title, summary, description, curriculum, price_naira, duration, level, sort_order, published)
values
  ('web-development', 'Web Development',
   'From zero to building real, deployable web apps.',
   'Learn to build and ship modern websites and web apps the way the industry actually works — from the fundamentals through React and real databases. You finish able to build and deploy a real project, not just follow tutorials.',
   array[
     'HTML, CSS & responsive layouts',
     'JavaScript fundamentals',
     'React & component thinking',
     'Working with APIs & databases',
     'Deploying a live project',
     'A portfolio project to show clients or employers'
   ], 75000, '3 months', 'Beginner to job-ready', 0, true),

  ('graphic-design', 'Graphic Design',
   'Design brands and visuals people take seriously.',
   'Master both the tools and the eye — typography, colour, and layout through to full brand systems, social-media designs, and print-ready work. You build a design portfolio you can actually sell with.',
   array[
     'Design foundations: type, colour, layout',
     'Figma & core design tools',
     'Brand identity & logos',
     'Social media & marketing designs',
     'Print & export essentials',
     'A client-ready portfolio'
   ], 45000, '2 months', 'Beginner friendly', 1, true),

  ('content-copywriting', 'Content & Copywriting',
   'Write words that sell and content that grows.',
   'Learn to write copy that converts and content that builds an audience — for brands, social media, and products. From hooks and structure to a repeatable content system you can run for clients.',
   array[
     'Copywriting fundamentals & psychology',
     'Hooks & headlines that convert',
     'Content strategy & planning',
     'Social media & brand content',
     'Editing, tone & clarity',
     'A content system you can run for clients'
   ], 30000, '2 months', 'Beginner friendly', 2, true),

  ('videography', 'Videography & Video Content Creation',
   'Shoot, edit, and create scroll-stopping video.',
   'Learn to plan, shoot, and edit professional video content — from framing and lighting to a full editing workflow and content that performs. Everything you need to create for brands or your own channel.',
   array[
     'Shooting & framing fundamentals',
     'Lighting & audio basics',
     'Editing workflow & software',
     'Short-form & social video',
     'Storytelling for content',
     'Delivering client-ready videos'
   ], 150000, '3 months', 'Beginner to pro', 3, true)
on conflict (slug) do nothing;
