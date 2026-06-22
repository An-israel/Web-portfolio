import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FolderOpen, DollarSign, Star, Inbox, ArrowUpRight } from 'lucide-react';
import type { Inquiry } from '@/types';

async function getDashboardData() {
  try {
    const supabase = await createClient();

    const [
      { count: totalProjects },
      { count: publishedProjects },
      { count: featuredProjects },
      { count: unreadInquiries },
      { data: latestInquiries },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
      supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return {
      totalProjects: totalProjects || 0,
      publishedProjects: publishedProjects || 0,
      featuredProjects: featuredProjects || 0,
      unreadInquiries: unreadInquiries || 0,
      latestInquiries: (latestInquiries || []) as unknown as Inquiry[],
    };
  } catch {
    return {
      totalProjects: 0,
      publishedProjects: 0,
      featuredProjects: 0,
      unreadInquiries: 0,
      latestInquiries: [],
    };
  }
}

const STATS_CONFIG = [
  { label: 'Total projects', icon: FolderOpen, key: 'totalProjects', href: '/admin/projects' },
  { label: 'Published', icon: ArrowUpRight, key: 'publishedProjects', href: '/admin/projects' },
  { label: 'Featured', icon: Star, key: 'featuredProjects', href: '/admin/projects' },
  { label: 'Unread leads', icon: Inbox, key: 'unreadInquiries', href: '/admin/inquiries' },
];

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statValues: Record<string, number> = {
    totalProjects: data.totalProjects,
    publishedProjects: data.publishedProjects,
    featuredProjects: data.featuredProjects,
    unreadInquiries: data.unreadInquiries,
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Welcome back, Aniekan.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS_CONFIG.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="p-5 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] hover:border-[var(--gold)] transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors" />
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--line)] group-hover:text-[var(--gold)] transition-colors" />
              </div>
              <div className="font-display text-3xl font-bold text-[var(--ink)] mb-1">
                {statValues[stat.key]}
              </div>
              <div className="text-xs text-[var(--muted)] font-heading uppercase tracking-wider">
                {stat.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Latest inquiries */}
      <div className="border border-[var(--line)] rounded-sm bg-[var(--bg-raised)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)]">
            Latest inquiries
          </h2>
          <Link
            href="/admin/inquiries"
            className="text-xs text-[var(--muted)] hover:text-[var(--gold)] transition-colors font-heading"
          >
            View all &rarr;
          </Link>
        </div>

        {data.latestInquiries.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--muted)]">
            No inquiries yet. They&apos;ll appear here when visitors contact you.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {data.latestInquiries.map((inquiry) => (
              <li key={inquiry.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-medium text-sm text-[var(--ink)]">
                        {inquiry.name}
                      </span>
                      {!inquiry.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {inquiry.project_type}
                      {inquiry.email ? ` · ${inquiry.email}` : ''}
                    </p>
                    {inquiry.message && (
                      <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1 opacity-70">
                        {inquiry.message}
                      </p>
                    )}
                  </div>
                  <time className="text-xs text-[var(--muted)] shrink-0">
                    {new Date(inquiry.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/projects/new', label: 'New project' },
          { href: '/admin/pricing', label: 'Edit pricing' },
          { href: '/admin/testimonials', label: 'Add testimonial' },
          { href: '/', label: 'View site', external: true },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            className="px-4 py-3 text-center text-sm font-heading font-medium text-[var(--muted)] border border-[var(--line)] rounded-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
