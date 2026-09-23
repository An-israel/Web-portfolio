'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { checkSave } from '@/lib/admin-client';
import { formatNaira } from '@/lib/format';
import { whatsAppTo } from '@/lib/brief';
import { cn } from '@/lib/utils';
import type { Enrolment, EnrolmentStatus } from '@/types';

const STATUSES: EnrolmentStatus[] = ['pending', 'paid', 'cancelled'];
const STATUS_LABEL: Record<EnrolmentStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  cancelled: 'Cancelled',
};
const STATUS_COLOR: Record<EnrolmentStatus, string> = {
  pending: 'text-[var(--warning)]',
  paid: 'text-[var(--success)]',
  cancelled: 'text-[var(--mist)]',
};

export default function EnrolmentsAdmin() {
  const [rows, setRows] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<EnrolmentStatus | 'all'>('all');

  useEffect(() => {
    createClient()
      .from('enrolments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError('Run the 0006 migration in Supabase to enable enrolments.');
        setRows((data || []) as unknown as Enrolment[]);
        setLoading(false);
      });
  }, []);

  async function patch(id: string, p: Partial<Enrolment>) {
    const before = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
    const res = await createClient().from('enrolments').update(p).eq('id', id);
    checkSave(res, { revert: () => setRows(before), publicChange: false });
  }

  async function remove(id: string) {
    if (!confirm('Delete this enrolment?')) return;
    const res = await createClient().from('enrolments').delete().eq('id', id);
    if (checkSave(res, { publicChange: false })) setRows((rs) => rs.filter((r) => r.id !== id));
  }

  const filtered = useMemo(() => rows.filter((r) => filter === 'all' || r.status === filter), [rows, filter]);
  const paidTotal = rows.filter((r) => r.status === 'paid').reduce((t, r) => t + r.amount_naira, 0);

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Enrolments</h1>
      <MonoLabel className="text-[var(--mist)]">
        {rows.length} TOTAL · {rows.filter((r) => r.status === 'pending').length} AWAITING PAYMENT ·{' '}
        {formatNaira(paidTotal)} PAID
      </MonoLabel>
      <p className="mt-3 text-sm text-[var(--mist)] max-w-2xl">
        Students appear here when they fill in their details in the Coaching “Enrol” popup. Once their
        receipt arrives on WhatsApp, mark them Paid.
      </p>
      {error && <p className="mt-3 text-sm text-[var(--warning)]">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', ...STATUSES] as const).map((s) => (
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
            {s === 'all' ? 'all' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-12 text-center">
          <p className="metal-text font-display text-4xl">No enrolments yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[var(--platinum)]">
                    {r.full_name} <span className="text-[var(--mist)]">· {r.course_title}</span>
                  </p>
                  <p className="text-sm text-[var(--mist)] break-all">
                    {r.phone}
                    {r.email ? ` · ${r.email}` : ''} · {formatNaira(r.amount_naira)} ·{' '}
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={r.status}
                    onChange={(e) => patch(r.id, { status: e.target.value as EnrolmentStatus })}
                    className={cn(
                      'rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-3 py-2 text-sm focus:outline-none',
                      STATUS_COLOR[r.status]
                    )}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <a
                    href={whatsAppTo(r.phone, `Hi ${r.full_name.split(' ')[0]}, thanks for enrolling in ${r.course_title}! `)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mono-label rounded-md border border-[var(--steel)] px-3 py-2 text-[var(--mist)] hover:text-[var(--platinum)]"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <button onClick={() => remove(r.id)} className="p-2 text-[var(--mist)] hover:text-[var(--danger)]" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <NotesField
                value={r.notes || ''}
                onSave={(notes) => notes !== (r.notes || '') && patch(r.id, { notes })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onSave(v)}
      placeholder="Private note (e.g. paid via transfer, added to WhatsApp group)"
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-3 py-2 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
    />
  );
}
