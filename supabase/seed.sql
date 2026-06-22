-- SwiftCreator seed data
-- Run this in your Supabase SQL editor to populate initial data.

-- ============================================================
-- SCHEMA (run first if tables don't exist)
-- ============================================================

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  category text not null,
  short_description text,
  full_description text,
  cover_image_url text,
  cover_device text default 'browser' check (cover_device in ('browser', 'laptop', 'phone')),
  gallery jsonb,
  tech_stack text[],
  live_url text,
  is_published boolean default false,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.pricing_tiers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price_label text not null,
  summary text,
  features text[] not null default '{}',
  delivery_days integer not null default 7,
  is_highlighted boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  author_role text,
  author_avatar_url text,
  quote text not null,
  is_published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  project_type text not null,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table public.projects enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.testimonials enable row level security;
alter table public.inquiries enable row level security;

-- Public can read published projects
create policy "Public read published projects"
  on public.projects for select
  using (is_published = true);

-- Public can read active pricing
create policy "Public read active pricing"
  on public.pricing_tiers for select
  using (is_active = true);

-- Public can read published testimonials
create policy "Public read published testimonials"
  on public.testimonials for select
  using (is_published = true);

-- No public read on inquiries (admin only via service role)

-- Authenticated users (admin) can do everything
create policy "Admin full access projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access pricing"
  on public.pricing_tiers for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access testimonials"
  on public.testimonials for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access inquiries"
  on public.inquiries for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "Public read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Auth upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "Auth delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

-- ============================================================
-- SEED: PROJECTS
-- ============================================================

insert into public.projects (title, slug, category, short_description, full_description, cover_device, tech_stack, is_published, is_featured, sort_order)
values
  (
    'Horizon Real Estate',
    'horizon-real-estate',
    'Business Website',
    'A property listing platform that positions Horizon as the market authority in Lagos luxury real estate.',
    'Horizon Real Estate came to us with a problem: their website looked like every other property firm in Lagos. The goal was to build something that immediately communicated premium positioning — because in real estate, perception IS the product.

We started with deep research into their target buyer — upper-middle class Lagosians and diaspora buyers. Everything from the color palette (warm black, gold accents) to the typography (Playfair Display for authority, Inter for readability) was chosen to signal credibility before a single property listing was seen.

The result: a 40% increase in qualified inquiries within 30 days of launch. The site now ranks on page 1 for three target keywords.',
    'browser',
    ARRAY['Next.js', 'Supabase', 'Tailwind CSS', 'Framer Motion'],
    true,
    true,
    0
  ),
  (
    'Lagos Bites',
    'lagos-bites',
    'E-commerce',
    'Online food ordering platform with real-time order tracking and seamless mobile checkout.',
    'Lagos Bites needed to compete with Jumia Food and Bolt Food in a crowded market. We positioned them differently: local, warm, community-focused. The site feels like ordering from a friend who has great taste.

The mobile-first design made 85% of orders come through mobile within the first month. Checkout was reduced from 6 steps to 2. Average order value increased by 22%.',
    'browser',
    ARRAY['Next.js', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
    true,
    false,
    1
  ),
  (
    'Clarity Consulting',
    'clarity-consulting',
    'Business Website',
    'Brand positioning site for a management consulting firm targeting Fortune 500 clients in West Africa.',
    'Clarity Consulting were landing in conversations with top-tier clients but losing them when prospects Googled them. Their old site was a liability.

We built them a site that signals seriousness without shouting. Minimal, precise, authoritative. Every word earns its place. The result was a site that gets shared by partners who want to show what''s possible.',
    'laptop',
    ARRAY['Next.js', 'Framer Motion', 'Tailwind CSS', 'Sanity CMS'],
    true,
    false,
    2
  ),
  (
    'Lumina Skincare',
    'lumina-skincare',
    'Landing Page',
    'High-converting product launch landing page for a premium Nigerian skincare brand. 42% conversion rate.',
    'Lumina had a great product. Their launch landing page was not doing it justice. We had 48 hours before their paid ad campaign went live.

We built a single-page experience laser-focused on one action: add to cart. Every element was tested. The hero image loads in under 0.8 seconds. The page converted at 42% — nearly 3x the industry average for skincare.',
    'phone',
    ARRAY['Next.js', 'Tailwind CSS', 'Paystack'],
    true,
    false,
    3
  );

-- ============================================================
-- SEED: PRICING TIERS
-- ============================================================

insert into public.pricing_tiers (name, price_label, summary, features, delivery_days, is_highlighted, is_active, sort_order)
values
  (
    'Starter',
    'From ₦350,000',
    'A clean, professional site that builds trust and converts visitors into leads.',
    ARRAY[
      'Up to 5 pages',
      'Mobile-first responsive design',
      'Contact form + WhatsApp integration',
      'Google Analytics setup',
      'Basic SEO (meta tags, sitemap)',
      '2 rounds of revisions',
      '7-day delivery'
    ],
    7,
    false,
    true,
    0
  ),
  (
    'Growth',
    'From ₦650,000',
    'A premium website that positions you as the undisputed authority in your market.',
    ARRAY[
      'Up to 10 pages',
      'Custom animations & scroll interactions',
      'Blog or portfolio CMS',
      'Advanced SEO + structured data',
      'Performance optimization (95+ Lighthouse)',
      'Analytics dashboard setup',
      'WhatsApp live chat integration',
      '3 rounds of revisions',
      '14-day delivery'
    ],
    14,
    true,
    true,
    1
  ),
  (
    'Elite',
    'Custom quote',
    'Full-stack web applications, e-commerce platforms, and enterprise solutions.',
    ARRAY[
      'Unlimited pages',
      'E-commerce with payment integration',
      'Custom web application / dashboard',
      'User authentication & roles',
      'Third-party API integrations',
      'Admin panel',
      'Priority support & SLA',
      'Ongoing maintenance available',
      'Custom timeline'
    ],
    30,
    false,
    true,
    2
  );

-- ============================================================
-- SEED: TESTIMONIALS
-- ============================================================

insert into public.testimonials (author_name, author_role, quote, is_published, sort_order)
values
  (
    'Emeka Okoye',
    'CEO, Horizon Real Estate',
    'Aniekan delivered a site that made our competitors look amateur. We started getting better quality inquiries within two weeks of launch. The site just works.',
    true,
    0
  ),
  (
    'Amaka Nwosu',
    'Founder, Lagos Bites',
    'I was skeptical about the timeline — 7 days sounded too fast for something this good. But SwiftCreator delivered ahead of schedule and the quality was immaculate. Would recommend without hesitation.',
    true,
    1
  ),
  (
    'Damilola Adeyemi',
    'Managing Partner, Clarity Consulting',
    'Our new site has become a business development tool. Partners share it, clients mention it in meetings. It does half our selling for us now.',
    true,
    2
  );
