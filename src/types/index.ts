// ============================================================
// Aniekan Israel — personal portfolio types
// ============================================================

import type { BriefAnswers, BriefStatus } from '@/lib/brief';

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

// ---------- Coaching / courses ----------
export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  curriculum: string[];
  price_naira: number;
  duration: string | null;
  level: string | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

/** A label from HIRE_PROJECT_TYPES (older inquiries may hold legacy values). */
export type InquiryProjectType = string;


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
  profile_image_url: string | null;
  about_headline: string;
  about_intro: string;
  about_story: string;
  payment_bank: string;
  payment_account: string;
  payment_name: string;
  whatsapp_number: string;
  /** Home “Approach” paragraph. */
  home_approach: string;
  /** One per line: `Title | body`. */
  about_principles: string;
  /** One per line: `Group: item, item`. */
  about_toolbox: string;
  /** One per line: `Year | milestone`. */
  about_timeline: string;
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

export interface ClientBrief {
  id: string;
  token: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  note: string | null;
  status: BriefStatus;
  answers: BriefAnswers | null;
  submitted_at: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type EnrolmentStatus = 'pending' | 'paid' | 'cancelled';

export interface Enrolment {
  id: string;
  course_id: string | null;
  course_title: string;
  amount_naira: number;
  full_name: string;
  phone: string;
  email: string | null;
  status: EnrolmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
