import type { MetadataRoute } from 'next';
import { fetchAllProjects, fetchDesigns } from '@/lib/data/queries';
import { SITE_URL } from '@/lib/site-config';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, designs] = await Promise.all([fetchAllProjects(), fetchDesigns()]);
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' = 'monthly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page('', 1, 'weekly'),
    page('/services', 0.9),
    page('/hire', 0.9),
    page('/work', 0.8, 'weekly'),
    page('/designs', 0.8, 'weekly'),
    page('/coaching', 0.8),
    page('/about', 0.7),
    ...projects.map((p) => ({
      ...page(`/work/${p.slug}`, 0.6),
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
    })),
    ...designs.map((d) => ({
      ...page(`/designs/${d.slug}`, 0.6),
      lastModified: d.updated_at ? new Date(d.updated_at) : now,
    })),
  ];
}
