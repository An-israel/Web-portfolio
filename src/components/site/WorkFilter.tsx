'use client';

import { useState } from 'react';
import { Reveal } from '@/components/site/Reveal';
import { ProjectCard } from '@/components/site/ProjectCard';
import { cn } from '@/lib/utils';
import type { ProjectCategory, WorkProject } from '@/types';

const FILTERS: { label: string; value: ProjectCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'AI Products', value: 'AI Product' },
  { label: 'SaaS', value: 'SaaS' },
  { label: 'Platforms', value: 'Platform' },
];

export function WorkFilter({ projects }: { projects: WorkProject[] }) {
  const [active, setActive] = useState<ProjectCategory | 'All'>('All');
  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <>
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
