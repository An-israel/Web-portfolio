// ============================================================
// Aniekan Israel — personal portfolio types
// ============================================================

export type ProjectCategory = 'AI Product' | 'SaaS' | 'Platform';
export type ProjectStatus = 'Live' | 'In Development' | 'Archived';

export interface WorkProject {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  one_liner: string;
  problem: string;
  architecture: string;
  build_notes: string;
  outcome: string;
  stack: string[];
  role: string;
  year: string;
  status: ProjectStatus;
  live_url: string | null;
  github_url: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

// ---------- Designs (visual / graphic-design portfolio) ----------
export type DesignCategory =
  | 'Brand Identity'
  | 'Poster'
  | 'Social Media'
  | 'UI/UX'
  | 'Logo'
  | 'Illustration'
  | 'Other';

export interface Design {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  story: string | null;
  dimensions: string | null;
  tools: string[];
  client: string | null;
  year: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export type InquiryProjectType =
  | 'AI Product'
  | 'Full-Stack Build'
  | 'MVP / Zero-to-One'
  | 'Consulting'
  | 'Full-Time Role'
  | 'Other';

export type InquiryBudget =
  | '<$2k'
  | '$2k–$5k'
  | '$5k–$15k'
  | '$15k–$50k'
  | '$50k+'
  | 'Salary role';

export type InquiryTimeline = 'ASAP' | '2–4 weeks' | '1–3 months' | 'Flexible';

export type InquiryStatus =
  | 'new'
  | 'reviewing'
  | 'replied'
  | 'call_booked'
  | 'won'
  | 'lost'
  | 'archived';

export interface HireInquiry {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  role_at_company: string | null;
  project_type: InquiryProjectType;
  budget_range: string | null;
  timeline: InquiryTimeline | null;
  description: string;
  how_found: string | null;
  attachments: string[];
  status: InquiryStatus;
  priority: 'high' | 'normal' | 'low';
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AvailabilityStatus = 'Available' | 'Limited' | 'Booked';

export interface SiteStats {
  products_shipped: string;
  years_building: string;
  stack_depth: string;
  response_time: string;
}

export interface SiteSettings {
  hero_headline: string;
  hero_subline: string;
  email: string;
  github_url: string | null;
  x_url: string | null;
  linkedin_url: string | null;
  availability_status: AvailabilityStatus;
  resume_url: string | null;
  stats: SiteStats;
  budget_options: string[];
}

// ============================================================
// Legacy types — consumed only by the /admin subsystem and a
// few dormant components pending the admin rebuild. Not used
// by any public page. Kept so the project type-checks.
// ============================================================

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string | null;
  full_description: string | null;
  cover_image_url: string | null;
  cover_device: 'browser' | 'laptop' | 'phone';
  gallery: GalleryImage[] | null;
  tech_stack: string[] | null;
  live_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  device: 'browser' | 'laptop' | 'phone';
}

export interface PricingTier {
  id: string;
  name: string;
  price_label: string;
  summary: string | null;
  features: string[];
  delivery_days: number;
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  quote: string;
  avatar_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  project_type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}
