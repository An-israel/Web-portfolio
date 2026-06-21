import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold-soft)] shadow-lg shadow-[var(--gold)]/20',
        outline:
          'border border-[var(--line)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold)] bg-transparent',
        ghost:
          'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-raised)] bg-transparent',
        destructive:
          'bg-red-600 text-white hover:bg-red-500',
        link:
          'text-[var(--gold)] underline-offset-4 hover:underline bg-transparent p-0 h-auto',
        secondary:
          'bg-[var(--bg-raised)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--muted)]',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-sm rounded-sm',
        sm: 'h-9 px-4 py-2 text-xs rounded-sm',
        lg: 'h-13 px-8 py-3.5 text-sm rounded-sm',
        xl: 'h-14 px-10 py-4 text-base rounded-sm',
        icon: 'h-10 w-10 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
