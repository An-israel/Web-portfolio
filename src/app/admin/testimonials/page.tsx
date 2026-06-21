'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FeatureToggle } from '@/components/admin/FeatureToggle';
import { useToast } from '@/components/ui/use-toast';
import type { Testimonial } from '@/types';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order');

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setTestimonials((data || []) as unknown as Testimonial[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  function openNew() {
    setEditing({
      author_name: '',
      author_role: '',
      author_avatar_url: '',
      quote: '',
      is_published: false,
      sort_order: testimonials.length,
    });
  }

  async function handleSave() {
    if (!editing?.author_name || !editing?.quote) {
      toast({
        title: 'Validation error',
        description: 'Author name and quote are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      author_name: editing.author_name,
      author_role: editing.author_role || null,
      author_avatar_url: editing.author_avatar_url || null,
      quote: editing.quote,
      is_published: editing.is_published || false,
      sort_order: editing.sort_order || 0,
    };

    let error;
    if (editing.id) {
      const res = await supabase.from('testimonials').update(payload).eq('id', editing.id);
      error = res.error;
    } else {
      const res = await supabase.from('testimonials').insert(payload);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editing.id ? 'Testimonial updated!' : 'Testimonial added!', variant: 'default' });
      setEditing(null);
      fetchTestimonials();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Testimonial deleted' });
      fetchTestimonials();
    }
  }

  async function handleTogglePublish(id: string, value: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from('testimonials')
      .update({ is_published: value })
      .eq('id', id);

    if (error) throw error;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_published: value } : t))
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">Testimonials</h1>
        <Button onClick={openNew} className="font-heading text-xs tracking-widest uppercase">
          <Plus className="w-4 h-4" />
          Add testimonial
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--muted)]">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)] border border-[var(--line)] rounded-sm">
          <p className="mb-4">No testimonials yet.</p>
          <Button onClick={openNew} variant="outline" className="font-heading text-xs tracking-widest uppercase">
            Add your first
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-4 p-5 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)]"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--line)] flex items-center justify-center shrink-0">
                <span className="text-sm font-heading font-semibold text-[var(--muted)]">
                  {t.author_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-medium text-sm text-[var(--ink)]">
                  {t.author_name}
                </p>
                <p className="text-xs text-[var(--muted)]">{t.author_role}</p>
                <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <FeatureToggle
                  checked={t.is_published}
                  onChange={(val) => handleTogglePublish(t.id, val)}
                  label="Published"
                />
                <button
                  onClick={() => setEditing(t)}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-[var(--muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-raised)] border border-[var(--line)] rounded-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-[var(--ink)]">
                {editing.id ? 'Edit testimonial' : 'New testimonial'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <Label>Author name *</Label>
              <Input
                value={editing.author_name || ''}
                onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                placeholder="Chukwuemeka Eze"
              />
            </div>

            <div>
              <Label>Role / Company</Label>
              <Input
                value={editing.author_role || ''}
                onChange={(e) => setEditing({ ...editing, author_role: e.target.value })}
                placeholder="CEO, Horizon Real Estate"
              />
            </div>

            <div>
              <Label>Avatar URL</Label>
              <Input
                value={editing.author_avatar_url || ''}
                onChange={(e) => setEditing({ ...editing, author_avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Quote *</Label>
              <Textarea
                value={editing.quote || ''}
                onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                rows={4}
                placeholder="What they said about working with you..."
              />
            </div>

            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={editing.sort_order || 0}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-heading font-medium text-[var(--ink)]">Published</p>
                <p className="text-xs text-[var(--muted)]">Show on public site</p>
              </div>
              <Switch
                checked={editing.is_published || false}
                onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 font-heading text-xs tracking-widest uppercase"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(null)}
                className="font-heading text-xs tracking-widest uppercase"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
