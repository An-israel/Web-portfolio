import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { PulseLine } from '@/components/site/PulseLine';
import { Reveal } from '@/components/site/Reveal';
import { ProjectCard } from '@/components/site/ProjectCard';
import { fetchFeaturedProjects, fetchSiteSettings } from '@/lib/data/queries';

const CAPABILITIES = [
  {
    title: 'AI Product Engineering',
    body: 'LLM integration, agent workflows, and prompt systems that hold up in production — not demos.',
  },
  {
    title: 'Full-Stack Development',
    body: 'Next.js, React, TypeScript, Supabase, Postgres, and RLS-secured multi-tenant systems.',
  },
  {
    title: 'Zero-to-One Builds',
    body: 'I take products from a blank repo to launched — architecture, UI, backend, deployment.',
  },
];

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    fetchSiteSettings(),
    fetchFeaturedProjects(),
  ]);
  const stats = [
    { label: 'PRODUCTS SHIPPED', value: settings.stats.products_shipped },
    { label: 'YEARS BUILDING', value: settings.stats.years_building },
    { label: 'STACK DEPTH', value: settings.stats.stack_depth },
    { label: 'RESPONSE TIME', value: settings.stats.response_time },
  ];

  const sameAs = [settings.github_url, settings.x_url, settings.linkedin_url].filter(Boolean);
  // Headline is editable in admin Settings; accent the last word.
  const headWords = settings.hero_headline.trim().split(' ');
  const headLast = headWords.length > 1 ? headWords.pop() : '';
  const headLead = headWords.join(' ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aniekan Israel',
    jobTitle: 'Full-Stack & AI Engineer',
    email: `mailto:${settings.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://aniekanisrael.com',
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ---------- HERO ---------- */}
      <section className="relative min-h-screen flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pt-28 pb-20">
          <div className="max-w-4xl">
            <Reveal>
              <MonoLabel>FULL-STACK &amp; AI ENGINEER — LAGOS / REMOTE</MonoLabel>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl text-[var(--platinum)]">
                {headLead} {headLast && <span className="metal-text">{headLast}</span>}
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 text-lg text-[var(--mist)] leading-relaxed max-w-2xl">
                {settings.hero_subline}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/hire"
                  className="rounded-md border border-[var(--silver)] px-6 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
                >
                  Start a project
                </Link>
                <Link
                  href="/work"
                  className="group flex items-center gap-2 px-2 py-3.5 text-sm text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
                >
                  See the work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Reveal>

            {/* Signature */}
            <Reveal delay={320}>
              <div className="mt-16 flex items-center gap-4">
                <PulseLine className="flex-1 max-w-md" />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="pulse-dot" aria-hidden="true" />
                  <MonoLabel>SYSTEMS: OPERATIONAL</MonoLabel>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Proof ticker at the fold edge */}
        <div className="absolute bottom-0 inset-x-0 border-t border-[var(--steel)]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-4 overflow-hidden">
            <MonoLabel className="whitespace-nowrap text-[var(--mist)]">
              6+ PRODUCTS SHIPPED · MULTI-TENANT SAAS · LLM PIPELINES · NEXT.JS / SUPABASE /
              TYPESCRIPT
            </MonoLabel>
          </div>
        </div>
      </section>

      {/* ---------- SELECTED WORK ---------- */}
      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
          <Reveal className="flex items-end justify-between gap-6 mb-14">
            <div>
              <MonoLabel>SELECTED WORK — 01</MonoLabel>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl text-[var(--platinum)]">
                Products, not promises.
              </h2>
            </div>
            <Link
              href="/work"
              className="hidden sm:flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors shrink-0"
            >
              View all work <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((project, i) => (
              <Reveal key={project.id} delay={i * 80}>
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </div>

          <Link
            href="/work"
            className="mt-10 sm:hidden flex items-center justify-center gap-2 mono-label text-[var(--mist)] border border-[var(--steel)] rounded-md py-3.5"
          >
            View all work <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ---------- CAPABILITIES ---------- */}
      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
          <Reveal>
            <MonoLabel>WHAT I DO — 02</MonoLabel>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--steel)] border border-[var(--steel)] rounded-md overflow-hidden">
            {CAPABILITIES.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 80} className="bg-[var(--obsidian)] p-8">
                <div className="h-px w-8 bg-[var(--silver)] mb-6" />
                <h3 className="font-display text-xl text-[var(--platinum)]">{cap.title}</h3>
                <p className="mt-3 text-sm text-[var(--mist)] leading-relaxed">{cap.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PROOF / NUMBERS BAND ---------- */}
      <section className="border-t border-b border-[var(--steel)] bg-[var(--graphite)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 60}>
                <p className="font-display text-3xl sm:text-4xl text-[var(--platinum)]">
                  {stat.value}
                </p>
                <MonoLabel className="mt-2 block text-[var(--mist)]">{stat.label}</MonoLabel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MANIFESTO ---------- */}
      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
          <Reveal className="max-w-3xl">
            <MonoLabel>THE APPROACH — 03</MonoLabel>
            <p className="mt-8 font-display text-2xl sm:text-3xl leading-snug text-[var(--platinum)]">
              Most engineers wait for a spec. I&apos;ve been the founder, the designer, and the
              engineer on everything I&apos;ve shipped — which means I don&apos;t just write code,
              I make products exist. Self-taught, starting on a phone in Nigeria, now building
              systems used in production.{' '}
              <span className="text-[var(--silver)]">Massive thoughts. Massive execution.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-28 text-center">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl text-[var(--platinum)]">
              Have something worth building?
            </h2>
            <p className="mt-5 text-lg text-[var(--mist)]">
              Tell me what you need. I&apos;ll reply within 24 hours.
            </p>
            <Link
              href="/hire"
              className="mt-10 inline-block rounded-md border border-[var(--silver)] px-8 py-4 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
            >
              Start a project
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
