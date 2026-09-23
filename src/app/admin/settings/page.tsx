'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { checkSave, notify, refreshSite } from '@/lib/admin-client';
import { compressImage } from '@/lib/image-compress';
import { mergeSettings } from '@/lib/data/site';
import type { SiteStats } from '@/types';

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Text settings saved by this page (stats + budgets are handled separately).
const TEXT_KEYS = [
  'hero_headline',
  'hero_subline',
  'email',
  'github_url',
  'x_url',
  'linkedin_url',
  'resume_url',
  'profile_image_url',
  'about_headline',
  'about_intro',
  'about_story',
  'home_approach',
  'about_principles',
  'about_toolbox',
  'about_timeline',
  'payment_bank',
  'payment_account',
  'payment_name',
  'whatsapp_number',
] as const;
type TextKey = (typeof TEXT_KEYS)[number];

const REQUIRED: [TextKey, string][] = [
  ['hero_headline', 'Hero headline'],
  ['email', 'Contact email'],
  ['payment_bank', 'Bank'],
  ['payment_account', 'Account number'],
  ['payment_name', 'Account name'],
  ['whatsapp_number', 'WhatsApp number'],
];

export default function SettingsAdmin() {
  const [s, setS] = useState<Record<TextKey, string>>({} as Record<TextKey, string>);
  const [stats, setStats] = useState<SiteStats>({
    products_shipped: '',
    years_building: '',
    stack_depth: '',
    response_time: '',
  });
  const [budgets, setBudgets] = useState<string[]>([]);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'' | 'profile' | 'resume'>('');

  useEffect(() => {
    createClient()
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        // Show exactly what the live site uses — stored value, or the default where none is stored.
        const merged = mergeSettings(new Map((data || []).map((r) => [r.key, r.value])));
        const text = {} as Record<TextKey, string>;
        for (const k of TEXT_KEYS) text[k] = (merged[k] as string | null) ?? '';
        setS(text);
        setStats(merged.stats);
        setBudgets(merged.budget_options);
        setLoading(false);
      });
  }, []);

  const set = (k: TextKey, v: string) => setS((prev) => ({ ...prev, [k]: v }));

  async function save() {
    setError('');
    setSaved('');
    for (const [k, label] of REQUIRED) {
      if (!s[k]?.trim()) return setError(`${label} can’t be empty — it’s shown on the site.`);
    }
    if (!EMAIL_RE.test(s.email.trim())) return setError('Contact email must be a valid email address.');
    for (const k of ['github_url', 'x_url', 'linkedin_url', 'resume_url'] as const) {
      if (s[k] && !URL_RE.test(s[k])) return setError(`${k} must be a valid URL starting with https:// (or empty).`);
    }
    const cleanBudgets = budgets.map((b) => b.trim()).filter(Boolean);
    if (!cleanBudgets.length) return setError('Add at least one budget option.');

    // Never send SQL NULL — site_settings.value is NOT NULL. Empty optional
    // URLs are stored as '' and read back as "unset".
    const rows = [
      ...TEXT_KEYS.map((key) => ({ key, value: (s[key] ?? '').trim() })),
      { key: 'stats', value: stats },
      { key: 'budget_options', value: cleanBudgets },
    ];
    setSaving(true);
    const res = await createClient().from('site_settings').upsert(rows as never, { onConflict: 'key' });
    setSaving(false);
    if (res.error) return setError(res.error.message);
    refreshSite();
    setSaved('Saved — live on the site now.');
    setTimeout(() => setSaved(''), 2500);
  }

  // Uploads save straight away — no need to press Save afterwards.
  async function upload(kind: 'profile' | 'resume', original: File) {
    setError('');
    setUploading(kind);
    const supabase = createClient();
    const file = kind === 'profile' ? await compressImage(original, 1200) : original;
    const ext = kind === 'resume' ? 'pdf' : file.name.split('.').pop();
    const path = `${kind}-${Date.now()}.${ext}`;
    const { error: e } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
    if (e) {
      setUploading('');
      return setError(e.message);
    }
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
    const key: TextKey = kind === 'profile' ? 'profile_image_url' : 'resume_url';
    const res = await supabase.from('site_settings').upsert({ key, value: data.publicUrl } as never, { onConflict: 'key' });
    setUploading('');
    if (checkSave(res)) {
      set(key, data.publicUrl);
      notify(kind === 'profile' ? 'Profile photo updated.' : 'Résumé updated.', 'success');
    }
  }

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Settings</h1>
      <MonoLabel className="text-[var(--mist)]">SITE CONFIGURATION</MonoLabel>

      <div className="mt-8 space-y-5">
        {/* Profile photo */}
        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">PROFILE PHOTO (SHOWN ON /ABOUT — SAVES ON UPLOAD)</MonoLabel>
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden shrink-0 flex items-center justify-center">
              {uploading === 'profile' ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--mist)]" />
              ) : s.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={s.profile_image_url} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="metal-text font-display text-2xl">AI</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              disabled={!!uploading}
              onChange={(e) => e.target.files?.[0] && upload('profile', e.target.files[0])}
              className="text-sm text-[var(--mist)]"
            />
          </div>
        </div>

        {/* Home */}
        <Group title="HOME PAGE">
          <Field label="Hero headline (last word is highlighted)" v={s.hero_headline} on={(v) => set('hero_headline', v)} />
          <Field label="Hero subline" v={s.hero_subline} on={(v) => set('hero_subline', v)} area />
          <Field label="“The approach” paragraph" v={s.home_approach} on={(v) => set('home_approach', v)} area rows={4} />
          <div>
            <MonoLabel className="text-[var(--mist)] block mb-2">STATS (ALSO USED IN THE TICKER UNDER THE HERO)</MonoLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Products shipped" v={stats.products_shipped} on={(v) => setStats({ ...stats, products_shipped: v })} />
              <Field label="Years building" v={stats.years_building} on={(v) => setStats({ ...stats, years_building: v })} />
              <Field label="Stack depth" v={stats.stack_depth} on={(v) => setStats({ ...stats, stack_depth: v })} />
              <Field label="Response time" v={stats.response_time} on={(v) => setStats({ ...stats, response_time: v })} />
            </div>
          </div>
        </Group>

        {/* About */}
        <Group title="ABOUT PAGE">
          <Field label="About headline" v={s.about_headline} on={(v) => set('about_headline', v)} />
          <Field label="About intro (one line)" v={s.about_intro} on={(v) => set('about_intro', v)} area />
          <Field label="About story (each line = a paragraph)" v={s.about_story} on={(v) => set('about_story', v)} area rows={8} />
          <Field
            label="How I work — one per line: Title | description"
            v={s.about_principles}
            on={(v) => set('about_principles', v)}
            area
            rows={4}
            mono
          />
          <Field
            label="Toolbox — one per line: Group: item, item, item"
            v={s.about_toolbox}
            on={(v) => set('about_toolbox', v)}
            area
            rows={4}
            mono
          />
          <Field label="Timeline — one per line: Year | milestone" v={s.about_timeline} on={(v) => set('about_timeline', v)} area rows={4} mono />
        </Group>

        {/* Contact */}
        <Group title="CONTACT & SOCIAL">
          <Field label="Contact email" v={s.email} on={(v) => set('email', v)} />
          <Field label="GitHub URL" v={s.github_url} on={(v) => set('github_url', v)} />
          <Field label="X (Twitter) URL" v={s.x_url} on={(v) => set('x_url', v)} />
          <Field label="LinkedIn URL" v={s.linkedin_url} on={(v) => set('linkedin_url', v)} />
        </Group>

        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">HIRE-FORM BUDGET OPTIONS (ONE PER LINE)</MonoLabel>
          <textarea
            value={budgets.join('\n')}
            onChange={(e) => setBudgets(e.target.value.split('\n'))}
            rows={6}
            className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y font-mono"
          />
          <p className="mt-1 text-xs text-[var(--mist)]">These are the budget choices visitors pick from on /hire.</p>
        </div>

        {/* Payments (coaching) */}
        <Group title="PAYMENTS (COACHING POPUP)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank *" v={s.payment_bank} on={(v) => set('payment_bank', v)} />
            <Field label="Account number *" v={s.payment_account} on={(v) => set('payment_account', v)} />
            <Field label="Account name *" v={s.payment_name} on={(v) => set('payment_name', v)} />
            <Field label="WhatsApp number *" v={s.whatsapp_number} on={(v) => set('whatsapp_number', v)} />
          </div>
          <p className="text-xs text-[var(--mist)]">
            Shown when someone clicks Enrol on a course. WhatsApp number is used for the “send receipt”
            button and the Hire form’s WhatsApp fallback (Nigerian 0… numbers auto-convert to +234).
          </p>
        </Group>

        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">RÉSUMÉ (PDF — SAVES ON UPLOAD)</MonoLabel>
          {s.resume_url && (
            <a href={s.resume_url} target="_blank" rel="noreferrer" className="mono-label text-[var(--silver)] block mb-2">
              Current résumé →
            </a>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              disabled={!!uploading}
              onChange={(e) => e.target.files?.[0] && upload('resume', e.target.files[0])}
              className="text-sm text-[var(--mist)]"
            />
            {uploading === 'resume' && <Loader2 className="w-4 h-4 animate-spin text-[var(--mist)]" />}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {saved && <p className="text-sm text-[var(--success)]">{saved}</p>}

        <button
          onClick={save}
          disabled={saving || !!uploading}
          className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--steel)] p-4 space-y-4">
      <MonoLabel className="text-[var(--platinum)]">{title}</MonoLabel>
      {children}
    </div>
  );
}

function Field({
  label,
  v,
  on,
  area,
  rows = 3,
  mono,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  area?: boolean;
  rows?: number;
  mono?: boolean;
}) {
  const cls = `w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none ${mono ? 'font-mono' : ''}`;
  return (
    <div>
      <MonoLabel className="text-[var(--mist)] block mb-2">{label.toUpperCase()}</MonoLabel>
      {area ? (
        <textarea value={v ?? ''} onChange={(e) => on(e.target.value)} rows={rows} className={`${cls} resize-y`} />
      ) : (
        <input value={v ?? ''} onChange={(e) => on(e.target.value)} className={cls} />
      )}
    </div>
  );
}
