-- ============================================================
-- Client briefs — private per-client project questionnaires
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run.
--
-- Each row is one private link (/brief/<token>) sent to a client.
-- The public never reads this table directly: the brief page and
-- its API routes use the service-role client, keyed by token.
-- Pricing lives in site_settings under 'private_brief_pricing'
-- (the 'private_' prefix keeps it admin-only via existing RLS).
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.client_briefs (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default encode(gen_random_bytes(12), 'hex'),
  client_name text not null,
  client_email text,
  client_phone text,
  note text,
  status text not null default 'sent',
  answers jsonb,
  submitted_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists client_briefs_touch on public.client_briefs;
create trigger client_briefs_touch before update on public.client_briefs
  for each row execute function public.touch_updated_at();

alter table public.client_briefs enable row level security;

drop policy if exists client_briefs_admin_all on public.client_briefs;
create policy client_briefs_admin_all on public.client_briefs
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage — client uploads (logos, inspiration, brand docs)
-- Private bucket. Clients upload through short-lived signed
-- upload URLs issued by /api/brief/[token]/upload; only the
-- admin can read or delete.
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('client-briefs', 'client-briefs', false)
on conflict (id) do nothing;

drop policy if exists client_briefs_files_admin on storage.objects;
create policy client_briefs_files_admin on storage.objects
  for all using (bucket_id = 'client-briefs' and public.is_admin())
  with check (bucket_id = 'client-briefs' and public.is_admin());
