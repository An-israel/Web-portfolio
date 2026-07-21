import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { PulseLine } from '@/components/site/PulseLine';
import { fetchDesignBySlug } from '@/lib/data/queries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const design = await fetchDesignBySlug(slug);
  if (!design) return { title: 'Not found' };
  return {
    title: `${design.title} — Design`,
    description: design.summary || `${design.category} design by Aniekan Israel.`,
    openGraph: design.cover_image_url ? { images: [design.cover_image_url] } : undefined,
  };
}

export default async function DesignDetail({ params }: PageProps) {
  const { slug } = await params;
  const design = await fetchDesignBySlug(slug);
  if (!design) notFound();

  const meta = [
    ['Category', design.category],
    ['Dimensions', design.dimensions || '—'],
    ['Tools', design.tools.length ? design.tools.join(', ') : '—'],
    ['Client', design.client || '—'],
    ['Year', design.year || '—'],
  ];

  return (
    <>
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 pt-32 pb-12">
          <Link
            href="/designs"
            className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            ALL DESIGNS
          </Link>
          <h1 className="mt-6 font-display text-4xl sm:text-6xl text-[var(--platinum)]">
            {design.title}
          </h1>
          {design.summary && (
            <p className="mt-5 text-lg text-[var(--mist)] max-w-2xl">{design.summary}</p>
          )}
        </div>
      </section>

      {/* Cover */}
      {design.cover_image_url && (
        <section className="border-b border-[var(--steel)] bg-[var(--graphite)]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={design.cover_image_url}
              alt={design.title}
              className="w-full rounded-md border border-[var(--steel)]"
            />
          </div>
        </section>
      )}

      {/* Meta */}
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {meta.map(([k, v]) => (
              <div key={k}>
                <MonoLabel className="text-[var(--mist)]">{k}</MonoLabel>
                <p className="mt-1.5 text-sm text-[var(--platinum)]">{v}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Story */}
      {design.story && (
        <section className="border-b border-[var(--steel)]">
          <div className="max-w-[760px] mx-auto px-6 lg:px-8 py-16">
            <MonoLabel>THE STORY</MonoLabel>
            <div className="mt-5 text-lg text-[var(--platinum)] leading-relaxed whitespace-pre-wrap">
              {design.story}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {design.gallery_urls.length > 0 && (
        <section className="border-b border-[var(--steel)] bg-[var(--graphite)]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-12 space-y-8">
            <MonoLabel>GALLERY</MonoLabel>
            {design.gallery_urls.map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={url}
                alt={`${design.title} — ${i + 1}`}
                className="w-full rounded-md border border-[var(--steel)]"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section>
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-20 text-center">
          <PulseLine className="mb-8 max-w-sm mx-auto" />
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--platinum)]">
            Want work like this?
          </h2>
          <Link
            href="/hire"
            className="mt-8 inline-block rounded-md border border-[var(--silver)] px-7 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
          >
            Start a project
          </Link>
        </div>
      </section>
    </>
  );
}
