import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { fetchSiteSettings } from '@/lib/data/queries';
import { parsePipeLines, parseToolbox } from '@/lib/data/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About',
  description:
    'Aniekan Israel — a self-taught designer and engineer shipping production software and design work end to end. Multi-tenant SaaS, AI pipelines, brand systems, and interfaces used by real people.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const settings = await fetchSiteSettings();
  const paragraphs = settings.about_story.split('\n').filter((p) => p.trim().length > 0);
  // Editable in admin Settings.
  const principles = parsePipeLines(settings.about_principles);
  const toolbox = parseToolbox(settings.about_toolbox);
  const timeline = parsePipeLines(settings.about_timeline);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-36 pb-16">
          <Reveal>
            <MonoLabel>ABOUT</MonoLabel>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--platinum)] max-w-4xl">
              {settings.about_headline}
            </h1>
            <p className="mt-6 text-lg text-[var(--mist)] leading-relaxed max-w-2xl">
              {settings.about_intro}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Portrait + story */}
        <section className="py-20 grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-12 lg:gap-20 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden">
              {/* Silver corner accents */}
              <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[var(--silver)] z-10" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[var(--silver)] z-10" />
              {settings.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={settings.profile_image_url}
                  alt="Aniekan Israel"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[8rem] leading-none text-[var(--steel)] select-none">
                    AI
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="text-lg text-[var(--mist)] leading-relaxed max-w-xl">{p}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How I work */}
        <section className="py-16 border-t border-[var(--steel)]">
          <Reveal>
            <MonoLabel>HOW I WORK</MonoLabel>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map(([title, body], i) => (
              <Reveal key={title} delay={i * 80} className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-7">
                <div className="h-px w-8 bg-[var(--silver)] mb-6" />
                <h3 className="font-display text-xl text-[var(--platinum)]">{title}</h3>
                <p className="mt-3 text-sm text-[var(--mist)] leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Toolbox */}
        <section className="py-16 border-t border-[var(--steel)]">
          <Reveal>
            <MonoLabel>TOOLBOX</MonoLabel>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {toolbox.map((t, i) => (
              <Reveal key={t.group} delay={i * 60}>
                <p className="font-display text-lg text-[var(--platinum)] mb-4">{t.group}</p>
                <div className="flex flex-wrap gap-2">
                  {t.items.map((item) => (
                    <span
                      key={item}
                      className="mono-label text-[var(--mist)] border border-[var(--steel)] rounded px-2.5 py-1.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 border-t border-[var(--steel)]">
          <Reveal>
            <MonoLabel>TIMELINE</MonoLabel>
          </Reveal>
          <div className="mt-10 border-l border-[var(--steel)] pl-8 space-y-8">
            {timeline.map(([year, milestone], i) => (
              <Reveal key={`${year}-${i}`} delay={i * 60} className="relative">
                <span className="absolute -left-[33px] top-1.5 w-2 h-2 rounded-full bg-[var(--silver)]" />
                <MonoLabel>{year}</MonoLabel>
                <p className="mt-1.5 text-lg text-[var(--platinum)]">{milestone}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Resume + CTA */}
        <section className="py-20 border-t border-[var(--steel)] text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--platinum)]">
              Let&apos;s build your next project.
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/hire"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--silver)] px-7 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
              >
                Start a project <ArrowRight className="w-4 h-4" />
              </Link>
              {settings.resume_url && (
                <a
                  href={settings.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
                >
                  Download résumé →
                </a>
              )}
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
