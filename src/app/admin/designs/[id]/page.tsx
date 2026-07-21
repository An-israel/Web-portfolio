'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { Design, DesignCategory } from '@/types';

const CATEGORIES: DesignCategory[] = [
  'Brand Identity',
  'Poster',
  'Social Media',
  'UI/UX',
  'Logo',
  'Illustration',
  'Other',
];

type Draft = Partial<Design> & { toolsText?: string };

const BLANK: Draft = {
  title: '',
  slug: '',
  category: 'Brand Identity',
  summary: '',
  story: '',
  dimensions: '',
  toolsText: '',
  client: '',
  year: '',
  cover_image_url: '',
  gallery_urls: [],
  featured: false,
  sort_order: 0,
  published: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function DesignEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [d, setD] = useState<Draft>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = data as unknown as Design;
          setD({ ...p, toolsText: (p.tools || []).join(', ') });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient();
    const base = d.slug || slugify(d.title || 'design');
    const path = `designs/${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${file.name
      .split('.')
      .pop()}`;
    const { error: upErr } = await supabase.storage.from('project-media').upload(path, file, {
      upsert: true,
    });
    if (upErr) {
      setError(upErr.message);
      return null;
    }
    const { data } = supabase.storage.from('project-media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function onCover(file: File) {
    setUploading(true);
    const url = await uploadImage(file);
    if (url) set('cover_image_url', url);
    setUploading(false);
  }

  async function onGallery(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const url = await uploadImage(f);
      if (url) urls.push(url);
    }
    set('gallery_urls', [...(d.gallery_urls || []), ...urls]);
    setUploading(false);
  }

  function removeGallery(url: string) {
    set('gallery_urls', (d.gallery_urls || []).filter((u) => u !== url));
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
      category: (d.category as string) || 'Other',
      summary: d.summary || null,
      story: d.story || null,
      dimensions: d.dimensions || null,
      tools: (d.toolsText || '').split(',').map((s) => s.trim()).filter(Boolean),
      client: d.client || null,
      year: d.year || null,
      cover_image_url: d.cover_image_url || null,
      gallery_urls: d.gallery_urls || [],
      featured: !!d.featured,
      sort_order: Number(d.sort_order) || 0,
      published: !!d.published,
    };

    const supabase = createClient();
    const res = isNew
      ? await supabase.from('designs').insert(payload)
      : await supabase.from('designs').update(payload).eq('id', id);

    setSaving(false);
    if (res.error) return setError(res.error.message);
    router.push('/admin/designs');
    router.refresh();
  }

  async function remove() {
    if (!confirm('Delete this design?')) return;
    const supabase = createClient();
    await supabase.from('designs').delete().eq('id', id);
    router.push('/admin/designs');
  }

  if (loading) return <p className="text-[var(--mist)]">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/designs"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)]"
      >
        <ArrowLeft className="w-4 h-4" /> ALL DESIGNS
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[var(--platinum)]">
        {isNew ? 'New design' : d.title}
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
              value={(d.category as string) || 'Other'}
              options={CATEGORIES}
              onChange={(v) => set('category', v as DesignCategory)}
            />
          </Row>
          <Row label="Dimensions / size">
            <Text
              value={d.dimensions || ''}
              onChange={(v) => set('dimensions', v)}
              placeholder="e.g. 1080 × 1080 px"
            />
          </Row>
        </div>
        <Row label="Summary (one line)">
          <Text value={d.summary || ''} onChange={(v) => set('summary', v)} />
        </Row>
        <Row label="The story">
          <Area value={d.story || ''} onChange={(v) => set('story', v)} rows={5} />
        </Row>
        <Row label="Tools (comma-separated)">
          <Text value={d.toolsText || ''} onChange={(v) => set('toolsText', v)} placeholder="Figma, Photoshop" />
        </Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Client">
            <Text value={d.client || ''} onChange={(v) => set('client', v)} />
          </Row>
          <Row label="Year">
            <Text value={d.year || ''} onChange={(v) => set('year', v)} />
          </Row>
        </div>

        <Row label="Cover image">
          <div className="space-y-2">
            {d.cover_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={d.cover_image_url} alt="cover" className="max-h-48 rounded-md border border-[var(--steel)]" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])}
              className="text-sm text-[var(--mist)]"
            />
          </div>
        </Row>

        <Row label="Gallery images">
          <div className="space-y-3">
            {(d.gallery_urls || []).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {(d.gallery_urls || []).map((url) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-24 object-cover rounded-md border border-[var(--steel)]" />
                    <button
                      onClick={() => removeGallery(url)}
                      className="absolute top-1 right-1 bg-[var(--obsidian)]/80 rounded-full p-1 text-[var(--mist)] hover:text-[var(--danger)]"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && onGallery(e.target.files)}
              className="text-sm text-[var(--mist)]"
            />
          </div>
        </Row>

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

        {uploading && <p className="text-sm text-[var(--mist)]">Uploading…</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving || uploading}
            className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : isNew ? 'Create design' : 'Save changes'}
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
