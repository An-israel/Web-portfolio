import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string;
  italic?: string;
  title: string;
  eyebrow?: string; // legacy alias — renders as badge
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  badge,
  italic,
  title,
  eyebrow,
  subtitle,
  className,
  titleClassName,
  align = 'left',
}: SectionHeadingProps) {
  const pillText = badge || eyebrow;

  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {pillText && (
        <div className={cn('mb-5', align === 'center' && 'flex justify-center')}>
          <span className="section-badge">{pillText}</span>
        </div>
      )}
      <h2
        className={cn(
          'text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-tight text-[var(--ink)]',
          titleClassName
        )}
      >
        {italic && (
          <span className="font-display italic font-normal">{italic} </span>
        )}
        <span className="font-heading font-bold">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-5 text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
