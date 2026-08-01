'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import { formatNaira } from '@/lib/format';
import type { Course } from '@/types';

export default function CoursesAdmin() {
  const [rows, setRows] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setRows((data || []) as unknown as Course[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, field: 'featured' | 'published', value: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    const supabase = createClient();
    await supabase.from('courses').update({ [field]: value } as never).eq('id', id);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length || saving) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const reindexed = next.map((r, i) => ({ ...r, sort_order: i }));
    setRows(reindexed);
    setSaving(true);
    const supabase = createClient();
    await Promise.all(
      reindexed.map((r) =>
        supabase.from('courses').update({ sort_order: r.sort_order } as never).eq('id', r.id)
      )
    );
    setSaving(false);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Coaching</h1>
          <MonoLabel className="text-[var(--mist)]">{rows.length} COURSES</MonoLabel>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New course
        </Link>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="mt-10 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-12 text-center">
          <p className="metal-text font-display text-4xl">No courses yet</p>
          <p className="mt-3 text-sm text-[var(--mist)]">
            Run the 0004 migration, then your four courses appear here to edit.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-4 flex items-center gap-4"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || saving}
                  className="text-[var(--mist)] hover:text-[var(--platinum)] disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1 || saving}
                  className="text-[var(--mist)] hover:text-[var(--platinum)] disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--platinum)] font-display text-lg truncate">
                  {r.title}
                  {!r.published && <span className="ml-2 mono-label text-[var(--warning)]">DRAFT</span>}
                </p>
                <MonoLabel className="text-[var(--mist)]">
                  {formatNaira(r.price_naira)} · {r.duration || '—'}
                </MonoLabel>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--mist)] shrink-0">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={r.featured}
                    onChange={(e) => toggle(r.id, 'featured', e.target.checked)}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={r.published}
                    onChange={(e) => toggle(r.id, 'published', e.target.checked)}
                  />
                  Published
                </label>
                <Link
                  href={`/admin/courses/${r.id}`}
                  className="mono-label text-[var(--silver)] hover:text-[var(--white)]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
