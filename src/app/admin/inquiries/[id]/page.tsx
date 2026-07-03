'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Mail, Archive, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { HireInquiry, InquiryStatus } from '@/types';

const STATUSES: InquiryStatus[] = [
  'new',
  'reviewing',
  'replied',
  'call_booked',
  'won',
  'lost',
  'archived',
];
const PRIORITIES = ['high', 'normal', 'low'] as const;

export default function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [row, setRow] = useState<HireInquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const r = data as unknown as HireInquiry;
          setRow(r);
          setNotes(r.internal_notes || '');
          if (r.status === 'new') {
            supabase.from('inquiries').update({ status: 'reviewing' }).eq('id', id).then(() => {});
          }
        }
      });
  }, [id]);

  async function patch(patch: Partial<HireInquiry>) {
    if (!row) return;
    setRow({ ...row, ...patch });
    const supabase = createClient();
    await supabase.from('inquiries').update(patch).eq('id', id);
    setSaved('Saved');
    setTimeout(() => setSaved(''), 1500);
  }

  async function saveNotes() {
    await patch({ internal_notes: notes });
  }

  async function remove() {
    if (!confirm('Delete this inquiry permanently?')) return;
    const supabase = createClient();
    await supabase.from('inquiries').delete().eq('id', id);
    router.push('/admin/inquiries');
  }

  if (!row) {
    return <p className="text-[var(--mist)]">Loading…</p>;
  }

  const mailto = `mailto:${row.email}?subject=${encodeURIComponent(
    'Re: your inquiry — Aniekan Israel'
  )}`;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/inquiries"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> ALL INQUIRIES
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)]">{row.full_name}</h1>
          <p className="mt-1 text-[var(--mist)]">
            {row.email}
            {row.company ? ` · ${row.role_at_company || 'team'} @ ${row.company}` : ''}
          </p>
        </div>
        {saved && <MonoLabel className="text-[var(--success)]">{saved}</MonoLabel>}
      </div>

      {/* Meta grid */}
      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          ['Type', row.project_type],
          ['Budget', row.budget_range || '—'],
          ['Timeline', row.timeline || '—'],
          ['How found', row.how_found || '—'],
          ['Received', new Date(row.created_at).toLocaleString('en-GB')],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-3">
            <MonoLabel className="text-[var(--mist)]">{k}</MonoLabel>
            <p className="mt-1 text-sm text-[var(--platinum)]">{v}</p>
          </div>
        ))}
      </dl>

      {/* Description */}
      <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
        <MonoLabel className="text-[var(--mist)]">THE ASK</MonoLabel>
        <p className="mt-2 text-sm text-[var(--platinum)] whitespace-pre-wrap leading-relaxed">
          {row.description}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">STATUS</MonoLabel>
          <select
            value={row.status}
            onChange={(e) => patch({ status: e.target.value as InquiryStatus })}
            className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-3 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">PRIORITY</MonoLabel>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => patch({ priority: p })}
                className={`mono-label rounded-md px-3 py-2.5 border transition-colors ${
                  row.priority === p
                    ? 'border-[var(--silver)] text-[var(--platinum)]'
                    : 'border-[var(--steel)] text-[var(--mist)] hover:text-[var(--platinum)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <MonoLabel className="text-[var(--mist)] block mb-2">INTERNAL NOTES</MonoLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={4}
          placeholder="Private — only you see this."
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(row.email)}
          className="inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)]"
        >
          <Copy className="w-4 h-4" /> Copy email
        </button>
        <a
          href={mailto}
          className="inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)]"
        >
          <Mail className="w-4 h-4" /> Reply
        </a>
        <button
          onClick={() => patch({ status: 'archived' })}
          className="inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--mist)] hover:text-[var(--platinum)]"
        >
          <Archive className="w-4 h-4" /> Archive
        </button>
        <button
          onClick={remove}
          className="inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--danger)] hover:border-[var(--danger)] ml-auto"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}
