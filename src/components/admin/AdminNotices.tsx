'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminNotice } from '@/lib/admin-client';

/** Toast area for admin save errors/successes (see lib/admin-client). */
export function AdminNotices() {
  const [items, setItems] = useState<(AdminNotice & { id: number })[]>([]);

  useEffect(() => {
    const onNotice = (e: Event) => {
      const detail = (e as CustomEvent<AdminNotice>).detail;
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs.slice(-2), { ...detail, id }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), detail.kind === 'error' ? 7000 : 2500);
    };
    window.addEventListener('admin-notice', onNotice);
    return () => window.removeEventListener('admin-notice', onNotice);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2 sm:w-96" role="status" aria-live="polite">
      {items.map((n) => (
        <div
          key={n.id}
          className={cn(
            'flex items-start gap-3 rounded-md border bg-[var(--graphite)] px-4 py-3 text-sm shadow-lg',
            n.kind === 'error' ? 'border-[var(--danger)] text-[var(--platinum)]' : 'border-[var(--success)] text-[var(--platinum)]'
          )}
        >
          <span className="flex-1">{n.message}</span>
          <button onClick={() => setItems((xs) => xs.filter((x) => x.id !== n.id))} aria-label="Dismiss" className="text-[var(--mist)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
