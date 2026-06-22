import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://swiftcreator.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('is_published', true);

    const projectRoutes: MetadataRoute.Sitemap = (projects || []).map((project) => ({
      url: `${baseUrl}/work/${project.slug}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
