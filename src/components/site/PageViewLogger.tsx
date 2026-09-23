'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;
const SKIP_PREFIXES = ['/admin', '/brief'];

/**
 * Fire-and-forget page-view logging (RLS allows anon INSERT on page_views).
 * Skips admin and private brief pages, bots, and your own visits while
 * signed in to the admin. Silently no-ops if Supabase is unconfigured.
 */
export function PageViewLogger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (navigator.webdriver || BOT_RE.test(navigator.userAgent)) return;
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) return; // that's you
        supabase
          .from('page_views')
          .insert({ path: pathname, referrer: document.referrer || null })
          .then(
            () => {},
            () => {}
          );
      }, () => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
