'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BRIEF_PRICING_KEY, normalizePricing, type BriefPricing } from '@/lib/brief';

/** Loads the admin-only brief pricing (falls back to defaults until saved). */
export function useBriefPricing() {
  const [pricing, setPricing] = useState<BriefPricing | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', BRIEF_PRICING_KEY)
      .maybeSingle()
      .then(({ data }) => setPricing(normalizePricing(data?.value)));
  }, []);

  return pricing;
}
