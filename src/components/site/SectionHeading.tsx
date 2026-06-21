import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  titleClassName,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="label-micro mb-4">{eyebrow}</p>
      )}
      <h2
        className={cn(
          'font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--ink)] leading-tight',
          titleClassName
        )}
      >
        {title}
      </h2>
      {/* Gold accent line */}
      <div
        className={cn(
          'mt-4 h-px w-12 bg-[var(--gold)]',
          align === 'center' && 'mx-auto'
        )}
      />
      {subtitle && (
        <p className="mt-5 text-[var(--muted)] text-base md:text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
