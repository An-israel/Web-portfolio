'use client';

import { useMemo, useState } from 'react';
import { Reveal } from '@/components/site/Reveal';
import { DesignCard } from '@/components/site/DesignCard';
import { cn } from '@/lib/utils';
import type { Design } from '@/types';

export function DesignFilter({ designs }: { designs: Design[] }) {
  const categories = useMemo(() => {
    const set = new Set(designs.map((d) => d.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [designs]);

  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? designs : designs.filter((d) => d.category === active);

  return (
    <>
      {categories.length > 2 && (
        <div className="border-b border-[var(--steel)] sticky top-16 z-30 bg-[var(--obsidian)]/80 backdrop-blur-md">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  'mono-label rounded-md px-3 py-2 border transition-colors',
                  active === c
                    ? 'border-[var(--silver)] text-[var(--platinum)]'
                    : 'border-[var(--steel)] text-[var(--mist)] hover:text-[var(--platinum)]'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <section>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="metal-text font-display text-5xl">Designs</p>
              <p className="mt-4 text-[var(--mist)]">New work is on the way.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((design, i) => (
                <Reveal key={design.id} delay={(i % 3) * 80}>
                  <DesignCard design={design} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
