'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { WorkProject, ProjectCategory, ProjectStatus } from '@/types';

const CATEGORIES: ProjectCategory[] = ['AI Product', 'SaaS', 'Platform'];
const STATUSES: ProjectStatus[] = ['Live', 'In Development', 'Archived'];

type Draft = Partial<WorkProject> & { stackText?: string };

const BLANK: Draft = {
  title: '',
  slug: '',
  category: 'AI Product',
  one_liner: '',
  problem: '',
  architecture: '',
  build_notes: '',
  outcome: '',
  stackText: '',
  role: 'Founder & Sole Engineer',
  year: '',
  status: 'Live',
  live_url: '',
  github_url: '',
  cover_image_url: '',
  featured: false,
  sort_order: 0,
  published: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [d, setD] = useState<Draft>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = data as unknown as WorkProject;
          setD({ ...p, stackText: (p.stack || []).join(', ') });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  async function uploadCover(file: File) {
    const supabase = createClient();
    const path = `${d.slug || slugify(d.title || 'project')}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: upErr } = await supabase.storage.from('project-media').upload(path, file, {
      upsert: true,
    });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data } = supabase.storage.from('project-media').getPublicUrl(path);
    set('cover_image_url', data.publicUrl);
  }

  async function save() {
    setError('');
    if (!d.title || d.title.length < 2) return setError('Title is required.');
    const slug = d.slug || slugify(d.title);
    if (!/^[a-z0-9-]+$/.test(slug)) return setError('Slug must be lowercase letters, numbers, hyphens.');

    setSaving(true);
    const payload = {
      title: d.title,
      slug,
      category: d.category as string,
      one_liner: d.one_liner || null,
      problem: d.problem || null,
      architecture: d.architecture || null,
      build_notes: d.build_notes || null,
      outcome: d.outcome || null,
      stack: (d.stackText || '').split(',').map((s) => s.trim()).filter(Boolean),
      role: d.role || 'Founder & Sole Engineer',
      year: d.year || null,
      status: d.status as string,
      live_url: d.live_url || null,
      github_url: d.github_url || null,
      cover_image_url: d.cover_image_url || null,
      featured: !!d.featured,
      sort_order: Number(d.sort_order) || 0,
      published: !!d.published,
    };

    const supabase = createClient();
    const res = isNew
      ? await supabase.from('projects').insert(payload)
      : await supabase.from('projects').update(payload).eq('id', id);

    setSaving(false);
    if (res.error) return setError(res.error.message);
    router.push('/admin/projects');
    router.refresh();
  }

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/projects"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> ALL PROJECTS
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[var(--platinum)]">
        {isNew ? 'New project' : d.title}
      </h1>

      <div className="mt-8 space-y-5">
        <Row label="Title">
          <Text
            value={d.title || ''}
            onChange={(v) => {
              set('title', v);
              if (isNew) set('slug', slugify(v));
            }}
          />
        </Row>
        <Row label="Slug">
          <Text value={d.slug || ''} onChange={(v) => set('slug', v)} />
        </Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Category">
            <Select
              value={d.category as string}
              options={CATEGORIES}
              onChange={(v) => set('category', v as ProjectCategory)}
            />
          </Row>
          <Row label="Status">
            <Select
              value={d.status as string}
              options={STATUSES}
              onChange={(v) => set('status', v as ProjectStatus)}
            />
          </Row>
        </div>
        <Row label="One-liner">
          <Text value={d.one_liner || ''} onChange={(v) => set('one_liner', v)} />
        </Row>
        <Row label="Problem">
          <Area value={d.problem || ''} onChange={(v) => set('problem', v)} />
        </Row>
        <Row label="Architecture">
          <Area value={d.architecture || ''} onChange={(v) => set('architecture', v)} />
        </Row>
        <Row label="Build notes">
          <Area value={d.build_notes || ''} onChange={(v) => set('build_notes', v)} />
        </Row>
        <Row label="Outcome">
          <Area value={d.outcome || ''} onChange={(v) => set('outcome', v)} />
        </Row>
        <Row label="Stack (comma-separated)">
          <Text value={d.stackText || ''} onChange={(v) => set('stackText', v)} />
        </Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Year">
            <Text value={d.year || ''} onChange={(v) => set('year', v)} />
          </Row>
          <Row label="Sort order">
            <Text
              value={String(d.sort_order ?? 0)}
              onChange={(v) => set('sort_order', Number(v) || 0)}
            />
          </Row>
        </div>
        <Row label="Live URL">
          <Text value={d.live_url || ''} onChange={(v) => set('live_url', v)} />
        </Row>
        <Row label="GitHub URL">
          <Text value={d.github_url || ''} onChange={(v) => set('github_url', v)} />
        </Row>
        <Row label="Cover image">
          <div className="space-y-2">
            {d.cover_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={d.cover_image_url} alt="cover" className="max-h-40 rounded-md border border-[var(--steel)]" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
              className="text-sm text-[var(--mist)]"
            />
          </div>
        </Row>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-[var(--platinum)]">
            <input
              type="checkbox"
              checked={!!d.featured}
              onChange={(e) => set('featured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--platinum)]">
            <input
              type="checkbox"
              checked={!!d.published}
              onChange={(e) => set('published', e.target.checked)}
            />
            Published
          </label>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <MonoLabel className="text-[var(--mist)] block mb-2">{label.toUpperCase()}</MonoLabel>
      {children}
    </div>
  );
}
function Text({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
    />
  );
}
function Area({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y"
    />
  );
}
function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
