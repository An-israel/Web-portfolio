'use client';

import { useState } from 'react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { ProjectCard } from '@/components/site/ProjectCard';
import { getAllProjects } from '@/lib/data/site';
import { cn } from '@/lib/utils';
import type { ProjectCategory } from '@/types';

const FILTERS: { label: string; value: ProjectCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'AI Products', value: 'AI Product' },
  { label: 'SaaS', value: 'SaaS' },
  { label: 'Platforms', value: 'Platform' },
];

export default function WorkIndexPage() {
  const projects = getAllProjects();
  const [active, setActive] = useState<ProjectCategory | 'All'>('All');

  const filtered =
    active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      {/* Hero band */}
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-36 pb-16">
          <Reveal>
            <MonoLabel>THE WORK</MonoLabel>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl text-[var(--platinum)]">
              Products, not promises.
            </h1>
            <p className="mt-6 text-lg text-[var(--mist)] max-w-2xl">
              Everything below is real, built end-to-end by me.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filter row */}
      <div className="border-b border-[var(--steel)] sticky top-16 z-30 bg-[var(--obsidian)]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                'mono-label rounded-md px-3 py-2 border transition-colors',
                active === f.value
                  ? 'border-[var(--silver)] text-[var(--platinum)]'
                  : 'border-[var(--steel)] text-[var(--mist)] hover:text-[var(--platinum)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((project, i) => (
              <Reveal key={project.id} delay={(i % 2) * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-[var(--mist)] py-16">Nothing here yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
