'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';

type Row = { key: string; n: number };
interface Stats {
  total: number;
  hire: number;
  by_day: { day: string; n: number }[];
  by_path: Row[];
  by_ref: Row[];
}

const DAYS = 30;

export default function AnalyticsAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [inquiries, setInquiries] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const since = new Date(Date.now() - DAYS * 864e5).toISOString();
    // Counted in the database (no row cap); inquiries use the same 30-day window.
    Promise.all([
      supabase.rpc('page_view_stats', { since }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).gte('created_at', since),
    ]).then(([v, i]) => {
      if (v.error) setError('Run the 0006 migration in Supabase to enable analytics.');
      setStats((v.data as unknown as Stats) ?? null);
      setInquiries(i.count || 0);
      setNow(Date.now());
      setLoading(false);
    });
  }, []);

  const byDay = new Map((stats?.by_day ?? []).map((d) => [d.day, d.n]));
  const lagosDay = (t: number) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = lagosDay(now - (DAYS - 1 - i) * 864e5);
    return { d, n: byDay.get(d) || 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));
  const hireViews = stats?.hire ?? 0;
  const conv = hireViews > 0 ? Math.round((inquiries / hireViews) * 100) : 0;

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Analytics</h1>
      <MonoLabel className="text-[var(--mist)]">LAST 30 DAYS · EXCLUDES YOUR OWN VISITS AND BOTS</MonoLabel>
      {error && <p className="mt-4 text-sm text-[var(--warning)]">{error}</p>}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="TOTAL VIEWS" value={stats?.total ?? 0} />
        <Stat label="INQUIRIES (30 DAYS)" value={inquiries} />
        <Stat label="/HIRE → INQUIRY" value={`${conv}%`} />
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
        <TopList title="TOP PAGES" rows={(stats?.by_path ?? []).map((r) => [r.key, r.n])} />
        <TopList title="TOP REFERRERS" rows={(stats?.by_ref ?? []).map((r) => [r.key, r.n])} />
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
