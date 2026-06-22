import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-xs font-heading font-semibold uppercase tracking-widest text-[var(--muted)] mb-2',
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label };
