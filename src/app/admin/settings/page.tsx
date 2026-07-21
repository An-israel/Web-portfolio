'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { SiteStats } from '@/types';

const URL_RE = /^https?:\/\/.+/;
const DEFAULT_BUDGETS = ['<$2k', '$2k–$5k', '$5k–$15k', '$15k–$50k', '$50k+'];

export default function SettingsAdmin() {
  const [s, setS] = useState<Record<string, unknown>>({});
  const [stats, setStats] = useState<SiteStats>({
    products_shipped: '',
    years_building: '',
    stack_depth: '',
    response_time: '',
  });
  const [budgets, setBudgets] = useState<string[]>(DEFAULT_BUDGETS);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        const map: Record<string, unknown> = {};
        (data || []).forEach((r) => (map[r.key] = r.value));
        setS(map);
        if (map.stats) setStats(map.stats as SiteStats);
        if (Array.isArray(map.budget_options) && map.budget_options.length)
          setBudgets(map.budget_options as string[]);
        setLoading(false);
      });
  }, []);

  function str(key: string): string {
    const v = s[key];
    return typeof v === 'string' ? v : '';
  }

  async function save() {
    setError('');
    setSaved('');
    for (const k of ['github_url', 'x_url', 'linkedin_url', 'resume_url'] as const) {
      const v = str(k);
      if (v && !URL_RE.test(v)) {
        setError(`${k} must be a valid URL (or empty).`);
        return;
      }
    }
    // Never send SQL NULL — site_settings.value is NOT NULL. Empty optional
    // URLs are stored as '' and coerced back to null on read.
    const rows = [
      { key: 'hero_headline', value: str('hero_headline') },
      { key: 'hero_subline', value: str('hero_subline') },
      { key: 'email', value: str('email') },
      { key: 'github_url', value: str('github_url') },
      { key: 'x_url', value: str('x_url') },
      { key: 'linkedin_url', value: str('linkedin_url') },
      { key: 'resume_url', value: str('resume_url') },
      { key: 'stats', value: stats },
      { key: 'budget_options', value: budgets.map((b) => b.trim()).filter(Boolean) },
      { key: 'profile_image_url', value: str('profile_image_url') },
      { key: 'about_headline', value: str('about_headline') },
      { key: 'about_intro', value: str('about_intro') },
      { key: 'about_story', value: str('about_story') },
    ];
    const supabase = createClient();
    const { error: err } = await supabase
      .from('site_settings')
      .upsert(rows as never, { onConflict: 'key' });
    if (err) return setError(err.message);
    setSaved('Saved — live on the site now.');
    setTimeout(() => setSaved(''), 2500);
  }

  async function uploadResume(file: File) {
    const supabase = createClient();
    const path = `resume-${Date.now()}.pdf`;
    const { error: e } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
    if (e) return setError(e.message);
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
    setS((prev) => ({ ...prev, resume_url: data.publicUrl }));
  }

  async function uploadProfile(file: File) {
    setError('');
    const supabase = createClient();
    const path = `profile-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: e } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
    if (e) return setError(e.message);
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
    setS((prev) => ({ ...prev, profile_image_url: data.publicUrl }));
  }

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Settings</h1>
      <MonoLabel className="text-[var(--mist)]">SITE CONFIGURATION</MonoLabel>

      <div className="mt-8 space-y-5">
        {/* Profile photo */}
        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">PROFILE PHOTO (SHOWN ON /ABOUT)</MonoLabel>
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden shrink-0 flex items-center justify-center">
              {str('profile_image_url') ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={str('profile_image_url')} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="metal-text font-display text-2xl">AI</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadProfile(e.target.files[0])}
              className="text-sm text-[var(--mist)]"
            />
          </div>
        </div>

        {/* About */}
        <div className="rounded-md border border-[var(--steel)] p-4 space-y-4">
          <MonoLabel className="text-[var(--platinum)]">ABOUT PAGE</MonoLabel>
          <Field label="About headline" v={str('about_headline')} on={(v) => setS({ ...s, about_headline: v })} />
          <Field label="About intro (one line)" v={str('about_intro')} on={(v) => setS({ ...s, about_intro: v })} area />
          <div>
            <MonoLabel className="text-[var(--mist)] block mb-2">ABOUT STORY (BLANK LINE = NEW PARAGRAPH)</MonoLabel>
            <textarea
              value={str('about_story')}
              onChange={(e) => setS({ ...s, about_story: e.target.value })}
              rows={8}
              className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y"
            />
          </div>
        </div>

        <Field label="Hero headline" v={str('hero_headline')} on={(v) => setS({ ...s, hero_headline: v })} />
        <Field label="Hero subline" v={str('hero_subline')} on={(v) => setS({ ...s, hero_subline: v })} area />
        <Field label="Contact email" v={str('email')} on={(v) => setS({ ...s, email: v })} />
        <Field label="GitHub URL" v={str('github_url')} on={(v) => setS({ ...s, github_url: v })} />
        <Field label="X (Twitter) URL" v={str('x_url')} on={(v) => setS({ ...s, x_url: v })} />
        <Field label="LinkedIn URL" v={str('linkedin_url')} on={(v) => setS({ ...s, linkedin_url: v })} />

        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">STATS</MonoLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Products shipped" v={stats.products_shipped} on={(v) => setStats({ ...stats, products_shipped: v })} />
            <Field label="Years building" v={stats.years_building} on={(v) => setStats({ ...stats, years_building: v })} />
            <Field label="Stack depth" v={stats.stack_depth} on={(v) => setStats({ ...stats, stack_depth: v })} />
            <Field label="Response time" v={stats.response_time} on={(v) => setStats({ ...stats, response_time: v })} />
          </div>
        </div>

        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">
            HIRE-FORM BUDGET OPTIONS (ONE PER LINE)
          </MonoLabel>
          <textarea
            value={budgets.join('\n')}
            onChange={(e) => setBudgets(e.target.value.split('\n'))}
            rows={5}
            placeholder={DEFAULT_BUDGETS.join('\n')}
            className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y font-mono"
          />
          <p className="mt-1 text-xs text-[var(--mist)]">
            These are the budget choices visitors pick from on /hire.
          </p>
        </div>

        <div>
          <MonoLabel className="text-[var(--mist)] block mb-2">RÉSUMÉ (PDF)</MonoLabel>
          {str('resume_url') && (
            <a href={str('resume_url')} target="_blank" rel="noreferrer" className="mono-label text-[var(--silver)] block mb-2">
              Current résumé →
            </a>
          )}
          <input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])} className="text-sm text-[var(--mist)]" />
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {saved && <p className="text-sm text-[var(--success)]">{saved}</p>}

        <button onClick={save} className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold">
          Save settings
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  v,
  on,
  area,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  area?: boolean;
}) {
  return (
    <div>
      <MonoLabel className="text-[var(--mist)] block mb-2">{label.toUpperCase()}</MonoLabel>
      {area ? (
        <textarea
          value={v}
          onChange={(e) => on(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y"
        />
      ) : (
        <input
          value={v}
          onChange={(e) => on(e.target.value)}
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
        />
      )}
    </div>
  );
}
