'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import type { PricingTier } from '@/types';

type EditTier = Partial<PricingTier> & {
  featuresText?: string;
};

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTier, setEditTier] = useState<EditTier | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTiers = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .order('sort_order');

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setTiers((data || []) as unknown as PricingTier[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  function openNew() {
    setEditTier({
      name: '',
      price_label: '',
      summary: '',
      featuresText: '',
      delivery_days: 7,
      is_highlighted: false,
      is_active: true,
      sort_order: tiers.length,
    });
  }

  function openEdit(tier: PricingTier) {
    setEditTier({
      ...tier,
      featuresText: tier.features.join('\n'),
    });
  }

  async function handleSave() {
    if (!editTier?.name || !editTier?.price_label) {
      toast({
        title: 'Validation error',
        description: 'Name and price label are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const features = (editTier.featuresText || '')
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: editTier.name,
      price_label: editTier.price_label,
      summary: editTier.summary || null,
      features,
      delivery_days: editTier.delivery_days || 7,
      is_highlighted: editTier.is_highlighted || false,
      is_active: editTier.is_active ?? true,
      sort_order: editTier.sort_order || 0,
    };

    let error;
    if (editTier.id) {
      const res = await supabase.from('pricing_tiers').update(payload).eq('id', editTier.id);
      error = res.error;
    } else {
      const res = await supabase.from('pricing_tiers').insert(payload);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editTier.id ? 'Tier updated!' : 'Tier created!', variant: 'default' });
      setEditTier(null);
      fetchTiers();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('pricing_tiers').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Tier deleted' });
      fetchTiers();
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">Pricing tiers</h1>
        <Button onClick={openNew} className="font-heading text-xs tracking-widest uppercase">
          <Plus className="w-4 h-4" />
          New tier
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--muted)]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="p-5 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-3"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-heading font-semibold text-[var(--ink)]">{tier.name}</p>
                  <p className="text-sm text-[var(--gold)]">{tier.price_label}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(tier)}
                    className="p-1.5 text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tier.id, tier.name)}
                    className="p-1.5 text-[var(--muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] line-clamp-2">{tier.summary}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span>{tier.delivery_days}d delivery</span>
                <span>{tier.is_active ? '● Active' : '○ Hidden'}</span>
                {tier.is_highlighted && (
                  <span className="text-[var(--gold)]">★ Highlighted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-raised)] border border-[var(--line)] rounded-sm p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-[var(--ink)]">
                {editTier.id ? 'Edit tier' : 'New tier'}
              </h2>
              <button
                onClick={() => setEditTier(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={editTier.name || ''}
                  onChange={(e) => setEditTier({ ...editTier, name: e.target.value })}
                  placeholder="Growth"
                />
              </div>
              <div>
                <Label>Price label *</Label>
                <Input
                  value={editTier.price_label || ''}
                  onChange={(e) => setEditTier({ ...editTier, price_label: e.target.value })}
                  placeholder="From ₦650k"
                />
              </div>
            </div>

            <div>
              <Label>Summary</Label>
              <Textarea
                value={editTier.summary || ''}
                onChange={(e) => setEditTier({ ...editTier, summary: e.target.value })}
                rows={2}
                placeholder="One-line description of what this tier includes..."
              />
            </div>

            <div>
              <Label>Features (one per line)</Label>
              <Textarea
                value={editTier.featuresText || ''}
                onChange={(e) => setEditTier({ ...editTier, featuresText: e.target.value })}
                rows={6}
                placeholder="Mobile-first design&#10;SEO setup&#10;2 rounds of revisions"
              />
            </div>

            <div>
              <Label>Delivery days</Label>
              <Input
                type="number"
                value={editTier.delivery_days || 7}
                onChange={(e) =>
                  setEditTier({ ...editTier, delivery_days: parseInt(e.target.value) || 7 })
                }
                className="w-24"
              />
            </div>

            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={editTier.sort_order || 0}
                onChange={(e) =>
                  setEditTier({ ...editTier, sort_order: parseInt(e.target.value) || 0 })
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-heading font-medium text-[var(--ink)]">Active</p>
                <p className="text-xs text-[var(--muted)]">Show on public site</p>
              </div>
              <Switch
                checked={editTier.is_active ?? true}
                onCheckedChange={(v) => setEditTier({ ...editTier, is_active: v })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-heading font-medium text-[var(--ink)]">Highlighted</p>
                <p className="text-xs text-[var(--muted)]">
                  Gold border + &quot;Most popular&quot; badge
                </p>
              </div>
              <Switch
                checked={editTier.is_highlighted || false}
                onCheckedChange={(v) => setEditTier({ ...editTier, is_highlighted: v })}
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
                onClick={() => setEditTier(null)}
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
