-- ============================================================
-- Site audit fixes
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- 1. Settings that were never stored ----------
-- The admin Settings page showed these blank, and saving could
-- overwrite the site's defaults with blanks. Add them once.
insert into public.site_settings (key, value) values
  ('about_headline', to_jsonb('A designer and engineer who ships.'::text)),
  ('about_intro', to_jsonb('I''m Aniekan Israel — I design and build digital products end to end, from the brand and interface down to the backend that runs them.'::text)),
  ('about_story', to_jsonb('I started on a phone in Nigeria — no degree handed to me, no bootcamp. Just relentless building: first design, then full-stack engineering, learning each craft by shipping real things into the world.

Today I''m a final-year student at the University of Nigeria running production software and design work side by side — multi-tenant SaaS, AI pipelines, brand systems, and interfaces used by real people.

Most people pick one lane. I hold the whole picture — strategy, design, frontend, backend, and infrastructure — so nothing falls through the seams. Massive thoughts, massive execution.'::text)),
  ('payment_bank', to_jsonb('OPay'::text)),
  ('payment_account', to_jsonb('7048083756'::text)),
  ('payment_name', to_jsonb('Aniekan Israel'::text)),
  ('whatsapp_number', to_jsonb('07048083756'::text)),
  ('home_approach', to_jsonb('Most people hire a designer, then a developer, then someone to fix what fell between them. I''m all three — brand, interface and the engineering underneath — so your website looks right, works right and ships on time. Self-taught, starting on a phone in Nigeria, now building products used in production.'::text)),
  ('about_principles', to_jsonb('Architecture first | Decisions about data, security, and structure come before the first pixel or component. It’s cheaper to think than to rewrite.
Design and code are one craft | I don’t hand a design off to an engineer — I’m both. The interface and the data model get decided together, so the product feels whole.
Ship, then sharpen | A live product teaches more than a perfect plan. I get it real, then refine against reality.'::text)),
  ('about_toolbox', to_jsonb('Design: Figma, Brand Identity, UI/UX, Typography, Social / Print
Frontend: React, Next.js, TypeScript, Tailwind
Backend: Supabase, PostgreSQL, Node, Edge Functions, RLS
AI: LLM APIs, Prompt systems, Agent orchestration, Image pipelines'::text)),
  ('about_timeline', to_jsonb('2022 | Designing on a phone.
2024 | First full products — shipped through the blackouts.
2025 | SkryveAI, NexxosHQ, SceneForge.
2026 | Building websites, brands and products for clients worldwide.'::text)),
  ('profile_image_url', to_jsonb(''::text)),
  ('budget_options', '["Under ₦200k", "₦200k – ₦500k", "₦500k – ₦1M", "₦1M – ₦2.5M", "₦2.5M+", "Not sure yet"]'::jsonb)
on conflict (key) do nothing;

-- Payment details / WhatsApp must never be blank (Coaching popup).
update public.site_settings s set value = d.value
from (values
  ('payment_bank', to_jsonb('OPay'::text)),
  ('payment_account', to_jsonb('7048083756'::text)),
  ('payment_name', to_jsonb('Aniekan Israel'::text)),
  ('whatsapp_number', to_jsonb('07048083756'::text))
) as d(key, value)
where s.key = d.key and (s.value is null or s.value = to_jsonb(''::text));

-- Contact email: the old default mailbox doesn't exist.
update public.site_settings set value = to_jsonb('aniekaneazy@gmail.com'::text)
where key = 'email' and value in (to_jsonb('hello@aniekanisrael.com'::text), to_jsonb(''::text));

-- Hire form budgets: switch the old dollar defaults to Naira.
update public.site_settings
set value = '["Under ₦200k", "₦200k – ₦500k", "₦500k – ₦1M", "₦1M – ₦2.5M", "₦2.5M+", "Not sure yet"]'::jsonb
where key = 'budget_options'
  and value = '["<$2k","$2k–$5k","$5k–$15k","$15k–$50k","$50k+"]'::jsonb;

-- Hero: client-first copy, only if you never changed the original.
update public.site_settings set value = to_jsonb('Websites and brands that win you customers.'::text)
where key = 'hero_headline' and value = to_jsonb('I build AI products that ship.'::text);
update public.site_settings set value = to_jsonb('I''m Aniekan — a designer and full-stack engineer. I design brands and build fast, modern websites and web apps for businesses, from the first logo sketch to the live site.'::text)
where key = 'hero_subline'
  and value = to_jsonb('Founder-level engineer. I''ve designed, built, and launched multi-tenant SaaS, AI content systems, and autonomous tools — end to end, solo.'::text);

-- ---------- 2. Close open write rules ----------
-- Inquiries are saved by the server (/api/inquiry), which runs the
-- spam checks. Direct public inserts bypassed them.
drop policy if exists inquiries_public_insert on public.inquiries;
-- Unused bucket that let anyone upload files without limit.
drop policy if exists inquiry_attach_insert on storage.objects;

-- ---------- 3. Analytics counted in the database ----------
-- The admin used to download raw rows (capped at 1,000 by Supabase).
create or replace function public.page_view_stats(since timestamptz)
returns json
language sql stable security definer set search_path = public
as $$
  select case when not public.is_admin() then null else json_build_object(
    'total', (select count(*) from page_views where created_at >= since),
    'hire', (select count(*) from page_views where created_at >= since and path = '/hire'),
    'by_day', (
      select coalesce(json_agg(json_build_object('day', day, 'n', n) order by day), '[]'::json)
      from (
        select to_char(created_at at time zone 'Africa/Lagos', 'YYYY-MM-DD') as day, count(*) as n
        from page_views where created_at >= since group by 1
      ) d
    ),
    'by_path', (
      select coalesce(json_agg(json_build_object('key', path, 'n', n) order by n desc), '[]'::json)
      from (
        select path, count(*) as n from page_views where created_at >= since
        group by path order by n desc limit 10
      ) p
    ),
    'by_ref', (
      select coalesce(json_agg(json_build_object('key', host, 'n', n) order by n desc), '[]'::json)
      from (
        select coalesce(substring(referrer from '^https?://([^/:]+)'), 'direct') as host, count(*) as n
        from page_views where created_at >= since
        group by 1 order by n desc limit 10
      ) r
    )
  ) end;
$$;
grant execute on function public.page_view_stats(timestamptz) to authenticated;

-- ---------- 4. Coaching enrolments ----------
create table if not exists public.enrolments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  course_title text not null,
  amount_naira int not null default 0,
  full_name text not null,
  phone text not null,
  email text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists enrolments_touch on public.enrolments;
create trigger enrolments_touch before update on public.enrolments
  for each row execute function public.touch_updated_at();

alter table public.enrolments enable row level security;

-- Students enrol through /api/enrol (server, spam-checked); only the admin reads/edits.
drop policy if exists enrolments_admin_all on public.enrolments;
create policy enrolments_admin_all on public.enrolments
  for all using (public.is_admin()) with check (public.is_admin());
