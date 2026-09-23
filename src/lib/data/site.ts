import type { WorkProject, SiteSettings } from "@/types";

// ------------------------------------------------------------
// Built-in defaults. Settings fall back to these field by field;
// the sample projects are only shown when Supabase isn't set up
// (e.g. a fresh local checkout) or can't be reached.
// ------------------------------------------------------------

export const SITE_SETTINGS: SiteSettings = {
  hero_headline: "Websites and brands that win you customers.",
  hero_subline:
    "I'm Aniekan — a designer and full-stack engineer. I design brands and build fast, modern websites and web apps for businesses, from the first logo sketch to the live site.",
  email: "aniekaneazy@gmail.com",
  github_url: null,
  x_url: null,
  linkedin_url: null,
  availability_status: "Available",
  resume_url: null,
  stats: {
    products_shipped: "6+",
    years_building: "4+",
    stack_depth: "FRONTEND → INFRA",
    response_time: "< 24H",
  },
  budget_options: [
    "Under ₦200k",
    "₦200k – ₦500k",
    "₦500k – ₦1M",
    "₦1M – ₦2.5M",
    "₦2.5M+",
    "Not sure yet",
  ],
  profile_image_url: null,
  about_headline: "A designer and engineer who ships.",
  about_intro:
    "I'm Aniekan Israel — I design and build digital products end to end, from the brand and interface down to the backend that runs them.",
  about_story:
    "I started on a phone in Nigeria — no degree handed to me, no bootcamp. Just relentless building: first design, then full-stack engineering, learning each craft by shipping real things into the world.\n\nToday I'm a final-year student at the University of Nigeria running production software and design work side by side — multi-tenant SaaS, AI pipelines, brand systems, and interfaces used by real people.\n\nMost people pick one lane. I hold the whole picture — strategy, design, frontend, backend, and infrastructure — so nothing falls through the seams. Massive thoughts, massive execution.",
  payment_bank: "OPay",
  payment_account: "7048083756",
  payment_name: "Aniekan Israel",
  whatsapp_number: "07048083756",
  home_approach:
    "Most people hire a designer, then a developer, then someone to fix what fell between them. I'm all three — brand, interface and the engineering underneath — so your website looks right, works right and ships on time. Self-taught, starting on a phone in Nigeria, now building products used in production.",
  about_principles:
    "Architecture first | Decisions about data, security, and structure come before the first pixel or component. It’s cheaper to think than to rewrite.\n" +
    "Design and code are one craft | I don’t hand a design off to an engineer — I’m both. The interface and the data model get decided together, so the product feels whole.\n" +
    "Ship, then sharpen | A live product teaches more than a perfect plan. I get it real, then refine against reality.",
  about_toolbox:
    "Design: Figma, Brand Identity, UI/UX, Typography, Social / Print\n" +
    "Frontend: React, Next.js, TypeScript, Tailwind\n" +
    "Backend: Supabase, PostgreSQL, Node, Edge Functions, RLS\n" +
    "AI: LLM APIs, Prompt systems, Agent orchestration, Image pipelines",
  about_timeline:
    "2022 | Designing on a phone.\n" +
    "2024 | First full products — shipped through the blackouts.\n" +
    "2025 | SkryveAI, NexxosHQ, SceneForge.\n" +
    "2026 | Building websites, brands and products for clients worldwide.",
};

