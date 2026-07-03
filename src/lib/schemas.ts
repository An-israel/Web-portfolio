import { z } from 'zod';

// ---------- Hire inquiry (public → /api/inquiry) ----------
export const inquiryApiSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('A valid email is required').max(200),
  company: z.string().max(200).nullish(),
  role_at_company: z.string().max(200).nullish(),
  project_type: z.string().min(1).max(60),
  budget_range: z.string().max(60).nullish(),
  timeline: z.string().max(60).nullish(),
  description: z.string().min(30, 'Tell me a bit more').max(5000),
  how_found: z.string().max(60).nullish(),
  // anti-spam
  website: z.string().max(0).optional(), // honeypot — must be empty
  elapsed_ms: z.number().optional(),
});

export type InquiryApiData = z.infer<typeof inquiryApiSchema>;

// ---------- Admin: project ----------
export const projectSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  category: z.enum(['AI Product', 'SaaS', 'Platform']),
  one_liner: z.string().max(300).optional().or(z.literal('')),
  problem: z.string().optional().or(z.literal('')),
  architecture: z.string().optional().or(z.literal('')),
  build_notes: z.string().optional().or(z.literal('')),
  outcome: z.string().optional().or(z.literal('')),
  stack: z.array(z.string()).default([]),
  role: z.string().max(120).default('Founder & Sole Engineer'),
  year: z.string().max(10).optional().or(z.literal('')),
  status: z.enum(['Live', 'In Development', 'Archived']).default('Live'),
  live_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ---------- Admin: testimonial ----------
export const testimonialSchema = z.object({
  author_name: z.string().min(1, 'Author name is required').max(120),
  author_role: z.string().max(150).optional().or(z.literal('')),
  author_company: z.string().max(150).optional().or(z.literal('')),
  quote: z.string().min(10, 'Quote is too short').max(1000),
  avatar_url: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
