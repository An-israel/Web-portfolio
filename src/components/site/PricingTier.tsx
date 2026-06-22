'use client';

import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingTier as PricingTierType } from '@/types';

interface PricingTierProps {
  tier: PricingTierType;
  onBookClick?: (tierName: string) => void;
  compact?: boolean;
  convertedPrice?: string;
}

export function PricingTier({ tier, onBookClick, convertedPrice }: PricingTierProps) {
  const displayPrice = convertedPrice || tier.price_label;
  const isCustom = tier.price_label.toLowerCase() === 'custom';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden',
        tier.is_highlighted
          ? 'border-[var(--gold)]/25 bg-[var(--bg-card)] shadow-xl shadow-black/40'
          : 'border-[var(--line)] bg-[var(--bg-card)]'
      )}
    >
      {tier.is_highlighted && (
        <div className="absolute top-4 right-4">
          <span className="section-badge text-[var(--gold)] border-[var(--gold)]/30">
            ★ Popular
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Icon circle */}
        <div className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center mb-5">
          <Settings className="w-3.5 h-3.5 text-[var(--muted)]" />
        </div>

        {/* Plan name + summary */}
        <h3 className="font-heading font-semibold text-base text-[var(--ink)] mb-1">
          {tier.name} Plan
        </h3>
        {tier.summary && (
          <p className="text-xs text-[var(--muted)] leading-relaxed mb-5">{tier.summary}</p>
        )}

        {/* Price */}
        <div className="mb-5">
          {isCustom ? (
            <span className="font-heading font-bold text-4xl text-[var(--ink)]">Custom</span>
          ) : (
            <div className="flex items-end gap-1.5 flex-wrap">
              <span className="font-heading font-bold text-4xl text-[var(--ink)]">
                {displayPrice}+
              </span>
              <span className="text-sm text-[var(--muted)] mb-1">/ Project</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onBookClick?.(tier.name)}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-heading font-semibold transition-colors duration-200',
            tier.is_highlighted
              ? 'bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold-soft)]'
              : 'bg-[var(--bg-raised)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
          )}
        >
          Get Started
        </button>
      </div>

      {/* Divider + features */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="text-xs text-[var(--muted)] font-heading">Plan Detail</span>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <ul className="space-y-3">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border border-[var(--line)] shrink-0 mt-0.5" />
              <span className="text-xs text-[var(--muted)] leading-relaxed">{feature}</span>
            </li>
          ))}
          {tier.delivery_days && (
            <li className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border border-[var(--line)] shrink-0 mt-0.5" />
              <span className="text-xs text-[var(--muted)]">
                {tier.delivery_days}-day delivery
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
