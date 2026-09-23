-- ============================================================
-- Client websites: Lami the Migrant CEO + GBG Wholesale Hub
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run (updates them).
-- Negative sort_order puts them above every existing project.
-- ============================================================

insert into public.projects
  (slug, title, category, one_liner, problem, architecture, build_notes, outcome,
   stack, role, year, status, live_url, cover_image_url, featured, sort_order, published)
values
  ('lami-the-migrant-ceo', 'Lami the Migrant CEO', 'Client Website',
   'Coaching platform and online shop for a UK business coach helping African migrant women build profitable product businesses.',
   'Lami coaches African migrant women in the UK to start profitable product businesses on a small budget. Her programmes, wholesale bundles, 1:1 mentorship and community were spread across DMs, payment links and spreadsheets, so there was no single place to sell, enrol students, or see what was actually working.

She needed one home for the brand that could take payments in pounds, look after students after they paid, and that she could run herself without calling a developer.',
   'A Next.js 14 site on Vercel, backed by Supabase for the database, sign-in, file storage and background functions. Programmes and wholesale bundles sell through Stripe checkout in GBP, and a webhook records every order.

Students sign in with a magic link to their own area. Behind it sits a full admin control room: programmes, products, orders, students, applications, events, the journal, gallery, testimonials, a link-in-bio page and every piece of site text. Emails go out through Resend, and analytics are cookieless.',
   'Shipped in three releases: the brand and core pages first; then the wholesale storefront with cart, multi-item checkout, restock alerts, and order fulfilment with tracking emails and CSV export; then analytics, SEO and the legal pages.

Every word on the public site is editable from the admin, product descriptions get a rich-text editor, and uploaded images are converted to WebP automatically. The shop was kept within Stripe’s rules on what can be sold, so payments stay safe.',
   'A live platform where Lami sells programmes and wholesale bundles, enrols and supports students, runs events and her newsletter, and edits her whole site herself, without touching code.',
   array['Next.js', 'TypeScript', 'Supabase', 'Stripe', 'Resend', 'Tailwind CSS']::text[], 'Design & Development', '2026', 'Live',
   'https://lamithemigrantceo.uk', '/covers/lami-the-migrant-ceo.png', true, -2, true),
  ('gbg-wholesale-hub', 'GBG Wholesale Hub', 'Client Website',
   'UK wholesale store that lets first-time resellers buy low-minimum stock and learn how to sell it.',
   'Most wholesalers sell you 500 units and move on. GBG (Global Biz Gateway, Lami’s wholesale business) wanted the opposite: small, UK-held packs a beginner can afford, plus the guidance to actually sell them on Vinted, eBay, TikTok Shop and Facebook Marketplace.

The shop had to serve three people at once: the complete beginner, the reseller who needs reliable stock at real margins, and the buyer who just wants the product.',
   'A custom Shopify Online Store 2.0 theme built from Shopify’s Skeleton theme. Every page is made of schema-driven Liquid sections, so the owner can change any text, image or product list from the theme editor.

Checkout, orders and payments stay inside Shopify. Judge.me powers reviews, Omnisend captures leads from a dedicated reseller landing page, and GA4, Search Console, TikTok and Meta tracking switch on from theme settings.',
   'Designed around the buyer’s journey: a Buy / Sell / Build hero, Starter Boxes and low-MOQ collections, shop-by-platform collections, minimum-order rules that block checkout until they’re met, dropshipping, and a pricing calculator that shows the lowest price you can list at without losing money.

The paid Academy is an ordinary Shopify product: its questionnaire answers travel with the order, so there’s no extra app to pay for. A setup script creates the store’s pages, collections and products in one run.',
   'A live UK store with a clear path from first order to first sale: stock, selling guides, a pricing calculator, community and a paid academy in one place, all editable by the owner.',
   array['Shopify', 'Liquid', 'JavaScript', 'Judge.me', 'Omnisend', 'GA4']::text[], 'Design & Development', '2026', 'Live',
   'https://gbgwholesalehub.com', '/covers/gbg-wholesale-hub.png', true, -1, true)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  one_liner = excluded.one_liner,
  problem = excluded.problem,
  architecture = excluded.architecture,
  build_notes = excluded.build_notes,
  outcome = excluded.outcome,
  stack = excluded.stack,
  role = excluded.role,
  year = excluded.year,
  status = excluded.status,
  live_url = excluded.live_url,
  cover_image_url = excluded.cover_image_url,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  published = excluded.published;
