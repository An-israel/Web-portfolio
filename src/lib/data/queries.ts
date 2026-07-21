import { createClient } from '@/lib/supabase/server';
import {
  PROJECTS as SEED_PROJECTS,
  SITE_SETTINGS as SEED_SETTINGS,
  getAllProjects as seedAll,
  getFeaturedProjects as seedFeatured,
  getProjectBySlug as seedBySlug,
} from '@/lib/data/site';
import type { WorkProject, SiteSettings, Testimonial, Design } from '@/types';

// ------------------------------------------------------------
// Server-side reads. Every function falls back to the seeded
// data layer if Supabase is unconfigured, errors, or is empty,
// so the public site never breaks.
// ------------------------------------------------------------

export async function fetchAllProjects(): Promise<WorkProject[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return seedAll();
    return data as unknown as WorkProject[];
  } catch {
    return seedAll();
  }
}

export async function fetchFeaturedProjects(): Promise<WorkProject[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return seedFeatured();
    return data as unknown as WorkProject[];
  } catch {
    return seedFeatured();
  }
}

export async function fetchProjectBySlug(slug: string): Promise<WorkProject | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error || !data) return seedBySlug(slug) ?? null;
    return data as unknown as WorkProject;
  } catch {
    return seedBySlug(slug) ?? null;
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error || !data || data.length === 0) return SEED_SETTINGS;

    const map = new Map(data.map((r) => [r.key, r.value]));
    const get = <T>(key: string, fallback: T): T => {
      const v = map.get(key);
      return v === undefined || v === null ? fallback : (v as T);
    };
    // Optional URLs: empty string means "unset" → null.
    const url = (key: string, fallback: string | null): string | null => {
      const v = get<string | null>(key, fallback);
      return v ? v : null;
    };

    return {
      hero_headline: get('hero_headline', SEED_SETTINGS.hero_headline),
      hero_subline: get('hero_subline', SEED_SETTINGS.hero_subline),
      email: get('email', SEED_SETTINGS.email),
      github_url: url('github_url', SEED_SETTINGS.github_url),
      x_url: url('x_url', SEED_SETTINGS.x_url),
      linkedin_url: url('linkedin_url', SEED_SETTINGS.linkedin_url),
      availability_status: get('availability_status', SEED_SETTINGS.availability_status),
      resume_url: url('resume_url', SEED_SETTINGS.resume_url),
      stats: get('stats', SEED_SETTINGS.stats),
      budget_options: (() => {
        const v = get<string[]>('budget_options', SEED_SETTINGS.budget_options);
        return Array.isArray(v) && v.length ? v : SEED_SETTINGS.budget_options;
      })(),
      profile_image_url: url('profile_image_url', SEED_SETTINGS.profile_image_url),
      about_headline: get('about_headline', SEED_SETTINGS.about_headline),
      about_intro: get('about_intro', SEED_SETTINGS.about_intro),
      about_story: get('about_story', SEED_SETTINGS.about_story),
    };
  } catch {
    return SEED_SETTINGS;
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data as unknown as Testimonial[];
  } catch {
    return [];
  }
}

export function allProjectSlugs(): { slug: string }[] {
  return SEED_PROJECTS.map((p) => ({ slug: p.slug }));
}

// ---------- Designs ----------
export async function fetchDesigns(): Promise<Design[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Design[];
  } catch {
    return [];
  }
}

export async function fetchDesignBySlug(slug: string): Promise<Design | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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