export const PROJECTS: WorkProject[] = [
  {
    id: "lami-the-migrant-ceo",
    slug: "lami-the-migrant-ceo",
    title: "Lami the Migrant CEO",
    category: "Client Website",
    one_liner:
      "Coaching platform and online shop for a UK business coach helping African migrant women build profitable product businesses.",
    problem:
      "Lami coaches African migrant women in the UK to start profitable product businesses on a small budget. Her programmes, wholesale bundles, 1:1 mentorship and community were spread across DMs, payment links and spreadsheets, so there was no single place to sell, enrol students, or see what was actually working.\n\nShe needed one home for the brand that could take payments in pounds, look after students after they paid, and that she could run herself without calling a developer.",
    architecture:
      "A Next.js 14 site on Vercel, backed by Supabase for the database, sign-in, file storage and background functions. Programmes and wholesale bundles sell through Stripe checkout in GBP, and a webhook records every order.\n\nStudents sign in with a magic link to their own area. Behind it sits a full admin control room: programmes, products, orders, students, applications, events, the journal, gallery, testimonials, a link-in-bio page and every piece of site text. Emails go out through Resend, and analytics are cookieless.",
    build_notes:
      "Shipped in three releases: the brand and core pages first; then the wholesale storefront with cart, multi-item checkout, restock alerts, and order fulfilment with tracking emails and CSV export; then analytics, SEO and the legal pages.\n\nEvery word on the public site is editable from the admin, product descriptions get a rich-text editor, and uploaded images are converted to WebP automatically. The shop was kept within Stripe’s rules on what can be sold, so payments stay safe.",
    outcome:
      "A live platform where Lami sells programmes and wholesale bundles, enrols and supports students, runs events and her newsletter, and edits her whole site herself, without touching code.",
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Stripe",
      "Resend",
      "Tailwind CSS",
    ],
    role: "Design & Development",
    year: "2026",
    status: "Live",
    live_url: "https://lamithemigrantceo.uk",
    github_url: null,
    cover_image_url: "/covers/lami-the-migrant-ceo.png",
    gallery_urls: [],
    featured: true,
    sort_order: -2,
    published: true,
  },
  {
    id: "gbg-wholesale-hub",
    slug: "gbg-wholesale-hub",
    title: "GBG Wholesale Hub",
    category: "Client Website",
    one_liner:
      "UK wholesale store that lets first-time resellers buy low-minimum stock and learn how to sell it.",
    problem:
      "Most wholesalers sell you 500 units and move on. GBG (Global Biz Gateway, Lami’s wholesale business) wanted the opposite: small, UK-held packs a beginner can afford, plus the guidance to actually sell them on Vinted, eBay, TikTok Shop and Facebook Marketplace.\n\nThe shop had to serve three people at once: the complete beginner, the reseller who needs reliable stock at real margins, and the buyer who just wants the product.",
    architecture:
      "A custom Shopify Online Store 2.0 theme built from Shopify’s Skeleton theme. Every page is made of schema-driven Liquid sections, so the owner can change any text, image or product list from the theme editor.\n\nCheckout, orders and payments stay inside Shopify. Judge.me powers reviews, Omnisend captures leads from a dedicated reseller landing page, and GA4, Search Console, TikTok and Meta tracking switch on from theme settings.",
    build_notes:
      "Designed around the buyer’s journey: a Buy / Sell / Build hero, Starter Boxes and low-MOQ collections, shop-by-platform collections, minimum-order rules that block checkout until they’re met, dropshipping, and a pricing calculator that shows the lowest price you can list at without losing money.\n\nThe paid Academy is an ordinary Shopify product: its questionnaire answers travel with the order, so there’s no extra app to pay for. A setup script creates the store’s pages, collections and products in one run.",
    outcome:
      "A live UK store with a clear path from first order to first sale: stock, selling guides, a pricing calculator, community and a paid academy in one place, all editable by the owner.",
    stack: ["Shopify", "Liquid", "JavaScript", "Judge.me", "Omnisend", "GA4"],
    role: "Design & Development",
    year: "2026",
    status: "Live",
    live_url: "https://gbgwholesalehub.com",
    github_url: null,
    cover_image_url: "/covers/gbg-wholesale-hub.png",
    gallery_urls: [],
    featured: true,
    sort_order: -1,
    published: true,
  },
  {
    id: "skryveai",
    slug: "skryveai",
    title: "SkryveAI",
    category: "AI Product",
    one_liner: "AI-powered client acquisition platform for freelancers.",
    problem:
      "Freelancers lose most of their week to prospecting instead of billable work — writing cold outreach, chasing leads, and second-guessing their pitch. The result is inconsistent income and burnout, not a pipeline.",
    architecture:
      "A Next.js front end talks to a Supabase backend where every table is protected by Row-Level Security so one user can never see another’s leads. An LLM layer sits behind server-side routes — never the browser — generating tailored outreach from a user’s profile and target. Auth, session handling, and a payments-ready billing structure were designed in from day one so the product could go from demo to paid without a rewrite.",
    build_notes:
      "Kept all model calls server-side so keys and prompts never reach the client. Built a prompt system that grounds every message in the user’s real profile to avoid generic AI slop. Structured the schema and RLS policies up front so multi-user data isolation was correct before the first real user, not patched in later.",
    outcome:
      "Shipped from idea to a live product: AI generation pipeline, authentication, and payments-ready architecture all working end to end.",
    stack: ["Next.js", "Supabase", "TypeScript", "LLM APIs", "Postgres / RLS"],
    role: "Founder & Sole Engineer",
    year: "2025",
    status: "Live",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 0,
    published: true,
  },
  {
    id: "nexxoshq",
    slug: "nexxoshq",
    title: "NexxosHQ",
    category: "SaaS",
    one_liner: "Multi-tenant B2B SaaS operating system for African businesses.",
    problem:
      "Small and mid-sized African businesses run on a patchwork of spreadsheets and WhatsApp. There is no affordable operating system that gives each company its own secure workspace, departments, and admin controls in one place.",
    architecture:
      "A true multi-tenant architecture: every row carries a tenant boundary enforced by Row-Level Security, so tenant data can never leak across companies. A super-admin dashboard sits above the tenants for oversight and provisioning. The data model was seeded with 60+ departments to prove the structure holds at real organizational scale before onboarding anyone.",
    build_notes:
      "The hard part was security correctness: designing RLS policies that isolate tenants perfectly while still letting a super-admin see across the platform. Built the provisioning flow so a new company gets a fully-scoped workspace instantly. Modeled departments and roles generically enough to fit many industries without per-tenant schema changes.",
    outcome:
      "A working multi-tenant platform with full RLS security, a super-admin dashboard, and 60+ seeded departments — the backbone for an African business OS.",
    stack: [
      "Next.js",
      "Supabase",
      "TypeScript",
      "Postgres / RLS",
      "Multi-tenant",
    ],
    role: "Founder & Sole Engineer",
    year: "2025",
    status: "In Development",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 1,
    published: true,
  },
  {
    id: "sceneforge",
    slug: "sceneforge",
    title: "SceneForge",
    category: "AI Product",
    one_liner: "Script-to-video AI asset factory.",
    problem:
      "Turning a written script into finished video assets means juggling half a dozen tools — one for copy, one for voice, one for images — and manually stitching the output. It is slow, fragile, and impossible to scale.",
    architecture:
      "A single production pipeline orchestrates multiple AI services: an LLM breaks a script into scenes, a text-to-speech layer produces narration, and an image-generation layer renders the visuals. Each stage is a discrete step with its own inputs and retries, coordinated server-side so a failure in one service doesn’t take down the whole run.",
    build_notes:
      "Orchestration was the real work: sequencing LLM → TTS → image generation, passing structured state between them, and handling the failure modes each external API throws. Built the pipeline to be resumable so a long job doesn’t restart from zero when one call times out.",
    outcome:
      "LLM orchestration, TTS, and image generation wired into one production pipeline that takes a script in and produces video-ready assets out.",
    stack: ["Next.js", "LLM APIs", "TTS", "Image Gen", "TypeScript"],
    role: "Founder & Sole Engineer",
    year: "2025",
    status: "In Development",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 2,
    published: true,
  },
  {
    id: "brain",
    slug: "brain",
    title: "BRAIN",
    category: "AI Product",
    one_liner: "Personal AI operating system with Supabase-backed memory.",
    problem:
      "General AI assistants forget everything between sessions. A tool meant to run your life needs persistent, structured memory it can read from and write to reliably.",
    architecture:
      "An AI layer sits on top of a Supabase-backed memory store, giving the assistant durable context across sessions. State is modeled as structured records rather than a single opaque blob, so the system can retrieve exactly what a task needs.",
    build_notes:
      "Designed the memory schema so recall stays fast and relevant as it grows. Kept model access server-side and scoped to the owner. (Full write-up coming — edit via admin.)",
    outcome:
      "A working personal AI OS with persistent, queryable memory backing every interaction.",
    stack: ["Next.js", "Supabase", "LLM APIs", "TypeScript"],
    role: "Founder & Sole Engineer",
    year: "2025",
    status: "In Development",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: false,
    sort_order: 3,
    published: true,
  },
  {
    id: "ideal-media",
    slug: "ideal-media",
    title: "Ideal Media",
    category: "Platform",
    one_liner: "AI-powered media operations platform.",
    problem:
      "A media operation was tracking attendance and routing communication by hand across disconnected tools, with no single secure source of truth.",
    architecture:
      "A platform that ingests attendance data, routes messages through WhatsApp, and secures every record with Row-Level Security so access is scoped correctly by role. Operational data flows into one system instead of living in scattered sheets.",
    build_notes:
      "Built reliable attendance ingestion and WhatsApp routing, with RLS ensuring the right people see the right records. (Full write-up coming — edit via admin.)",
    outcome:
      "A working operations platform unifying attendance ingestion, WhatsApp routing, and role-based security.",
    stack: ["Next.js", "Supabase", "WhatsApp API", "Postgres / RLS"],
    role: "Founder & Sole Engineer",
    year: "2025",
    status: "In Development",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: false,
    sort_order: 4,
    published: true,
  },
  {
    id: "idlc-growth-tracker",
    slug: "idlc-growth-tracker",
    title: "IDLC Growth Tracker",
    category: "Platform",
    one_liner: "21-day habit-building web app.",
    problem:
      "Habit programs fail when tracking is tedious. People need a frictionless way to log progress across a fixed 21-day cycle and actually see momentum.",
    architecture:
      "A focused web app modeling a 21-day cycle, with per-user progress stored securely and rendered as clear daily state. Built lean and mobile-first so logging takes seconds.",
    build_notes:
      "Kept the data model tight around the 21-day loop and made the daily interaction as low-friction as possible. (Full write-up coming — edit via admin.)",
    outcome:
      "A shipped habit-tracking app that turns a 21-day commitment into visible daily progress.",
    stack: ["Next.js", "Supabase", "TypeScript", "Tailwind"],
    role: "Founder & Sole Engineer",
    year: "2024",
    status: "Live",
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: false,
    sort_order: 5,
    published: true,
  },
];

