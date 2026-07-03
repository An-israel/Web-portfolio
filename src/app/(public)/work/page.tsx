import type { Metadata } from 'next';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { WorkFilter } from '@/components/site/WorkFilter';
import { fetchAllProjects } from '@/lib/data/queries';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Products, not promises. Everything here is real, built end-to-end by Aniekan Israel.',
};

export default async function WorkIndexPage() {
  const projects = await fetchAllProjects();

  return (
    <>
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

      <WorkFilter projects={projects} />
    </>
  );
}
