import { cn } from '@/lib/utils';

interface PulseLineProps {
  className?: string;
  /** static = no sweep animation (used in footer / reduced contexts) */
  animated?: boolean;
}

/**
 * The signature "system status" motif — a thin oscilloscope/heartbeat
 * trace rendered in silver at low opacity. Use sparingly (hero + footer).
 */
export function PulseLine({ className, animated = true }: PulseLineProps) {
  return (
    <div className={cn('pulse-wrap', className)} aria-hidden="true">
      <svg viewBox="0 0 1400 40" preserveAspectRatio="none" role="presentation">
        <path
          className={animated ? 'pulse-trace' : undefined}
          style={
            animated
              ? undefined
              : { stroke: 'currentColor', strokeWidth: 1, fill: 'none' }
          }
          d="M0,20 L420,20 L440,20 L455,6 L475,34 L495,12 L512,20 L560,20 L580,20 L600,20 L980,20 L1000,20 L1015,10 L1035,30 L1052,20 L1400,20"
        />
      </svg>
    </div>
  );
}
