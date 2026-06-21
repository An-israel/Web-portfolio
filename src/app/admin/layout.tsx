'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Star,
  Inbox,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen, exact: false },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign, exact: false },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star, exact: false },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--bg)] flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-raised)] border-r border-[var(--line)] flex flex-col transition-transform duration-200',
            'lg:translate-x-0 lg:static lg:z-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo */}
          <div className="h-16 px-6 flex items-center border-b border-[var(--line)]">
            <Link href="/" className="font-heading font-bold text-[var(--ink)]">
              Swift<span className="text-[var(--gold)]">Creator</span>
            </Link>
            <span className="ml-2 text-xs text-[var(--muted)] font-heading uppercase tracking-widest">
              Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-heading font-medium transition-colors',
                    active
                      ? 'bg-[var(--gold)]/10 text-[var(--gold)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[var(--line)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-sm font-heading font-medium text-[var(--muted)] hover:text-red-400 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-16 border-b border-[var(--line)] px-6 flex items-center gap-4 bg-[var(--bg)] sticky top-0 z-30">
            <button
              className="lg:hidden text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-sm text-[var(--muted)]">
              {NAV_ITEMS.find((i) => isActive(i.href, i.exact))?.label || 'Admin'}
            </div>
            <div className="ml-auto">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors font-heading"
              >
                View site &rarr;
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
