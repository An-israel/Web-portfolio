'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  FolderOpen,
  MessageSquareQuote,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { AvailabilityStatus } from '@/types';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox, exact: false },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen, exact: false },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, exact: false },
];

const AVAIL: AvailabilityStatus[] = ['Available', 'Limited', 'Booked'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available');

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) return;
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'availability_status')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setAvailability(data.value as AvailabilityStatus);
      });
  }, [isLogin]);

  async function setAvail(next: AvailabilityStatus) {
    setAvailability(next);
    const supabase = createClient();
    await supabase
      .from('site_settings')
      .upsert({ key: 'availability_status', value: next }, { onConflict: 'key' });
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-[var(--graphite)] border-r border-[var(--steel)] flex flex-col transition-transform',
          'lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 px-6 flex items-center border-b border-[var(--steel)]">
          <Link href="/admin" className="mono-label text-[var(--platinum)]">
            ANIEKAN ISRAEL
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = active(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors border-l-2',
                  on
                    ? 'border-[var(--silver)] text-[var(--platinum)] bg-[var(--steel)]/40'
                    : 'border-transparent text-[var(--mist)] hover:text-[var(--platinum)]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[var(--steel)]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm text-[var(--mist)] hover:text-[var(--danger)] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[var(--steel)] px-6 flex items-center gap-4 bg-[var(--obsidian)] sticky top-0 z-30">
          <button
            className="lg:hidden text-[var(--mist)]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="mono-label text-[var(--mist)] hidden sm:inline">AVAILABILITY</span>
            {AVAIL.map((a) => (
              <button
                key={a}
                onClick={() => setAvail(a)}
                className={cn(
                  'mono-label rounded-md px-2.5 py-1.5 border transition-colors',
                  availability === a
                    ? 'border-[var(--silver)] text-[var(--platinum)]'
                    : 'border-[var(--steel)] text-[var(--mist)] hover:text-[var(--platinum)]'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
