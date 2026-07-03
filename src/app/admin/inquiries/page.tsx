'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { cn } from '@/lib/utils';
import type { HireInquiry, InquiryStatus } from '@/types';

const STATUSES: (InquiryStatus | 'all')[] = [
  'all',
  'new',
  'reviewing',
  'replied',
  'call_booked',
  'won',
  'lost',
  'archived',
];

const STATUS_COLOR: Record<string, string> = {
  new: 'text-[var(--silver)]',
  reviewing: 'text-[var(--warning)]',
  replied: 'text-[var(--platinum)]',
  call_booked: 'text-[var(--platinum)]',
  won: 'text-[var(--success)]',
  lost: 'text-[var(--mist)]',
  archived: 'text-[var(--mist)]',
};

export default function InquiriesPage() {
  const [rows, setRows] = useState<HireInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InquiryStatus | 'all'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows((data || []) as unknown as HireInquiry[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (q) {
        const hay = `${r.full_name} ${r.email} ${r.company ?? ''}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, filter, q]);

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Inquiries</h1>
      <MonoLabel className="text-[var(--mist)]">{rows.length} TOTAL</MonoLabel>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'mono-label rounded-md px-2.5 py-1.5 border transition-colors',
              filter === s
                ? 'border-[var(--silver)] text-[var(--platinum)]'
                : 'border-[var(--steel)] text-[var(--mist)] hover:text-[var(--platinum)]'
            )}
          >
            {s}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / company"
          className="ml-auto rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-3 py-2 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
        />
      </div>

      <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--steel)] text-left">
              {['Name', 'Company', 'Type', 'Budget', 'Status', 'Priority', 'Received'].map((h) => (
                <th key={h} className="px-4 py-3">
                  <MonoLabel className="text-[var(--mist)]">{h}</MonoLabel>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--mist)]">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--mist)]">
                  No inquiries yet — share your /hire link.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-[var(--steel)] hover:bg-[var(--steel)]/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquiries/${r.id}`} className="flex items-center gap-2">
                      {r.status === 'new' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--silver)]" />
                      )}
                      <span
                        className={cn(
                          'text-[var(--platinum)]',
                          r.status === 'new' && 'font-semibold'
                        )}
                      >
                        {r.full_name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.company || '—'}</td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.project_type}</td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.budget_range || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('mono-label', STATUS_COLOR[r.status])}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.priority}</td>
                  <td className="px-4 py-3">
                    <time className="mono-label text-[var(--mist)]">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </time>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
