import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-sm border border-[var(--line)] bg-[var(--bg-raised)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors duration-150',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
textarea.displayName = 'Textarea';

export { Textarea };
