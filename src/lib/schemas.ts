import { z } from 'zod';

// Inquiry form (BookDialog)
export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  project_type: z.string().min(1, 'Please select a project type'),
  message: z.string().max(1000).optional().or(z.literal('')),
  // Honeypot - must be empty
  website: z.string().max(0).optional(),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

// API inquiry payload
export const inquiryApiSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  project_type: z.string().min(1),
  message: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});

// Admin: Project form
export const projectSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  category: z.string().min(1, 'Category is required'),
  short_description: z.string().max(300).optional().or(z.literal('')),
  full_description: z.string().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  cover_device: z.enum(['browser', 'laptop', 'phone']).default('browser'),
  tech_stack: z.array(z.string()).optional(),
  live_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Admin: Pricing tier form
export const pricingTierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price_label: z.string().min(1, 'Price label is required').max(100),
  summary: z.string().max(300).optional().or(z.literal('')),
  features: z.array(z.string()),
  delivery_days: z.number().int().min(1).max(365),
  is_highlighted: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type PricingTierFormData = z.infer<typeof pricingTierSchema>;

// Admin: Testimonial form
export const testimonialSchema = z.object({
  author_name: z.string().min(1, 'Author name is required').max(100),
  author_role: z.string().max(150).optional().or(z.literal('')),
  author_avatar_url: z.string().url().optional().or(z.literal('')),
  quote: z.string().min(10, 'Quote is too short').max(1000),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
