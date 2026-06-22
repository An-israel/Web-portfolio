'use client';

import { useState, useEffect } from 'react';

interface CurrencyState {
  code: string;
  rate: number; // 1 NGN = rate [local currency]
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const controller1 = new AbortController();
        const t1 = setTimeout(() => controller1.abort(), 4000);
        const geoRes = await fetch('https://ipapi.co/json/', { signal: controller1.signal });
        clearTimeout(t1);
        if (!geoRes.ok) return;
        const geo = await geoRes.json();
        const code: string = geo.currency;
        if (!code || code === 'NGN') return;

        const controller2 = new AbortController();
        const t2 = setTimeout(() => controller2.abort(), 4000);
        const rateRes = await fetch('https://open.er-api.com/v6/latest/NGN', {
          signal: controller2.signal,
        });
        clearTimeout(t2);
        if (!rateRes.ok) return;
        const rateData = await rateRes.json();
        const rate: number = rateData.rates?.[code];
        if (!rate || rate <= 0) return;

        if (!cancelled) setCurrency({ code, rate });
      } catch {
        // fail silently — NGN fallback shown
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  function formatNGN(ngnAmount: number): string {
    if (!currency) {
      if (ngnAmount >= 1_000_000) return `₦${(ngnAmount / 1_000_000).toFixed(1)}M`;
      if (ngnAmount >= 1_000) return `₦${Math.round(ngnAmount / 1000)}k`;
      return `₦${ngnAmount.toLocaleString()}`;
    }
    const converted = ngnAmount * currency.rate;
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: 0,
      }).format(converted);
    } catch {
      return `${currency.code} ${Math.round(converted).toLocaleString()}`;
    }
  }

  return { currency, formatNGN };
}
