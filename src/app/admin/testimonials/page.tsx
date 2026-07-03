'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MonoLabel } from '@/components/site/MonoLabel';
import type { Testimonial } from '@/types';

type Draft = Partial<Testimonial>;

export default function TestimonialsAdmin() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true });
    setRows((data || []) as unknown as Testimonial[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setError('');
    if (!editing?.author_name || !editing?.quote) return setError('Author and quote are required.');
    const payload = {
      author_name: editing.author_name,
      author_role: editing.author_role || null,
      author_company: editing.author_company || null,
      quote: editing.quote,
      avatar_url: editing.avatar_url || null,
      published: editing.published ?? false,
      sort_order: Number(editing.sort_order) || 0,
    };
    const supabase = createClient();
    const res = editing.id
      ? await supabase.from('testimonials').update(payload).eq('id', editing.id)
      : await supabase.from('testimonials').insert(payload);
    if (res.error) return setError(res.error.message);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const supabase = createClient();
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Testimonials</h1>
          <MonoLabel className="text-[var(--mist)]">{rows.length} TOTAL</MonoLabel>
        </div>
        <button
          onClick={() => setEditing({ published: false, sort_order: rows.length })}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {editing && (
        <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-5 space-y-4">
          <Text ph="Author name" v={editing.author_name || ''} on={(v) => setEditing({ ...editing, author_name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Text ph="Role" v={editing.author_role || ''} on={(v) => setEditing({ ...editing, author_role: v })} />
            <Text ph="Company" v={editing.author_company || ''} on={(v) => setEditing({ ...editing, author_company: v })} />
          </div>
          <textarea
            placeholder="Quote"
            value={editing.quote || ''}
            onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-2.5 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none resize-y"
          />
          <Text ph="Avatar URL (optional)" v={editing.avatar_url || ''} on={(v) => setEditing({ ...editing, avatar_url: v })} />
          <label className="flex items-center gap-2 text-sm text-[var(--platinum)]">
            <input
              type="checkbox"
              checked={editing.published ?? false}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
            />
            Published
          </label>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} className="rounded-md bg-[var(--white)] text-[var(--obsidian)] px-5 py-2.5 text-sm font-semibold">
              Save
            </button>
            <button onClick={() => setEditing(null)} className="mono-label text-[var(--mist)] hover:text-[var(--platinum)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-[var(--platinum)]">
                {r.author_name}
                <span className="text-[var(--mist)]">
                  {r.author_role ? ` · ${r.author_role}` : ''}
                  {r.author_company ? ` @ ${r.author_company}` : ''}
                </span>
                {!r.published && <span className="ml-2 mono-label text-[var(--warning)]">DRAFT</span>}
              </p>
              <p className="mt-1 text-sm text-[var(--mist)] line-clamp-2">{r.quote}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setEditing(r)} className="mono-label text-[var(--silver)] hover:text-[var(--white)]">
                Edit
              </button>
              <button onClick={() => remove(r.id)} className="text-[var(--mist)] hover:text-[var(--danger)]">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && !editing && (
          <p className="text-center text-[var(--mist)] py-10">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}

function Text({ v, on, ph }: { v: string; on: (v: string) => void; ph: string }) {
  return (
    <input
      placeholder={ph}
      value={v}
      onChange={(e) => on(e.target.value)}
      className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-2.5 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
    />
  );
}
