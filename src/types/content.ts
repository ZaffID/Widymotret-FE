// Content Management Interfaces

// Hero section content
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  updated_at: string;
}

// About section content
export interface AboutContent {
  id: string;
  title: string;
  description: string;
  founder_name: string;
  founder_story: string;
  updated_at: string;
}

// Website settings and metadata
export interface WebsiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  phone: string;
  email: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  whatsapp_number: string;
  updated_at: string;
}

// Portfolio/Testimoni content
export interface TestimonialContent {
  id: string;
  title: string;
  subtitle: string;
  updated_at: string;
}

// Generic content type for any editable section
export interface EditableContent {
  id: string;
  section: string; // 'hero', 'about', 'settings', etc.
  field: string;   // 'title', 'subtitle', etc.
  value: string;
  updated_at: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Batch update for multiple fields
export interface BatchContentUpdate {
  updates: Array<{
    section: string;
    field: string;
    value: string;
  }>;
}
