import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { PulseLine } from '@/components/site/PulseLine';
import { SERVICES } from '@/lib/data/services';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Business websites, online stores, brand identity, ongoing brand design, web apps and website care — designed and built end to end by Aniekan Israel.',
  alternates: { canonical: '/services' },
};

const STEPS = [
  ['Tell me what you need', 'Fill in a short form, or I’ll send you a detailed project brief to complete at your own pace.'],
  ['Get a clear quote', 'I review everything and come back with a plan, timeline and price — usually within 24 hours.'],
  ['Design, then build', 'You see the design first. Once you’re happy, I build it and keep you updated as it comes together.'],
  ['Launch and beyond', 'We go live, I show you how to manage it, and I’m on hand for care, updates and new ideas.'],
] as const;

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-36 pb-16">
          <Reveal>
            <MonoLabel>SERVICES</MonoLabel>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--platinum)] max-w-4xl">
              Design and build, under one roof.
            </h1>
            <p className="mt-6 text-lg text-[var(--mist)] max-w-2xl">
              From your logo to your live website — one person who designs it, builds it and keeps it
              running. No hand-offs, nothing lost in between.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.key} delay={(i % 2) * 80}>
              <div id={s.key} className="h-full flex flex-col rounded-lg border border-[var(--steel)] bg-[var(--graphite)] p-7 scroll-mt-28">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-2xl text-[var(--platinum)]">{s.title}</h2>
                  {s.monthly && <MonoLabel className="text-[var(--mist)] shrink-0 mt-2">MONTHLY</MonoLabel>}
                </div>
                <p className="mt-3 text-[var(--mist)]">{s.summary}</p>
                <ul className="mt-6 space-y-2">
                  {s.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--platinum)]">
                      <Check className="w-4 h-4 text-[var(--silver)] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-[var(--mist)]">
                  <span className="mono-label text-[var(--mist)]">IDEAL FOR — </span>
                  {s.idealFor}
                </p>
                <div className="mt-8 flex-1 flex items-end">
                  <Link
                    href={`/hire?service=${s.key}`}
                    className="group inline-flex items-center gap-2 rounded-md border border-[var(--silver)] px-5 py-3 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
                  >
                    Start this project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20">
          <Reveal>
            <MonoLabel>HOW IT WORKS</MonoLabel>
          </Reveal>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(([title, body], i) => (
              <Reveal key={title} as="li" delay={i * 60}>
                <MonoLabel className="text-[var(--mist)]">STEP {i + 1}</MonoLabel>
                <h3 className="mt-2 font-display text-xl text-[var(--platinum)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--mist)] leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8 py-24 text-center">
          <PulseLine className="mb-8 max-w-sm mx-auto" />
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--platinum)]">Not sure what you need?</h2>
          <p className="mt-4 text-[var(--mist)]">Tell me about your business and I’ll recommend the right mix.</p>
          <Link
            href="/hire"
            className="mt-8 inline-block rounded-md bg-[var(--white)] text-[var(--obsidian)] px-7 py-3.5 text-sm font-semibold hover:opacity-90"
          >
            Start your project
          </Link>
        </div>
      </section>
    </>
  );
}