// ---------- Accessors (graceful, never throw) ----------

export function getAllProjects(): WorkProject[] {
  return [...PROJECTS]
    .filter((p) => p.published)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getFeaturedProjects(): WorkProject[] {
  return getAllProjects().filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): WorkProject | undefined {
  return PROJECTS.find((p) => p.slug === slug && p.published);
}

export function getSiteSettings(): SiteSettings {
  return SITE_SETTINGS;
}

/** Settings keys that must never render blank on the site. */
const REQUIRED_TEXT: (keyof SiteSettings)[] = [
  "hero_headline",
  "hero_subline",
  "email",
  "about_headline",
  "about_intro",
  "about_story",
  "payment_bank",
  "payment_account",
  "payment_name",
  "whatsapp_number",
  "home_approach",
  "about_principles",
  "about_toolbox",
  "about_timeline",
];

/** Merge stored settings over the defaults, field by field. Blank required text falls back too. */
export function mergeSettings(map: Map<string, unknown>): SiteSettings {
  const out: Record<string, unknown> = { ...SITE_SETTINGS };
  for (const [key, fallback] of Object.entries(SITE_SETTINGS)) {
    const v = map.get(key);
    if (v === undefined || v === null) continue;
    if (typeof fallback === "string" || fallback === null) {
      if (typeof v !== "string") continue;
      const blank = v.trim() === "";
      if (blank && REQUIRED_TEXT.includes(key as keyof SiteSettings)) continue;
      // Optional URLs: empty string means "unset".
      out[key] = blank ? null : v;
    } else if (Array.isArray(fallback)) {
      if (Array.isArray(v) && v.length) out[key] = v;
    } else if (typeof fallback === "object") {
      if (v && typeof v === "object")
        out[key] = { ...fallback, ...(v as object) };
    }
  }
  return out as unknown as SiteSettings;
}

/** `Left | right` per line → pairs (About principles, timeline). */
export function parsePipeLines(text: string): [string, string][] {
  return (text || "")
    .split("\n")
    .map((line) => {
      const i = line.indexOf("|");
      return i < 0
        ? [line.trim(), ""]
        : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
    .filter(([a]) => a) as [string, string][];
}

/** `Group: a, b, c` per line → toolbox groups. */
export function parseToolbox(
  text: string,
): { group: string; items: string[] }[] {
  return (text || "")
    .split("\n")
    .map((line) => {
      const i = line.indexOf(":");
      const group = (i < 0 ? line : line.slice(0, i)).trim();
      const items =
        i < 0
          ? []
          : line
              .slice(i + 1)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
      return { group, items };
    })
    .filter((g) => g.group);
}
