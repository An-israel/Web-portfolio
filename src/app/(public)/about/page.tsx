'use client';

import { useState } from 'react';
import { BookDialog } from '@/components/site/BookDialog';
import { SectionHeading } from '@/components/site/SectionHeading';
import { Button } from '@/components/ui/button';

const SKILLS = [
  'Next.js / React',
  'TypeScript',
  'Tailwind CSS',
  'Framer Motion',
  'Node.js',
  'Supabase / PostgreSQL',
  'UI/UX Design',
  'Figma',
  'SEO & Performance',
  'Stripe / Payment APIs',
  'REST & GraphQL APIs',
  'Git / CI/CD',
];

const VALUES = [
  {
    label: 'Craft over speed',
    text: 'Every pixel is deliberate. I care about the details most people skip.',
  },
  {
    label: 'Speed over excuses',
    text: "Fast isn't the enemy of quality. I deliver premium work in days, not months.",
  },
  {
    label: 'Clarity over jargon',
    text: "You'll always know where your project stands. Plain language, no tech-speak.",
  },
];

export default function AboutPage() {
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Intro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">
        <div>
          <p className="label-micro mb-6">The person behind the work</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-[var(--ink)] leading-tight mb-8">
            Hi. I&apos;m Aniekan Israel.
          </h1>
          <div className="space-y-5 text-[var(--muted)] leading-relaxed">
            <p>
              I build websites that make businesses look like what they actually are — serious, capable, and worth choosing. SwiftCreator exists because most web agencies move too slow, charge too much, and deliver too little.
            </p>
            <p>
              I&apos;ve spent years studying what separates websites that convert from websites that just sit there. The answer isn&apos;t magic — it&apos;s intentional design, clean code, and a clear understanding of what a business actually needs its website to do.
            </p>
            <p>
              Every project I take on gets my full attention. No project managers between you and the work. No outsourced design teams. Just me, focused on making your site the best-looking thing in your market.
            </p>
          </div>
        </div>

        {/* Portrait placeholder + callout */}
        <div className="space-y-8">
          {/* Avatar placeholder */}
          <div
            className="w-full aspect-[4/3] rounded-sm border border-[var(--line)] bg-[var(--bg-raised)] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--line)] mx-auto mb-4 flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-[var(--muted)]">AI</span>
              </div>
              <p className="text-sm text-[var(--muted)]">Aniekan Israel</p>
              <p className="text-xs text-[var(--muted)]/60 mt-1">Founder, SwiftCreator</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '50+', label: 'Projects shipped' },
              { value: '7d', label: 'Average delivery' },
              { value: '100%', label: 'Client ownership' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 border border-[var(--line)] rounded-sm">
                <div className="font-display text-3xl font-bold text-[var(--gold)] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--muted)] leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="mb-24 border-t border-[var(--line)] pt-20">
        <SectionHeading
          eyebrow="How I work"
          title="Principles that shape every project."
          className="mb-12 max-w-xl"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
          {VALUES.map((v, i) => (
            <div key={i} className="bg-[var(--bg)] p-8">
              <div className="w-8 h-px bg-[var(--gold)] mb-6" />
              <h3 className="font-heading font-semibold text-[var(--ink)] mb-3">{v.label}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-24 border-t border-[var(--line)] pt-20">
        <SectionHeading
          eyebrow="Technical skills"
          title="The stack that powers great work."
          className="mb-12 max-w-xl"
        />
        <div className="flex flex-wrap gap-3">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="px-4 py-2 border border-[var(--line)] rounded-sm text-sm font-heading font-medium text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mb-24 border-t border-[var(--line)] pt-20">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="The story"
            title="Why I started SwiftCreator."
            className="mb-10"
          />
          <div className="space-y-5 text-[var(--muted)] leading-relaxed">
            <p>
              I started my first freelance project at 17, building a site for a local boutique on a tight budget and a tighter deadline. That project taught me something most designers never learn: beautiful work is worthless if it doesn&apos;t perform.
            </p>
            <p>
              Over the years I&apos;ve worked with businesses across Nigeria and internationally — from one-person operations trying to get found online, to established brands ready to make a serious digital impression. Every one of them had the same underlying need: a site that works as hard as they do.
            </p>
            <p>
              SwiftCreator is the answer to that need. Premium design, clean code, fast turnaround, and a process that respects your time. The name says it all — we build fast, and we build right.
            </p>
            <p>
              When I&apos;m not building sites, I&apos;m studying the ones that work — analyzing conversion patterns, reading about design psychology, and staying current on the tools and frameworks that keep the work sharp.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--line)] pt-20 text-center">
        <p className="label-micro mb-4">Ready to work together?</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-6">
          Let&apos;s build something remarkable.
        </h2>
        <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
          The conversation is free. The results are worth it.
        </p>
        <Button
          size="xl"
          className="font-heading text-sm tracking-widest uppercase"
          onClick={() => setBookOpen(true)}
        >
          Start a project
        </Button>
      </section>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} />
    </div>
  );
}
