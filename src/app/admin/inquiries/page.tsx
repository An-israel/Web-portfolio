'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildWhatsAppLink, buildMailtoLink } from '@/lib/contact';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Mail } from 'lucide-react';
import type { Inquiry } from '@/types';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  const fetchInquiries = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setInquiries((data || []) as unknown as Inquiry[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function markRead(inquiry: Inquiry) {
    if (inquiry.is_read) {
      setSelected(inquiry);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from('inquiries')
      .update({ is_read: true })
      .eq('id', inquiry.id);

    if (!error) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, is_read: true } : i))
      );
    }
    setSelected({ ...inquiry, is_read: true });
  }

  const unread = inquiries.filter((i) => !i.is_read).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">Inquiries</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {unread > 0 ? (
            <span>
              <span className="text-[var(--gold)]">{unread} unread</span> &middot; {inquiries.length} total
            </span>
          ) : (
            `${inquiries.length} total`
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--muted)]">Loading...</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)] border border-[var(--line)] rounded-sm">
          <p>No inquiries yet.</p>
          <p className="text-xs mt-1">They&apos;ll appear here when visitors use the contact form.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] divide-y divide-[var(--line)] overflow-hidden">
            {inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => markRead(inquiry)}
                className={`w-full text-left px-5 py-4 hover:bg-[var(--line)] transition-colors ${
                  selected?.id === inquiry.id ? 'bg-[var(--line)]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1.5">
                    {!inquiry.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                    )}
                    {inquiry.is_read && (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading font-medium text-sm text-[var(--ink)] truncate">
                        {inquiry.name}
                      </p>
                      <time className="text-xs text-[var(--muted)] shrink-0">
                        {new Date(inquiry.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </time>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{inquiry.project_type}</p>
                    {inquiry.message && (
                      <p className="text-xs text-[var(--muted)]/70 mt-1 line-clamp-1">
                        {inquiry.message}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] p-6">
            {selected ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-[var(--ink)]">
                    {selected.name}
                  </h2>
                  <p className="label-micro mt-1">{selected.project_type}</p>
                </div>

                <div className="space-y-3 text-sm">
                  {selected.email && (
                    <div className="flex gap-3">
                      <span className="text-[var(--muted)] w-16 shrink-0">Email</span>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-[var(--gold)] hover:underline"
                      >
                        {selected.email}
                      </a>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex gap-3">
                      <span className="text-[var(--muted)] w-16 shrink-0">Phone</span>
                      <span className="text-[var(--ink)]">{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <span className="text-[var(--muted)] w-16 shrink-0">Received</span>
                    <span className="text-[var(--ink)]">
                      {new Date(selected.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {selected.message && (
                  <div>
                    <p className="label-micro mb-2">Message</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--line)] flex flex-col gap-3">
                  <p className="label-micro mb-1">Reply via</p>
                  {selected.phone && (
                    <a
                      href={buildWhatsAppLink(
                        `Hi ${selected.name}, thanks for reaching out! I'm Aniekan from SwiftCreator.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 border border-green-800/30 bg-green-950/20 hover:bg-green-950/40 rounded-sm text-sm text-green-300 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Reply on WhatsApp
                    </a>
                  )}
                  {selected.email && (
                    <a
                      href={buildMailtoLink(
                        `Re: Your ${selected.project_type} inquiry`,
                        `Hi ${selected.name},\n\nThanks for reaching out via SwiftCreator!\n\n`
                      )}
                      className="flex items-center gap-3 px-4 py-3 border border-[var(--line)] hover:border-[var(--gold)] rounded-sm text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Reply by email
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--muted)]">
                Select an inquiry to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
