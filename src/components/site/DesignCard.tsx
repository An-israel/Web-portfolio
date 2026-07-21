import Link from 'next/link';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { Design } from '@/types';

export function DesignCard({ design }: { design: Design }) {
  return (
    <Link
      href={`/designs/${design.slug}`}
      className="group block rounded-md overflow-hidden border border-[var(--steel)] bg-[var(--graphite)] hover:border-[var(--silver)] transition-colors"
    >
      <div className="relative aspect-[4/3] bg-[var(--obsidian)] overflow-hidden">
        {design.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={design.cover_image_url}
            alt={design.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="metal-text font-display text-4xl">AI</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[var(--obsidian)] to-transparent">
          <MonoLabel className="text-[var(--silver)]">{design.category}</MonoLabel>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg text-[var(--platinum)] truncate">{design.title}</h3>
          {design.dimensions && (
            <MonoLabel className="text-[var(--mist)]">{design.dimensions}</MonoLabel>
          )}
        </div>
      </div>
    </Link>
  );
}
