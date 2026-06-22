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
  author_avatar_url: string | null;
  quote: string;
  is_published: boolean;
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
