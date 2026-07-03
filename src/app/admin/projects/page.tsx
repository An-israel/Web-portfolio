'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { WorkProject } from '@/types';

export default function ProjectsAdmin() {
  const [rows, setRows] = useState<WorkProject[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });
    setRows((data || []) as unknown as WorkProject[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, field: 'featured' | 'published', value: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    const supabase = createClient();
    await supabase.from('projects').update({ [field]: value } as never).eq('id', id);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Projects</h1>
          <MonoLabel className="text-[var(--mist)]">{rows.length} TOTAL</MonoLabel>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New project
        </Link>
      </div>

      <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--steel)] text-left">
              {['Title', 'Category', 'Status', 'Featured', 'Published', ''].map((h) => (
                <th key={h} className="px-4 py-3">
                  <MonoLabel className="text-[var(--mist)]">{h}</MonoLabel>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--mist)]">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--steel)]">
                  <td className="px-4 py-3 text-[var(--platinum)]">{r.title}</td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.category}</td>
                  <td className="px-4 py-3 text-[var(--mist)]">{r.status}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={r.featured}
                      onChange={(e) => toggle(r.id, 'featured', e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={r.published}
                      onChange={(e) => toggle(r.id, 'published', e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/projects/${r.id}`}
                      className="mono-label text-[var(--silver)] hover:text-[var(--white)]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
