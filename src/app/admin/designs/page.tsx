'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { Design } from '@/types';

export default function DesignsAdmin() {
  const [rows, setRows] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from('designs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setRows((data || []) as unknown as Design[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, field: 'featured' | 'published', value: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    const supabase = createClient();
    await supabase.from('designs').update({ [field]: value } as never).eq('id', id);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Designs</h1>
          <MonoLabel className="text-[var(--mist)]">{rows.length} TOTAL</MonoLabel>
        </div>
        <Link
          href="/admin/designs/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New design
        </Link>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="mt-10 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-12 text-center">
          <p className="metal-text font-display text-4xl">Your design wall</p>
          <p className="mt-3 text-sm text-[var(--mist)]">
            Add your first piece — upload the image, set its size, and tell its story.
          </p>
          <Link
            href="/admin/designs/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New design
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden">
              <div className="aspect-[4/3] bg-[var(--obsidian)]">
                {r.cover_image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.cover_image_url} alt={r.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center metal-text font-display text-3xl">
                    AI
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-[var(--platinum)] font-display text-lg truncate">{r.title}</p>
                <MonoLabel className="text-[var(--mist)]">{r.category}</MonoLabel>
                <div className="mt-3 flex items-center gap-4 text-sm text-[var(--mist)]">
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
                    href={`/admin/designs/${r.id}`}
                    className="ml-auto mono-label text-[var(--silver)] hover:text-[var(--white)]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
