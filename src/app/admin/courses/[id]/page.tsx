'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { Course } from '@/types';

type Draft = Partial<Course> & { curriculumText?: string };

const BLANK: Draft = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  curriculumText: '',
  price_naira: 0,
  duration: '',
  level: '',
  featured: false,
  sort_order: 0,
  published: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CourseEditor({ params }: { params: Promise<{ id: string }> }) {
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
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const c = data as unknown as Course;
          setD({ ...c, curriculumText: (c.curriculum || []).join('\n') });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
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
      summary: d.summary || null,
      description: d.description || null,
      curriculum: (d.curriculumText || '').split('\n').map((s) => s.trim()).filter(Boolean),
      price_naira: Number(d.price_naira) || 0,
      duration: d.duration || null,
      level: d.level || null,
      featured: !!d.featured,
      sort_order: Number(d.sort_order) || 0,
      published: !!d.published,
    };

    const supabase = createClient();
    const res = isNew
      ? await supabase.from('courses').insert(payload)
      : await supabase.from('courses').update(payload).eq('id', id);

    setSaving(false);
    if (res.error) return setError(res.error.message);
    router.push('/admin/courses');
    router.refresh();
  }

  async function remove() {
    if (!confirm('Delete this course?')) return;
    const supabase = createClient();
    await supabase.from('courses').delete().eq('id', id);
    router.push('/admin/courses');
  }

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/courses"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> ALL COURSES
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[var(--platinum)]">
        {isNew ? 'New course' : d.title}
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
        <Row label="Summary (one line)">
          <Text value={d.summary || ''} onChange={(v) => set('summary', v)} />
        </Row>
        <Row label="Description">
          <Area value={d.description || ''} onChange={(v) => set('description', v)} rows={4} />
        </Row>
        <Row label="Curriculum (one item per line)">
          <Area value={d.curriculumText || ''} onChange={(v) => set('curriculumText', v)} rows={6} />
        </Row>
        <div className="grid grid-cols-3 gap-4">
          <Row label="Price (₦)">
            <Text
              value={String(d.price_naira ?? 0)}
              onChange={(v) => set('price_naira', Number(v.replace(/\D/g, '')) || 0)}
            />
          </Row>
          <Row label="Duration">
            <Text value={d.duration || ''} onChange={(v) => set('duration', v)} placeholder="3 months" />
          </Row>
          <Row label="Level">
            <Text value={d.level || ''} onChange={(v) => set('level', v)} placeholder="Beginner" />
          </Row>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Sort order">
            <Text value={String(d.sort_order ?? 0)} onChange={(v) => set('sort_order', Number(v) || 0)} />
          </Row>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm text-[var(--platinum)]">
              <input type="checkbox" checked={!!d.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--platinum)]">
              <input type="checkbox" checked={!!d.published} onChange={(e) => set('published', e.target.checked)} />
              Published
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : isNew ? 'Create course' : 'Save changes'}
          </button>
          {!isNew && (
            <button onClick={remove} className="mono-label text-[var(--danger)] hover:underline">
              Delete
            </button>
          )}
        </div>
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
function Text({
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
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
    />
  );
}
function Area({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y"
    />
  );
}
