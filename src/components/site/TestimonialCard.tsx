import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'p-8 border border-[var(--line)] bg-[var(--bg-raised)] rounded-sm',
        className
      )}
    >
      {/* Quote mark */}
      <div className="text-4xl font-display text-[var(--gold)] leading-none mb-4 opacity-60">
        &ldquo;
      </div>
      <blockquote className="text-base text-[var(--muted)] leading-relaxed mb-6">
        {testimonial.quote}
      </blockquote>
      <div className="flex items-center gap-3">
        {testimonial.author_avatar_url ? (
          <img
            src={testimonial.author_avatar_url}
            alt={testimonial.author_name}
            className="w-10 h-10 rounded-full object-cover border border-[var(--line)]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--line)] flex items-center justify-center">
            <span className="text-sm font-heading font-semibold text-[var(--muted)]">
              {testimonial.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-heading font-semibold text-[var(--ink)]">
            {testimonial.author_name}
          </p>
          {testimonial.author_role && (
            <p className="text-xs text-[var(--muted)]">{testimonial.author_role}</p>
          )}
        </div>
      </div>
    </div>
  );
}
