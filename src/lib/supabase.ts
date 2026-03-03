import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RefLink = { title: string; url: string };

export type Author = {
  id: string;
  name: string;
  birth_death_year: string | null;
  hometown: string | null;
  bio_short: string | null;
  bio_life: string | null;
  bio_style: string | null;
  avatar_url: string | null;
  video_doc_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Genre = {
  id: string;
  name: string;
  sort_order: number;
};

export type LiteraryPeriod = {
  id: string;
  period_name: string;
  historical_context: string | null;
  start_year: string | null;
  end_year: string | null;
  sort_order: number;
  created_at: string;
};

export type Work = {
  id: string;
  author_id: string;
  period_id: string | null;
  genre_id: string | null;
  title: string;
  composition_year: string | null;
  cover_image_url: string | null;
  content_html: string | null;
  youtube_embed_id: string | null;
  map_coordinates: string | null;
  excerpt: string | null;
  writing_context: string | null;
  content_summary: string | null;
  art_features: string | null;
  significance: string | null;
  reference_links: RefLink[] | null;
  created_at: string;
  updated_at: string;
  author?: Author;
  period?: LiteraryPeriod;
  genre?: Genre;
};

export type MultimediaAsset = {
  id: string;
  work_id: string;
  asset_type: string;
  catbox_url: string;
  description: string | null;
  created_at: string;
};
