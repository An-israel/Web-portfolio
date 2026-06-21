'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookDialog } from '@/components/site/BookDialog';

export function CaseStudyCTA({ projectTitle }: { projectTitle: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-[var(--line)] pt-16 text-center">
      <p className="label-micro mb-4">Inspired?</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-6">
        Want something like {projectTitle}?
      </h2>
      <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
        Let&apos;s talk about building something this good — or better — for your business.
      </p>
      <Button
        size="xl"
        className="font-heading text-sm tracking-widest uppercase"
        onClick={() => setOpen(true)}
      >
        Start a project
      </Button>
      <BookDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
