import { cn } from '@/lib/utils';

interface MonoLabelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

/** JetBrains Mono eyebrow / label / metadata — the engineer signal. */
export function MonoLabel({ children, className, as: Tag = 'span' }: MonoLabelProps) {
  return <Tag className={cn('mono-label', className)}>{children}</Tag>;
}
