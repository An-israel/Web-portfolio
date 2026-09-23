'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Mail, MessageCircle, Trash2, FileText, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { useBriefPricing } from '@/components/admin/useBriefPricing';
import { formatNaira } from '@/lib/format';
import {
  BRIEF_BUCKET,
  BRIEF_STATUSES,
  BRIEF_STATUS_LABEL,
  BRIEF_TIMELINES,
  briefInviteText,
  briefLink,
  estimateBrief,
  formatUsd,
  whatsAppTo,
  type BriefStatus,
} from '@/lib/brief';
import type { ClientBrief } from '@/types';

export default function BriefDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pricing = useBriefPricing();
  const [row, setRow] = useState<ClientBrief | null>(null);
  const [notes, setNotes] = useState('');
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('client_briefs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return;
        const r = data as unknown as ClientBrief;
        setRow(r);
        setNotes(r.internal_notes || '');
        const paths = (r.answers?.attachments || []).map((f) => f.path);
        if (paths.length) {
          const { data: signed } = await supabase.storage.from(BRIEF_BUCKET).createSignedUrls(paths, 60 * 60);
          setFileUrls(Object.fromEntries((signed || []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl])));
        }
        if (r.status === 'submitted') {
          setRow({ ...r, status: 'reviewing' });
          supabase.from('client_briefs').update({ status: 'reviewing' }).eq('id', id).then(() => {});
        }
      });
  }, [id]);

  async function patch(p: Partial<ClientBrief>) {
    if (!row) return;
    setRow({ ...row, ...p });
    const supabase = createClient();
    await supabase.from('client_briefs').update(p).eq('id', id);
    setSaved('Saved');
    setTimeout(() => setSaved(''), 1500);
  }

  async function remove() {
    if (!row || !confirm('Delete this brief and its uploaded files permanently?')) return;
    const supabase = createClient();
    const paths = (row.answers?.attachments || []).map((f) => f.path);
    const { data: stray } = await supabase.storage.from(BRIEF_BUCKET).list(row.id, { limit: 100 });
    const all = new Set([...paths, ...(stray || []).map((f) => `${row.id}/${f.name}`)]);
    if (all.size) await supabase.storage.from(BRIEF_BUCKET).remove([...all]);
    await supabase.from('client_briefs').delete().eq('id', id);
    router.push('/admin/briefs');
  }

  if (!row) return <p className="text-[var(--mist)]">Loading…</p>;

  const a = row.answers;
  const phone = a?.phone || row.client_phone;
  const email = a?.email || row.client_email;
  const est = a && pricing ? estimateBrief(a, pricing) : null;
  const label = (list: { key: string; label: string }[] | undefined, key: string) =>
    list?.find((i) => i.key === key)?.label ?? key;
  const waText =
    row.status === 'sent'
      ? briefInviteText(row.client_name, briefLink(row.token))
      : `Hi ${row.client_name.split(' ')[0]}, thanks for sending your project brief${a?.business_name ? ` for ${a.business_name}` : ''}! `;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/briefs"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> ALL BRIEFS
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)]">
            {a?.business_name || row.client_name}
          </h1>
          <p className="mt-1 text-[var(--mist)]">
            {a ? `${a.full_name}${a.role ? ` · ${a.role}` : ''}` : row.client_name}
            {row.submitted_at && ` · submitted ${new Date(row.submitted_at).toLocaleString('en-GB')}`}
          </p>
          {row.note && <p className="mt-1 text-sm text-[var(--mist)]">Note: {row.note}</p>}
        </div>
        {saved && <MonoLabel className="text-[var(--success)]">{saved}</MonoLabel>}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {phone && (
          <a href={whatsAppTo(phone, waText)} target="_blank" rel="noreferrer" className={actionCls}>
            <MessageCircle className="w-4 h-4" /> WhatsApp {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}?subject=${encodeURIComponent('Your website project')}`} className={actionCls}>
            <Mail className="w-4 h-4" /> Email
          </a>
        )}
        <button onClick={() => navigator.clipboard.writeText(briefLink(row.token))} className={actionCls}>
          <Copy className="w-4 h-4" /> Copy brief link
        </button>
        <select
          value={row.status}
          onChange={(e) => patch({ status: e.target.value as BriefStatus })}
          className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-3 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
        >
          {BRIEF_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BRIEF_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {!a ? (
        <div className="mt-8 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-10 text-center">
          <p className="metal-text font-display text-3xl">Waiting for the client</p>
          <p className="mt-3 text-sm text-[var(--mist)] break-all">{briefLink(row.token)}</p>
        </div>
      ) : (
        <>
          {/* Estimate — admin only */}
          <Section title="Price estimate (private)">
            {!est ? (
              <p className="text-sm text-[var(--mist)]">Loading pricing…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Stat label="One-off total" value={formatNaira(est.oneOff.naira)} sub={formatUsd(est.oneOff.usd)} />
                  <Stat
                    label="Monthly"
                    value={est.monthly.naira ? `${formatNaira(est.monthly.naira)}/mo` : '—'}
                    sub={est.monthly.usd ? `${formatUsd(est.monthly.usd)}/mo` : undefined}
                  />
                  <Stat label="Client budget" value={a.budget_range || '—'} sub={label([...BRIEF_TIMELINES], a.timeline)} />
                </div>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 mono-label text-[var(--mist)] font-normal">Item</th>
                      <th className="py-2 mono-label text-[var(--mist)] font-normal text-right">₦</th>
                      <th className="py-2 mono-label text-[var(--mist)] font-normal text-right">$</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--steel)]">
                    {est.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2 text-[var(--platinum)]">
                          {l.label}
                          {l.recurring && <span className="ml-2 mono-label text-[var(--mist)]">MONTHLY</span>}
                        </td>
                        <td className="py-2 text-right text-[var(--platinum)]">{formatNaira(l.naira)}</td>
                        <td className="py-2 text-right text-[var(--mist)]">{formatUsd(l.usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-[var(--mist)]">
                  Calculated from your current{' '}
                  <Link href="/admin/briefs/pricing" className="underline hover:text-[var(--platinum)]">
                    pricing
                  </Link>
                  . The client never sees this.
                </p>
              </>
            )}
          </Section>

          <Section title="Contact">
            <Grid
              items={[
                ['Name', a.full_name],
                ['Email', a.email],
                ['Phone / WhatsApp', a.phone],
                ['Role', a.role],
              ]}
            />
          </Section>

          <Section title="Business">
            <Grid
              items={[
                ['Business name', a.business_name],
                ['Industry', a.industry],
                ['Tagline', a.tagline],
                ['Location', a.location],
                ['Years in business', a.years_in_business],
                ['Current website', a.existing_website],
              ]}
            />
            <Long label="About the business" value={a.business_description} />
            <Long label="Customers / audience" value={a.audience} />
            <Long label="Social media" value={a.socials} />
            <Long label="Competitors" value={a.competitors} />
          </Section>

          <Section title="Website">
            <Grid
              items={[
                ['Type', label(pricing?.site_types, a.site_type)],
                ['Page count', String(est?.pageCount ?? a.pages.length)],
                ['Products', a.product_count],
                ['Content ready?', a.content_ready],
                ['Domain', [a.has_domain, a.domain_name].filter(Boolean).join(' — ')],
              ]}
            />
            <List label="Goals" values={a.goals} />
            <List label="Pages" values={a.pages} />
            <Long label="Other pages" value={a.other_pages} />
            <List label="Features" values={a.features.map((k) => label(pricing?.features, k))} />
          </Section>

          <Section title="Look & feel">
            {a.inspirations.length > 0 && (
              <div className="space-y-3">
                <MonoLabel className="text-[var(--mist)]">WEBSITES THEY LIKE</MonoLabel>
                {a.inspirations.map((i, n) => (
                  <div key={n} className="rounded-md border border-[var(--steel)] p-3">
                    {i.url && (
                      <a
                        href={/^https?:\/\//.test(i.url) ? i.url : `https://${i.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--platinum)] underline break-all"
                      >
                        {i.url} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}
                    {i.notes && <p className="mt-1 text-sm text-[var(--mist)] whitespace-pre-wrap">{i.notes}</p>}
                  </div>
                ))}
              </div>
            )}
            <List label="Styles" values={a.styles} />
            <Long label="Brand colours" value={a.colors} />
            <Long label="Look they want" value={a.look_notes} />
            <Long label="Dislikes" value={a.dislikes} />
            {a.attachments.length > 0 && (
              <div className="mt-5">
                <MonoLabel className="text-[var(--mist)]">FILES</MonoLabel>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {a.attachments.map((f) => {
                    const url = fileUrls[f.path];
                    return (
                      <a
                        key={f.path}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md border border-[var(--steel)] overflow-hidden hover:border-[var(--silver)]"
                      >
                        {url && f.type.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={f.name} className="w-full aspect-square object-cover" />
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-[var(--graphite)]">
                            <FileText className="w-8 h-8 text-[var(--mist)]" />
                          </div>
                        )}
                        <p className="px-2 py-1.5 text-xs text-[var(--mist)] truncate">{f.name}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </Section>

          <Section title="Extra services">
            <Grid items={[['Has a logo?', a.has_logo]]} />
            <List label="Wants" values={a.addons.map((k) => label(pricing?.addons, k))} />
            <Long label="Notes" value={a.extras_notes} />
          </Section>

          <Section title="Budget & timeline">
            <Grid
              items={[
                ['Budget', a.budget_range],
                ['Timeline', label([...BRIEF_TIMELINES], a.timeline)],
                ['Deadline', a.deadline_notes],
              ]}
            />
            <Long label="Anything else" value={a.anything_else} />
          </Section>
        </>
      )}

      {/* Notes */}
      <div className="mt-8">
        <MonoLabel className="text-[var(--mist)] block mb-2">INTERNAL NOTES</MonoLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (row.internal_notes || '') && patch({ internal_notes: notes })}
          rows={4}
          placeholder="Private — only you see this. e.g. final quote agreed, call notes."
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none resize-y"
        />
      </div>

      <button
        onClick={remove}
        className="mt-6 inline-flex items-center gap-2 mono-label text-[var(--danger)] hover:underline"
      >
        <Trash2 className="w-4 h-4" /> Delete brief
      </button>
    </div>
  );
}

const actionCls =
  'inline-flex items-center gap-2 mono-label rounded-md border border-[var(--steel)] px-4 py-2.5 text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)]';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
      <h2 className="font-display text-xl text-[var(--platinum)] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-[var(--steel)] bg-[var(--obsidian)] p-4">
      <MonoLabel className="text-[var(--mist)]">{label}</MonoLabel>
      <p className="mt-1 font-display text-2xl text-[var(--platinum)]">{value}</p>
      {sub && <p className="text-sm text-[var(--mist)]">{sub}</p>}
    </div>
  );
}

function Grid({ items }: { items: [string, string | undefined][] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {items.map(([k, v]) => (
        <div key={k}>
          <MonoLabel className="text-[var(--mist)]">{k}</MonoLabel>
          <p className="mt-0.5 text-sm text-[var(--platinum)] break-words">{v || '—'}</p>
        </div>
      ))}
    </dl>
  );
}

function Long({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <MonoLabel className="text-[var(--mist)]">{label}</MonoLabel>
      <p className="mt-1 text-sm text-[var(--platinum)] whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

function List({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <MonoLabel className="text-[var(--mist)]">{label}</MonoLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="rounded-md border border-[var(--steel)] px-2.5 py-1 text-sm text-[var(--platinum)]">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
