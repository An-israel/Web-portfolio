import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import type { Testimonial } from '@/types';

/** Published testimonials from admin. Renders nothing when there are none. */
export function Testimonials({ items, label }: { items: Testimonial[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-[var(--steel)]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
        <Reveal>
          <MonoLabel>{label}</MonoLabel>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl text-[var(--platinum)]">
            What clients say.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 80}>
              <figure className="h-full flex flex-col rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-7">
                <blockquote className="flex-1 text-[var(--platinum)] leading-relaxed whitespace-pre-line">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="w-10 h-10 rounded-full border border-[var(--steel)] flex items-center justify-center font-display text-[var(--mist)]" aria-hidden="true">
                      {t.author_name.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm text-[var(--platinum)]">{t.author_name}</span>
                    {(t.author_role || t.author_company) && (
                      <span className="block text-xs text-[var(--mist)]">
                        {[t.author_role, t.author_company].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
