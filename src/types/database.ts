export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          short_description: string | null;
          full_description: string | null;
          cover_image_url: string | null;
          cover_device: 'browser' | 'laptop' | 'phone';
          gallery: Json | null;
          tech_stack: string[] | null;
          live_url: string | null;
          is_published: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          short_description?: string | null;
          full_description?: string | null;
          cover_image_url?: string | null;
          cover_device?: 'browser' | 'laptop' | 'phone';
          gallery?: Json | null;
          tech_stack?: string[] | null;
          live_url?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          short_description?: string | null;
          full_description?: string | null;
          cover_image_url?: string | null;
          cover_device?: 'browser' | 'laptop' | 'phone';
          gallery?: Json | null;
          tech_stack?: string[] | null;
          live_url?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_tiers: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          price_label: string;
          summary?: string | null;
          features: string[];
          delivery_days: number;
          is_highlighted?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_label?: string;
          summary?: string | null;
          features?: string[];
          delivery_days?: number;
          is_highlighted?: boolean;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string | null;
          author_avatar_url: string | null;
          quote: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_role?: string | null;
          author_avatar_url?: string | null;
          quote: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_role?: string | null;
          author_avatar_url?: string | null;
          quote?: string;
          is_published?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          project_type: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          project_type: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          project_type?: string;
          message?: string | null;
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
