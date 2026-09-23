'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { useBriefPricing } from '@/components/admin/useBriefPricing';
import {
  BRIEF_PRICING_KEY,
  DEFAULT_BRIEF_PRICING,
  type AddonItem,
  type BriefPricing,
  type PriceItem,
} from '@/lib/brief';

type ListKey = 'site_types' | 'features' | 'addons';

function newKey(label: string) {
  const base = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'item';
  return `${base}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function BriefPricingPage() {
  const loaded = useBriefPricing();
  const [edited, setEdited] = useState<BriefPricing | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const p = edited ?? loaded;

  if (!p) return <p className="text-[var(--mist)]">Loading…</p>;

  const update = (next: Partial<BriefPricing>) => setEdited({ ...p, ...next });

  function setItem(list: ListKey, i: number, patch: Partial<AddonItem>) {
    const items = (p![list] as AddonItem[]).map((it, j) => (j === i ? { ...it, ...patch } : it));
    update({ [list]: items } as Partial<BriefPricing>);
  }
  function addItem(list: ListKey) {
    const item: AddonItem = { key: newKey('new'), label: '', description: '', naira: 0, usd: 0, recurring: false };
    update({ [list]: [...p![list], item] } as Partial<BriefPricing>);
  }
  function removeItem(list: ListKey, i: number) {
    if (!confirm('Remove this item? Past briefs that picked it will show it as unpriced.')) return;
    update({ [list]: p![list].filter((_, j) => j !== i) } as Partial<BriefPricing>);
  }

  async function save() {
    setMsg('');
    const clean = (items: PriceItem[]) => items.filter((i) => i.label.trim());
    const next: BriefPricing = {
      ...p!,
      site_types: clean(p!.site_types),
      features: clean(p!.features),
      addons: clean(p!.addons) as AddonItem[],
      budget_ranges: p!.budget_ranges.map((b) => b.trim()).filter(Boolean),
    };
    if (!next.site_types.length) return setMsg('Add at least one website type.');
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: BRIEF_PRICING_KEY, value: next as never }, { onConflict: 'key' });
    setSaving(false);
    if (error) return setMsg(error.message);
    setEdited(next);
    setMsg('Saved');
    setTimeout(() => setMsg(''), 2000);
  }

  return (
    <div className="max-w-4xl pb-24">
      <Link
        href="/admin/briefs"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> CLIENT BRIEFS
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[var(--platinum)]">Brief pricing</h1>
      <p className="mt-2 text-sm text-[var(--mist)] max-w-2xl">
        These prices are private. Clients only see the names and descriptions; every submitted brief is
        auto-priced from this sheet. Changing a price updates the estimate on all briefs.
      </p>

      <PriceList
        title="Website types (base price)"
        hint="The client picks one. Its price is the starting point of the estimate."
        items={p.site_types}
        showDescription
        onChange={(i, patch) => setItem('site_types', i, patch)}
        onAdd={() => addItem('site_types')}
        onRemove={(i) => removeItem('site_types', i)}
      />

      <Block title="Pages">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Num label="Pages included in base" value={p.included_pages} onChange={(v) => update({ included_pages: v })} />
          <Num label="Each extra page (₦)" value={p.extra_page.naira} onChange={(v) => update({ extra_page: { ...p.extra_page, naira: v } })} />
          <Num label="Each extra page ($)" value={p.extra_page.usd} onChange={(v) => update({ extra_page: { ...p.extra_page, usd: v } })} />
        </div>
      </Block>

      <PriceList
        title="Features"
        hint="Each feature the client ticks is added to the estimate."
        items={p.features}
        onChange={(i, patch) => setItem('features', i, patch)}
        onAdd={() => addItem('features')}
        onRemove={(i) => removeItem('features', i)}
      />

      <PriceList
        title="Additional services"
        hint="Shown to the client as service cards. Tick “Monthly” for retainers — they’re totalled separately."
        items={p.addons}
        showDescription
        showRecurring
        onChange={(i, patch) => setItem('addons', i, patch)}
        onAdd={() => addItem('addons')}
        onRemove={(i) => removeItem('addons', i)}
      />

      <Block title="Rush fee">
        <div className="max-w-xs">
          <Num label="% added when client picks “ASAP”" value={p.rush_percent} onChange={(v) => update({ rush_percent: v })} />
        </div>
      </Block>

      <Block title="Budget ranges shown to clients">
        <textarea
          rows={6}
          value={p.budget_ranges.join('\n')}
          onChange={(e) => update({ budget_ranges: e.target.value.split('\n') })}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-[var(--mist)]">One per line.</p>
      </Block>

      <div className="fixed bottom-0 inset-x-0 lg:left-60 border-t border-[var(--steel)] bg-[var(--obsidian)]/95 backdrop-blur px-6 lg:px-8 py-4 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || !edited}
          className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save pricing'}
        </button>
        <button
          onClick={() => confirm('Reset every price to the defaults? (Not saved until you click Save.)') && setEdited(DEFAULT_BRIEF_PRICING)}
          className="mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
        >
          Reset to defaults
        </button>
        {msg && <MonoLabel className={msg === 'Saved' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>{msg}</MonoLabel>}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-3 py-2 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none';

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5">
      <h2 className="font-display text-xl text-[var(--platinum)]">{title}</h2>
      {hint && <p className="mt-1 text-sm text-[var(--mist)]">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PriceList({
  title,
  hint,
  items,
  showDescription,
  showRecurring,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  items: (PriceItem & { recurring?: boolean })[];
  showDescription?: boolean;
  showRecurring?: boolean;
  onChange: (i: number, patch: Partial<AddonItem>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <Block title={title} hint={hint}>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.key} className="rounded-md border border-[var(--steel)] bg-[var(--obsidian)]/40 p-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={it.label}
                onChange={(e) => onChange(i, { label: e.target.value })}
                placeholder="Name shown to client"
                className={`${inputCls} flex-1`}
              />
              <div className="flex gap-2 items-center">
                <Money prefix="₦" value={it.naira} onChange={(v) => onChange(i, { naira: v })} />
                <Money prefix="$" value={it.usd} onChange={(v) => onChange(i, { usd: v })} />
                <button onClick={() => onRemove(i)} className="text-[var(--mist)] hover:text-[var(--danger)] p-1" aria-label="Remove">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {showDescription && (
              <input
                value={it.description}
                onChange={(e) => onChange(i, { description: e.target.value })}
                placeholder="Short description shown to client"
                className={inputCls}
              />
            )}
            {showRecurring && (
              <label className="flex items-center gap-2 text-sm text-[var(--mist)]">
                <input type="checkbox" checked={!!it.recurring} onChange={(e) => onChange(i, { recurring: e.target.checked })} />
                Monthly
              </label>
            )}
          </div>
        ))}
      </div>
      <button onClick={onAdd} className="mt-3 inline-flex items-center gap-2 mono-label text-[var(--silver)] hover:text-[var(--white)]">
        <Plus className="w-4 h-4" /> Add
      </button>
    </Block>
  );
}

function Money({ prefix, value, onChange }: { prefix: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative w-32">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--mist)]">{prefix}</span>
      <input
        inputMode="numeric"
        value={value ? value.toLocaleString('en-US') : ''}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
        placeholder="0"
        className={`${inputCls} pl-7`}
      />
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <MonoLabel className="text-[var(--mist)] block mb-2">{label.toUpperCase()}</MonoLabel>
      <input
        inputMode="numeric"
        value={value ? value.toLocaleString('en-US') : ''}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
        placeholder="0"
        className={inputCls}
      />
    </div>
  );
}
