import type { WorkProject, SiteSettings } from '@/types';

// ------------------------------------------------------------
// Typed data layer. Public pages read through the accessors
// below; these currently return seeded content and will be
// swapped to Supabase reads (with the same shape) in the
// backend phase. Nothing here should ever throw.
// ------------------------------------------------------------

export const SITE_SETTINGS: SiteSettings = {
  hero_headline: 'I build AI products that ship.',
  hero_subline:
    "Founder-level engineer. I've designed, built, and launched multi-tenant SaaS, AI content systems, and autonomous tools — end to end, solo.",
  email: 'hello@aniekanisrael.com',
  github_url: null,
  x_url: null,
  linkedin_url: null,
  availability_status: 'Available',
  resume_url: null,
  stats: {
    products_shipped: '6+',
    years_building: '4+',
    stack_depth: 'FRONTEND → INFRA',
    response_time: '< 24H',
  },
};

export const PROJECTS: WorkProject[] = [
  {
    id: 'skryveai',
    slug: 'skryveai',
    title: 'SkryveAI',
    category: 'AI Product',
    one_liner: 'AI-powered client acquisition platform for freelancers.',
    problem:
      'Freelancers lose most of their week to prospecting instead of billable work — writing cold outreach, chasing leads, and second-guessing their pitch. The result is inconsistent income and burnout, not a pipeline.',
    architecture:
      'A Next.js front end talks to a Supabase backend where every table is protected by Row-Level Security so one user can never see another’s leads. An LLM layer sits behind server-side routes — never the browser — generating tailored outreach from a user’s profile and target. Auth, session handling, and a payments-ready billing structure were designed in from day one so the product could go from demo to paid without a rewrite.',
    build_notes:
      'Kept all model calls server-side so keys and prompts never reach the client. Built a prompt system that grounds every message in the user’s real profile to avoid generic AI slop. Structured the schema and RLS policies up front so multi-user data isolation was correct before the first real user, not patched in later.',
    outcome:
      'Shipped from idea to a live product: AI generation pipeline, authentication, and payments-ready architecture all working end to end.',
    stack: ['Next.js', 'Supabase', 'TypeScript', 'LLM APIs', 'Postgres / RLS'],
    role: 'Founder & Sole Engineer',
    year: '2025',
    status: 'Live',
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 0,
    published: true,
  },
  {
    id: 'nexxoshq',
    slug: 'nexxoshq',
    title: 'NexxosHQ',
    category: 'SaaS',
    one_liner: 'Multi-tenant B2B SaaS operating system for African businesses.',
    problem:
      'Small and mid-sized African businesses run on a patchwork of spreadsheets and WhatsApp. There is no affordable operating system that gives each company its own secure workspace, departments, and admin controls in one place.',
    architecture:
      'A true multi-tenant architecture: every row carries a tenant boundary enforced by Row-Level Security, so tenant data can never leak across companies. A super-admin dashboard sits above the tenants for oversight and provisioning. The data model was seeded with 60+ departments to prove the structure holds at real organizational scale before onboarding anyone.',
    build_notes:
      'The hard part was security correctness: designing RLS policies that isolate tenants perfectly while still letting a super-admin see across the platform. Built the provisioning flow so a new company gets a fully-scoped workspace instantly. Modeled departments and roles generically enough to fit many industries without per-tenant schema changes.',
    outcome:
      'A working multi-tenant platform with full RLS security, a super-admin dashboard, and 60+ seeded departments — the backbone for an African business OS.',
    stack: ['Next.js', 'Supabase', 'TypeScript', 'Postgres / RLS', 'Multi-tenant'],
    role: 'Founder & Sole Engineer',
    year: '2025',
    status: 'In Development',
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 1,
    published: true,
  },
  {
    id: 'sceneforge',
    slug: 'sceneforge',
    title: 'SceneForge',
    category: 'AI Product',
    one_liner: 'Script-to-video AI asset factory.',
    problem:
      'Turning a written script into finished video assets means juggling half a dozen tools — one for copy, one for voice, one for images — and manually stitching the output. It is slow, fragile, and impossible to scale.',
    architecture:
      'A single production pipeline orchestrates multiple AI services: an LLM breaks a script into scenes, a text-to-speech layer produces narration, and an image-generation layer renders the visuals. Each stage is a discrete step with its own inputs and retries, coordinated server-side so a failure in one service doesn’t take down the whole run.',
    build_notes:
      'Orchestration was the real work: sequencing LLM → TTS → image generation, passing structured state between them, and handling the failure modes each external API throws. Built the pipeline to be resumable so a long job doesn’t restart from zero when one call times out.',
    outcome:
      'LLM orchestration, TTS, and image generation wired into one production pipeline that takes a script in and produces video-ready assets out.',
    stack: ['Next.js', 'LLM APIs', 'TTS', 'Image Gen', 'TypeScript'],
    role: 'Founder & Sole Engineer',
    year: '2025',
    status: 'In Development',
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: true,
    sort_order: 2,
    published: true,
  },
  {
    id: 'brain',
    slug: 'brain',
    title: 'BRAIN',
    category: 'AI Product',
    one_liner: 'Personal AI operating system with Supabase-backed memory.',
    problem:
      'General AI assistants forget everything between sessions. A tool meant to run your life needs persistent, structured memory it can read from and write to reliably.',
    architecture:
      'An AI layer sits on top of a Supabase-backed memory store, giving the assistant durable context across sessions. State is modeled as structured records rather than a single opaque blob, so the system can retrieve exactly what a task needs.',
    build_notes:
      'Designed the memory schema so recall stays fast and relevant as it grows. Kept model access server-side and scoped to the owner. (Full write-up coming — edit via admin.)',
    outcome:
      'A working personal AI OS with persistent, queryable memory backing every interaction.',
    stack: ['Next.js', 'Supabase', 'LLM APIs', 'TypeScript'],
    role: 'Founder & Sole Engineer',
    year: '2025',
    status: 'In Development',
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: false,
    sort_order: 3,
    published: true,
  },
  {
    id: 'ideal-media',
    slug: 'ideal-media',
    title: 'Ideal Media',
    category: 'Platform',
    one_liner: 'AI-powered media operations platform.',
    problem:
      'A media operation was tracking attendance and routing communication by hand across disconnected tools, with no single secure source of truth.',
    architecture:
      'A platform that ingests attendance data, routes messages through WhatsApp, and secures every record with Row-Level Security so access is scoped correctly by role. Operational data flows into one system instead of living in scattered sheets.',
    build_notes:
      'Built reliable attendance ingestion and WhatsApp routing, with RLS ensuring the right people see the right records. (Full write-up coming — edit via admin.)',
    outcome:
      'A working operations platform unifying attendance ingestion, WhatsApp routing, and role-based security.',
    stack: ['Next.js', 'Supabase', 'WhatsApp API', 'Postgres / RLS'],
    role: 'Founder & Sole Engineer',
    year: '2025',
    status: 'In Development',
    live_url: null,
    github_url: null,
    cover_image_url: null,
    gallery_urls: [],
    featured: false,
    sort_order: 4,
    published: true,
  },
  {
    id: 'idlc-growth-tracker',
    slug: 'idlc-growth-tracker',
    title: 'IDLC Growth Tracker',
    category: 'Platform',
    one_liner: '21-day habit-building web app.',
    problem:
      'Habit programs fail when tracking is tedious. People need a frictionless way to log progress across a fixed 21-day cycle and actually see momentum.',
    architecture:
      'A focused web app modeling a 21-day cycle, with per-user progress stored securely and rendered as clear daily state. Built lean and mobile-first so logging takes seconds.',
    build_notes:
      'Kept the data model tight around the 21-day loop and made the daily interaction as low-friction as possible. (Full write-up coming — edit via admin.)',
    outcome:
      'A shipped habit-tracking app that turns a 21-day commitment into visible daily progress.',
    stack: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind'],
    role: 'Founder & Sole Engineer',
    year: '2024',
    status: 'Live',
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
