import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MonoLabel } from '@/components/site/MonoLabel';

async function getData() {
  try {
    const supabase = await createClient();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

    const [newInq, monthInq, views7, publishedProjects, latest] = await Promise.all([
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    return {
      newInquiries: newInq.count || 0,
      monthInquiries: monthInq.count || 0,
      views7: views7.count || 0,
      publishedProjects: publishedProjects.count || 0,
      latest: (latest.data || []) as Array<{
        id: string;
        full_name: string;
        company: string | null;
        project_type: string;
        status: string;
        created_at: string;
      }>,
    };
  } catch {
    return { newInquiries: 0, monthInquiries: 0, views7: 0, publishedProjects: 0, latest: [] };
  }
}

export default async function AdminOverview() {
  const d = await getData();
  const stats = [
    { label: 'NEW INQUIRIES', value: d.newInquiries, href: '/admin/inquiries', hot: d.newInquiries > 0 },
    { label: 'INQUIRIES THIS MONTH', value: d.monthInquiries, href: '/admin/inquiries' },
    { label: 'PAGE VIEWS (7D)', value: d.views7, href: '/admin/analytics' },
    { label: 'PUBLISHED PROJECTS', value: d.publishedProjects, href: '/admin/projects' },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-[var(--platinum)] mb-1">Overview</h1>
      <MonoLabel className="text-[var(--mist)]">MISSION CONTROL</MonoLabel>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-5 rounded-md border border-[var(--steel)] bg-[var(--graphite)] hover:border-[var(--silver)] transition-colors"
          >
            <p className={`font-display text-4xl ${s.hot ? 'text-[var(--silver)]' : 'text-[var(--platinum)]'}`}>
              {s.value}
            </p>
            <MonoLabel className="mt-2 block text-[var(--mist)]">{s.label}</MonoLabel>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-md border border-[var(--steel)] bg-[var(--graphite)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--steel)]">
          <MonoLabel className="text-[var(--platinum)]">LATEST INQUIRIES</MonoLabel>
          <Link href="/admin/inquiries" className="mono-label text-[var(--mist)] hover:text-[var(--platinum)]">
            View all →
          </Link>
        </div>
        {d.latest.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--mist)]">
            No inquiries yet — share your /hire link.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--steel)]">
            {d.latest.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/admin/inquiries/${i.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--steel)]/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--platinum)]">
                      {i.full_name}
                      {i.company ? <span className="text-[var(--mist)]"> · {i.company}</span> : null}
                    </p>
                    <MonoLabel className="text-[var(--mist)]">{i.project_type}</MonoLabel>
                  </div>
                  <time className="mono-label text-[var(--mist)] shrink-0">
                    {new Date(i.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
