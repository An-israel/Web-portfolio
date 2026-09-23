'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Plus, Tags, MessageCircle, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { useBriefPricing } from '@/components/admin/useBriefPricing';
import { formatNaira } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  BRIEF_STATUSES,
  BRIEF_STATUS_LABEL,
  briefInviteText,
  briefLink,
  estimateBrief,
  whatsAppTo,
  type BriefStatus,
} from '@/lib/brief';
import type { ClientBrief } from '@/types';

const STATUS_COLOR: Record<BriefStatus, string> = {
  sent: 'text-[var(--mist)]',
  submitted: 'text-[var(--silver)]',
  reviewing: 'text-[var(--warning)]',
  quoted: 'text-[var(--platinum)]',
  won: 'text-[var(--success)]',
  lost: 'text-[var(--mist)]',
  archived: 'text-[var(--mist)]',
};

export default function BriefsAdmin() {
  const pricing = useBriefPricing();
  const [rows, setRows] = useState<ClientBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BriefStatus | 'all'>('all');
  const [draft, setDraft] = useState({ client_name: '', client_phone: '', client_email: '', note: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<ClientBrief | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('client_briefs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows((data || []) as unknown as ClientBrief[]);
        setLoading(false);
      });
  }, []);

  async function create() {
    setError('');
    if (!draft.client_name.trim()) return setError('Enter the client’s name.');
    setCreating(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('client_briefs')
      .insert({
        client_name: draft.client_name.trim(),
        client_phone: draft.client_phone.trim() || null,
        client_email: draft.client_email.trim() || null,
        note: draft.note.trim() || null,
      })
      .select('*')
      .single();
    setCreating(false);
    if (err || !data) return setError(err?.message || 'Could not create the link.');
    const row = data as unknown as ClientBrief;
    setRows((rs) => [row, ...rs]);
    setCreated(row);
    setDraft({ client_name: '', client_phone: '', client_email: '', note: '' });
  }

  function copy(token: string) {
    navigator.clipboard.writeText(briefLink(token));
    setCopied(token);
    setTimeout(() => setCopied(''), 1500);
  }

  const filtered = useMemo(
    () => rows.filter((r) => filter === 'all' || r.status === filter),
    [rows, filter]
  );

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Client Briefs</h1>
          <MonoLabel className="text-[var(--mist)]">
            {rows.length} TOTAL · {rows.filter((r) => r.status === 'submitted').length} NEW
          </MonoLabel>
        </div>
        <Link
          href="/admin/briefs/pricing"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--steel)] hover:border-[var(--silver)] px-4 py-2.5 text-sm text-[var(--platinum)]"
        >
          <Tags className="w-4 h-4" /> Pricing
        </Link>
      </div>

      {/* New client link */}
      <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
        <MonoLabel className="text-[var(--mist)]">NEW CLIENT LINK</MonoLabel>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input value={draft.client_name} onChange={(v) => setDraft({ ...draft, client_name: v })} placeholder="Client name *" />
          <Input value={draft.client_phone} onChange={(v) => setDraft({ ...draft, client_phone: v })} placeholder="WhatsApp number" />
          <Input value={draft.client_email} onChange={(v) => setDraft({ ...draft, client_email: v })} placeholder="Email" />
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <Input value={draft.note} onChange={(v) => setDraft({ ...draft, note: v })} placeholder="Private note (e.g. referred by Tolu)" />
          <button
            onClick={create}
            disabled={creating}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> {creating ? 'Creating…' : 'Create link'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

        {created && (
          <div className="mt-4 rounded-md border border-[var(--silver)] p-4">
            <p className="text-sm text-[var(--platinum)]">
              Link ready for <b>{created.client_name}</b>:
            </p>
            <p className="mt-2 text-sm text-[var(--mist)] break-all">{briefLink(created.token)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton onClick={() => copy(created.token)}>
                {copied === created.token ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy link
              </ActionButton>
              {created.client_phone && (
                <a
                  href={whatsAppTo(created.client_phone, briefInviteText(created.client_name, briefLink(created.token)))}
                  target="_blank"
                  rel="noreferrer"
                  className={actionCls}
                >
                  <MessageCircle className="w-4 h-4" /> Send on WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(['all', ...BRIEF_STATUSES] as const).map((s) => (
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
            {s === 'all' ? 'all' : BRIEF_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-12 text-center">
          <p className="metal-text font-display text-4xl">No briefs yet</p>
          <p className="mt-3 text-sm text-[var(--mist)]">
            Create a client link above and send it to your client. (Run the 0005 migration first.)
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--steel)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--graphite)]">
              <tr className="text-left">
                {['Client', 'Business', 'Status', 'Estimate', 'Created', ''].map((h) => (
                  <th key={h} className="px-4 py-3 mono-label text-[var(--mist)] font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--steel)]">
              {filtered.map((r) => {
                const est = r.answers && pricing ? estimateBrief(r.answers, pricing) : null;
                return (
                  <tr key={r.id} className="hover:bg-[var(--graphite)]/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/briefs/${r.id}`} className="text-[var(--platinum)] hover:underline">
                        {r.client_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--mist)]">{r.answers?.business_name || '—'}</td>
                    <td className={cn('px-4 py-3 mono-label', STATUS_COLOR[r.status] ?? 'text-[var(--mist)]')}>
                      {BRIEF_STATUS_LABEL[r.status] ?? r.status}
                    </td>
                    <td className="px-4 py-3 text-[var(--platinum)]">
                      {est ? (
                        <>
                          {formatNaira(est.oneOff.naira)}
                          {est.monthly.naira > 0 && (
                            <span className="text-[var(--mist)]"> + {formatNaira(est.monthly.naira)}/mo</span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--mist)]">
                      {new Date(r.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copy(r.token)}
                        className="mono-label text-[var(--silver)] hover:text-[var(--white)]"
                      >
                        {copied === r.token ? 'Copied' : 'Copy link'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const actionCls =
  'inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)]';

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={actionCls}>
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-2.5 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
    />
  );
}
