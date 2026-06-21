import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-heading font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-raised)] text-[var(--muted)] border border-[var(--line)]',
        gold: 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20',
        outline: 'border border-[var(--line)] text-[var(--muted)]',
        success: 'bg-green-950 text-green-400 border border-green-800/30',
        destructive: 'bg-red-950 text-red-400 border border-red-800/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
