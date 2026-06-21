'use client';

import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PricingTier as PricingTierType } from '@/types';

interface PricingTierProps {
  tier: PricingTierType;
  onBookClick?: (tierName: string) => void;
  compact?: boolean;
}

export function PricingTier({ tier, onBookClick, compact = false }: PricingTierProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col border rounded-sm transition-all duration-200',
        tier.is_highlighted
          ? 'border-[var(--gold)] bg-[var(--bg-raised)] shadow-lg shadow-[var(--gold)]/10'
          : 'border-[var(--line)] bg-[var(--bg-raised)]',
        compact ? 'p-6' : 'p-8'
      )}
    >
      {tier.is_highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--gold)] text-[var(--bg)] text-xs font-heading font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
            Most popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className={cn('mb-6', compact && 'mb-4')}>
        <p className="label-micro mb-2">{tier.name}</p>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'font-display font-bold text-[var(--ink)]',
              compact ? 'text-3xl' : 'text-4xl'
            )}
          >
            {tier.price_label}
          </span>
        </div>
        {tier.summary && (
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
            {tier.summary}
          </p>
        )}
      </div>

      {/* Delivery */}
      <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[var(--line)]">
        <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
        <span className="text-sm text-[var(--muted)]">
          Delivered in{' '}
          <span className="text-[var(--ink)] font-heading font-medium">
            {tier.delivery_days} day{tier.delivery_days !== 1 ? 's' : ''}
          </span>
        </span>
      </div>

      {/* Features */}
      {!compact && (
        <ul className="space-y-3 mb-8 flex-1">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--muted)]">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {compact && tier.features.length > 0 && (
        <ul className="space-y-2 mb-6 flex-1">
          {tier.features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
              <span className="text-xs text-[var(--muted)]">{feature}</span>
            </li>
          ))}
          {tier.features.length > 4 && (
            <li className="text-xs text-[var(--muted)] pl-6">
              +{tier.features.length - 4} more
            </li>
          )}
        </ul>
      )}

      {/* CTA */}
      <Button
        variant={tier.is_highlighted ? 'default' : 'outline'}
        size={compact ? 'default' : 'lg'}
        className={cn(
          'w-full font-heading text-xs tracking-widest uppercase mt-auto',
          compact && 'text-xs'
        )}
        onClick={() => onBookClick?.(tier.name)}
      >
        Get started
      </Button>
    </div>
  );
}
