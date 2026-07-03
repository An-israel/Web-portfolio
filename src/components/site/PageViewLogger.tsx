'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Fire-and-forget page-view logging. RLS allows anon INSERT on page_views.
 * Silently no-ops if Supabase is unconfigured. Skips /admin.
 */
export function PageViewLogger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    try {
      const supabase = createClient();
      supabase
        .from('page_views')
        .insert({ path: pathname, referrer: document.referrer || null })
        .then(() => {}, () => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
