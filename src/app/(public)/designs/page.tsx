import type { Metadata } from 'next';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { DesignFilter } from '@/components/site/DesignFilter';
import { fetchDesigns } from '@/lib/data/queries';

export const metadata: Metadata = {
  title: 'Designs',
  description:
    'Visual design work by Aniekan Israel — brand identity, posters, social media, UI, and more. The craft behind the products.',
};

export default async function DesignsPage() {
  const designs = await fetchDesigns();

  return (
    <>
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-36 pb-16">
          <Reveal>
            <MonoLabel>THE DESIGNS</MonoLabel>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl text-[var(--platinum)]">
              The craft, up close.
            </h1>
            <p className="mt-6 text-lg text-[var(--mist)] max-w-2xl">
              Brand systems, posters, social, and interface work — with the story and the specs
              behind each piece.
            </p>
          </Reveal>
        </div>
      </section>

      <DesignFilter designs={designs} />
    </>
  );
}
