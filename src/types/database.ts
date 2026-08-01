// Hand-authored to match supabase/migrations/0001_portfolio_schema.sql.
// Keeps the typed Supabase clients honest across the app.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  one_liner: string | null;
  problem: string | null;
  architecture: string | null;
  build_notes: string | null;
  outcome: string | null;
  stack: string[];
  role: string;
  year: string | null;
  status: string;
  live_url: string | null;
  github_url: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type InquiryRow = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  role_at_company: string | null;
  project_type: string;
  budget_range: string | null;
  timeline: string | null;
  description: string;
  how_found: string | null;
  attachments: string[];
  status: string;
  priority: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  quote: string;
  avatar_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

type SiteSettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

type PageViewRow = {
  id: string;
  path: string;
  referrer: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

type CourseRow = {
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
  created_at: string;
  updated_at: string;
};

type DesignRow = {
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
  created_at: string;
  updated_at: string;
};

type WithDefaults<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>;

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow;
        Insert: WithDefaults<
          ProjectRow,
          | 'id'
          | 'one_liner'
          | 'problem'
          | 'architecture'
          | 'build_notes'
          | 'outcome'
          | 'stack'
          | 'role'
          | 'year'
          | 'status'
          | 'live_url'
          | 'github_url'
          | 'cover_image_url'
          | 'gallery_urls'
          | 'featured'
          | 'sort_order'
          | 'published'
          | 'created_at'
          | 'updated_at'
        >;
        Update: Partial<ProjectRow>;
        Relationships: [];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: WithDefaults<
          InquiryRow,
          | 'id'
          | 'company'
          | 'role_at_company'
          | 'budget_range'
          | 'timeline'
          | 'how_found'
          | 'attachments'
          | 'status'
          | 'priority'
          | 'internal_notes'
          | 'created_at'
          | 'updated_at'
        >;
        Update: Partial<InquiryRow>;
        Relationships: [];
      };
      testimonials: {
        Row: TestimonialRow;
        Insert: WithDefaults<
          TestimonialRow,
          | 'id'
          | 'author_role'
          | 'author_company'
          | 'avatar_url'
          | 'published'
          | 'sort_order'
          | 'created_at'
        >;
        Update: Partial<TestimonialRow>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: WithDefaults<SiteSettingRow, 'updated_at'>;
        Update: Partial<SiteSettingRow>;
        Relationships: [];
      };
      page_views: {
        Row: PageViewRow;
        Insert: WithDefaults<PageViewRow, 'id' | 'referrer' | 'created_at'>;
        Update: Partial<PageViewRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: WithDefaults<ProfileRow, 'email' | 'is_admin' | 'created_at'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      courses: {
        Row: CourseRow;
        Insert: WithDefaults<
          CourseRow,
          | 'id'
          | 'summary'
          | 'description'
          | 'curriculum'
          | 'price_naira'
          | 'duration'
          | 'level'
          | 'featured'
          | 'sort_order'
          | 'published'
          | 'created_at'
          | 'updated_at'
        >;
        Update: Partial<CourseRow>;
        Relationships: [];
      };
      designs: {
        Row: DesignRow;
        Insert: WithDefaults<
          DesignRow,
          | 'id'
          | 'category'
          | 'summary'
          | 'story'
          | 'dimensions'
          | 'tools'
          | 'client'
          | 'year'
          | 'cover_image_url'
          | 'gallery_urls'
          | 'featured'
          | 'sort_order'
          | 'published'
          | 'created_at'
          | 'updated_at'
        >;
        Update: Partial<DesignRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
