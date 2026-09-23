import { createPublicClient } from '@/lib/supabase/public';
import { SUPABASE_CONFIGURED } from '@/lib/site-config';
import {
  SITE_SETTINGS as SEED_SETTINGS,
  getAllProjects as seedAll,
  getFeaturedProjects as seedFeatured,
  getProjectBySlug as seedBySlug,
  mergeSettings,
} from '@/lib/data/site';
import type { WorkProject, SiteSettings, Testimonial, Design, Course } from '@/types';

// ------------------------------------------------------------
// Server-side public reads (cookie-free, so pages can be cached).
// The built-in sample projects are used only when Supabase isn't
// configured or can't be reached — never when you've deliberately
// unpublished or deleted something.
// ------------------------------------------------------------

export async function fetchAllProjects(): Promise<WorkProject[]> {
  if (!SUPABASE_CONFIGURED) return seedAll();
  try {
    const { data, error } = await createPublicClient()
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return seedAll();
    return data as unknown as WorkProject[];
  } catch {
    return seedAll();
  }
}

export async function fetchFeaturedProjects(): Promise<WorkProject[]> {
  if (!SUPABASE_CONFIGURED) return seedFeatured();
  try {
    const { data, error } = await createPublicClient()
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return seedFeatured();
    return data as unknown as WorkProject[];
  } catch {
    return seedFeatured();
  }
}

export async function fetchProjectBySlug(slug: string): Promise<WorkProject | null> {
  if (!SUPABASE_CONFIGURED) return seedBySlug(slug) ?? null;
  try {
    const { data, error } = await createPublicClient()
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) return seedBySlug(slug) ?? null;
    return (data as unknown as WorkProject) ?? null;
  } catch {
    return seedBySlug(slug) ?? null;
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!SUPABASE_CONFIGURED) return SEED_SETTINGS;
  try {
    const { data, error } = await createPublicClient().from('site_settings').select('key, value');
    if (error || !data) return SEED_SETTINGS;
    return mergeSettings(new Map(data.map((r) => [r.key, r.value])));
  } catch {
    return SEED_SETTINGS;
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const { data, error } = await createPublicClient()
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Testimonial[];
  } catch {
    return [];
  }
}

export async function fetchDesigns(opts: { featured?: boolean; limit?: number } = {}): Promise<Design[]> {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    let q = createPublicClient()
      .from('designs')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (opts.featured) q = q.eq('featured', true);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as unknown as Design[];
  } catch {
    return [];
  }
}

export const fetchFeaturedDesigns = (limit = 3) => fetchDesigns({ featured: true, limit });

export async function fetchCourses(): Promise<Course[]> {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const { data, error } = await createPublicClient()
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Course[];
  } catch {
    return [];
  }
}

export async function fetchDesignBySlug(slug: string): Promise<Design | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { data, error } = await createPublicClient()
      .from('designs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Design;
  } catch {
    return null;
  }
}
