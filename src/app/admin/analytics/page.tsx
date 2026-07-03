'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';

interface View {
  path: string;
  referrer: string | null;
  created_at: string;
}

export default function AnalyticsAdmin() {
  const [views, setViews] = useState<View[]>([]);
  const [inqMonth, setInqMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from('page_views').select('path, referrer, created_at').gte('created_at', since),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),
    ]).then(([v, i]) => {
      setViews((v.data || []) as View[]);
      setInqMonth(i.count || 0);
      setLoading(false);
    });
  }, []);

  const byDay = new Map<string, number>();
  const byPath = new Map<string, number>();
  const byRef = new Map<string, number>();
  for (const v of views) {
    const day = v.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
    byPath.set(v.path, (byPath.get(v.path) || 0) + 1);
    const ref = v.referrer ? new URL(v.referrer, 'http://x').hostname || 'direct' : 'direct';
    byRef.set(ref, (byRef.get(ref) || 0) + 1);
  }
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
    return { d, n: byDay.get(d) || 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));
  const hireViews = byPath.get('/hire') || 0;
  const conv = hireViews > 0 ? Math.round((inqMonth / hireViews) * 100) : 0;

  const top = (m: Map<string, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Analytics</h1>
      <MonoLabel className="text-[var(--mist)]">LAST 30 DAYS</MonoLabel>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="TOTAL VIEWS" value={views.length} />
        <Stat label="INQUIRIES (MONTH)" value={inqMonth} />
        <Stat label="/HIRE CONVERSION" value={`${conv}%`} />
      </div>

      {/* Bar chart */}
      <div className="mt-8 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
        <MonoLabel className="text-[var(--mist)]">VIEWS PER DAY</MonoLabel>
        <div className="mt-4 flex items-end gap-1 h-32">
          {days.map((d) => (
            <div key={d.d} className="flex-1 group relative">
              <div
                className="bg-[var(--silver)]/60 group-hover:bg-[var(--silver)] rounded-sm transition-colors"
                style={{ height: `${(d.n / maxDay) * 100}%`, minHeight: d.n ? '2px' : '0' }}
                title={`${d.d}: ${d.n}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TopList title="TOP PAGES" rows={top(byPath)} />
        <TopList title="TOP REFERRERS" rows={top(byRef)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
      <p className="font-display text-3xl text-[var(--platinum)]">{value}</p>
      <MonoLabel className="mt-2 block text-[var(--mist)]">{label}</MonoLabel>
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
      <MonoLabel className="text-[var(--mist)]">{title}</MonoLabel>
      <ul className="mt-4 space-y-2">
        {rows.length === 0 && <li className="text-sm text-[var(--mist)]">No data yet.</li>}
        {rows.map(([k, n]) => (
          <li key={k} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--platinum)] truncate">{k}</span>
            <span className="mono-label text-[var(--mist)] shrink-0">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
