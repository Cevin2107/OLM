-- ============================================================
-- BẢO TÀNG VĂN HỌC ONLINE – Full Setup SQL
-- Chạy toàn bộ file này trong SQL Editor của Supabase Dashboard
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────────────────────

-- Thể loại tác phẩm
CREATE TABLE IF NOT EXISTS genres (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text    NOT NULL UNIQUE,
  sort_order integer DEFAULT 0
);

-- Tác giả văn học
CREATE TABLE IF NOT EXISTS authors (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  birth_death_year text,
  bio_short        text,
  bio_life         text,        -- Cuộc đời (chi tiết)
  bio_style        text,        -- Phong cách sáng tác
  hometown         text,        -- Quê quán
  avatar_url       text,
  video_doc_id     text,        -- YouTube embed ID: video tư liệu về tác giả
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Giai đoạn văn học (dòng thời gian)
CREATE TABLE IF NOT EXISTS literary_periods (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name        text        NOT NULL,
  historical_context text,
  start_year         text,
  end_year           text,
  sort_order         integer     DEFAULT 0,
  created_at         timestamptz DEFAULT now()
);

-- Tác phẩm văn học
CREATE TABLE IF NOT EXISTS works (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid        REFERENCES authors(id) ON DELETE CASCADE,
  period_id        uuid        REFERENCES literary_periods(id) ON DELETE SET NULL,
  title            text        NOT NULL,
  genre_id         uuid        REFERENCES genres(id) ON DELETE SET NULL,
  composition_year text,        -- Năm / giai đoạn sáng tác (VD: "1813–1820")
  cover_image_url  text,        -- Ảnh bìa / minh họa tác phẩm
  content_html     text,
  content_type     text        NOT NULL DEFAULT 'prose' CHECK (content_type IN ('prose', 'poem')),
  youtube_embed_id text,
  map_coordinates  text,
  excerpt          text,
  writing_context  text,        -- Hoàn cảnh sáng tác
  content_summary  text,        -- Nội dung (tóm tắt)
  art_features     text,        -- Đặc sắc nghệ thuật
  significance     text,        -- Ý nghĩa / Giá trị
  reference_links  jsonb       DEFAULT '[]'::jsonb,  -- [{"title":"...","url":"..."}]
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Tài nguyên đa phương tiện đính kèm tác phẩm
CREATE TABLE IF NOT EXISTS multimedia_assets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id     uuid        REFERENCES works(id) ON DELETE CASCADE,
  asset_type  text        NOT NULL,   -- 'image' | 'video' | 'audio' | 'document'
  catbox_url  text        NOT NULL,
  description text,
  created_at  timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_works_author_id           ON works(author_id);
CREATE INDEX IF NOT EXISTS idx_works_period_id           ON works(period_id);
CREATE INDEX IF NOT EXISTS idx_multimedia_assets_work_id ON multimedia_assets(work_id);

-- Bình luận học sinh
CREATE TABLE IF NOT EXISTS comments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id     uuid        REFERENCES works(id) ON DELETE CASCADE,
  author_name text        NOT NULL,
  body        text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_work_id    ON comments(work_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Lí luận văn học
CREATE TABLE IF NOT EXISTS literary_theory (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,           -- Tên khái niệm / thuật ngữ
  category   text        NOT NULL,           -- Thể loại | Biện pháp tu từ | Phương thức biểu đạt | Khái niệm cơ bản
  definition text,                           -- Định nghĩa
  examples   text,                           -- Ví dụ minh họa
  notes      text,                           -- Ghi chú / Mở rộng
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_literary_theory_category ON literary_theory(category);
CREATE INDEX IF NOT EXISTS idx_literary_theory_sort     ON literary_theory(sort_order);

-- ─────────────────────────────────────────────────────────────
-- 1b. MIGRATE EXISTING TABLES (thêm cột mới nếu chưa có)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE authors ADD COLUMN IF NOT EXISTS video_doc_id text;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS hometown     text;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio_life     text;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio_style    text;

ALTER TABLE works ADD COLUMN IF NOT EXISTS composition_year  text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS cover_image_url   text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS reference_links   jsonb DEFAULT '[]'::jsonb;
ALTER TABLE works ADD COLUMN IF NOT EXISTS genre_id          uuid REFERENCES genres(id) ON DELETE SET NULL;
ALTER TABLE works ADD COLUMN IF NOT EXISTS writing_context  text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS content_summary  text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS art_features     text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS significance     text;
ALTER TABLE works ADD COLUMN IF NOT EXISTS content_type     text DEFAULT 'prose';

-- literary_theory (thêm bảng mới nếu đang dùng DB cũ – idempotent với IF NOT EXISTS ở trên)

-- Index cho genre_id (thêm sau migration để tránh lỗi nếu bảng works đã tồn tại)
CREATE INDEX IF NOT EXISTS idx_works_genre_id ON works(genre_id);

-- Đổi kiểu start_year / end_year sang text (cho phép ghi "Thế kỷ X", ...)
ALTER TABLE literary_periods ALTER COLUMN start_year TYPE text USING start_year::text;
ALTER TABLE literary_periods ALTER COLUMN end_year   TYPE text USING end_year::text;

-- Cột sắp xếp thủ công dòng thời gian
ALTER TABLE literary_periods ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;


-- ─────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE authors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres            ENABLE ROW LEVEL SECURITY;
ALTER TABLE literary_periods  ENABLE ROW LEVEL SECURITY;
ALTER TABLE works             ENABLE ROW LEVEL SECURITY;
ALTER TABLE multimedia_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE literary_theory   ENABLE ROW LEVEL SECURITY;

-- Mọi người đều đọc được (public website)
DROP POLICY IF EXISTS "public read authors"           ON authors;
DROP POLICY IF EXISTS "public read genres"             ON genres;
DROP POLICY IF EXISTS "public read literary_periods"  ON literary_periods;
DROP POLICY IF EXISTS "public read works"             ON works;
DROP POLICY IF EXISTS "public read multimedia_assets" ON multimedia_assets;
DROP POLICY IF EXISTS "public read comments"          ON comments;
DROP POLICY IF EXISTS "anon insert comments"          ON comments;
DROP POLICY IF EXISTS "public read literary_theory"   ON literary_theory;
DROP POLICY IF EXISTS "anon insert literary_theory"   ON literary_theory;
DROP POLICY IF EXISTS "anon update literary_theory"   ON literary_theory;
DROP POLICY IF EXISTS "anon delete literary_theory"   ON literary_theory;

CREATE POLICY "public read authors"           ON authors           FOR SELECT TO public USING (true);
CREATE POLICY "public read genres"             ON genres             FOR SELECT TO public USING (true);
CREATE POLICY "public read literary_periods"  ON literary_periods  FOR SELECT TO public USING (true);
CREATE POLICY "public read works"             ON works             FOR SELECT TO public USING (true);
CREATE POLICY "public read multimedia_assets" ON multimedia_assets FOR SELECT TO public USING (true);
CREATE POLICY "public read comments"          ON comments          FOR SELECT TO public USING (true);
CREATE POLICY "anon insert comments"          ON comments          FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public read literary_theory"   ON literary_theory   FOR SELECT TO public USING (true);
CREATE POLICY "anon insert literary_theory"   ON literary_theory   FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update literary_theory"   ON literary_theory   FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete literary_theory"   ON literary_theory   FOR DELETE TO anon USING (true);

-- Anon key được phép ghi (app không dùng authentication)
DROP POLICY IF EXISTS "anon insert authors"           ON authors;
DROP POLICY IF EXISTS "anon update authors"           ON authors;
DROP POLICY IF EXISTS "anon delete authors"           ON authors;
DROP POLICY IF EXISTS "anon insert genres"             ON genres;
DROP POLICY IF EXISTS "anon update genres"             ON genres;
DROP POLICY IF EXISTS "anon delete genres"             ON genres;
DROP POLICY IF EXISTS "anon insert literary_periods"  ON literary_periods;
DROP POLICY IF EXISTS "anon update literary_periods"  ON literary_periods;
DROP POLICY IF EXISTS "anon delete literary_periods"  ON literary_periods;
DROP POLICY IF EXISTS "anon insert works"             ON works;
DROP POLICY IF EXISTS "anon update works"             ON works;
DROP POLICY IF EXISTS "anon delete works"             ON works;
DROP POLICY IF EXISTS "anon insert multimedia_assets" ON multimedia_assets;
DROP POLICY IF EXISTS "anon update multimedia_assets" ON multimedia_assets;
DROP POLICY IF EXISTS "anon delete multimedia_assets" ON multimedia_assets;

CREATE POLICY "anon insert authors"           ON authors           FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update authors"           ON authors           FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete authors"           ON authors           FOR DELETE TO anon USING (true);

CREATE POLICY "anon insert genres"             ON genres             FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update genres"             ON genres             FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete genres"             ON genres             FOR DELETE TO anon USING (true);

CREATE POLICY "anon insert literary_periods"  ON literary_periods  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update literary_periods"  ON literary_periods  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete literary_periods"  ON literary_periods  FOR DELETE TO anon USING (true);

CREATE POLICY "anon insert works"             ON works             FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update works"             ON works             FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete works"             ON works             FOR DELETE TO anon USING (true);

CREATE POLICY "anon insert multimedia_assets" ON multimedia_assets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update multimedia_assets" ON multimedia_assets FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete multimedia_assets" ON multimedia_assets FOR DELETE TO anon USING (true);


-- ─────────────────────────────────────────────────────────────
-- 3. STORAGE BUCKET (ảnh tác giả)
-- ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'author-avatars',
  'author-avatars',
  true,
  5242880,   -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies (author-avatars)
DROP POLICY IF EXISTS "author-avatars public read"  ON storage.objects;
DROP POLICY IF EXISTS "author-avatars anon upload"  ON storage.objects;
DROP POLICY IF EXISTS "author-avatars anon update"  ON storage.objects;
DROP POLICY IF EXISTS "author-avatars anon delete"  ON storage.objects;

CREATE POLICY "author-avatars public read"  ON storage.objects FOR SELECT TO public USING (bucket_id = 'author-avatars');
CREATE POLICY "author-avatars anon upload"  ON storage.objects FOR INSERT TO anon   WITH CHECK (bucket_id = 'author-avatars');
CREATE POLICY "author-avatars anon update"  ON storage.objects FOR UPDATE TO anon   USING (bucket_id = 'author-avatars');
CREATE POLICY "author-avatars anon delete"  ON storage.objects FOR DELETE TO anon   USING (bucket_id = 'author-avatars');

-- STORAGE BUCKET (ảnh bìa tác phẩm)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-covers',
  'work-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies (work-covers)
DROP POLICY IF EXISTS "work-covers public read"  ON storage.objects;
DROP POLICY IF EXISTS "work-covers anon upload"  ON storage.objects;
DROP POLICY IF EXISTS "work-covers anon update"  ON storage.objects;
DROP POLICY IF EXISTS "work-covers anon delete"  ON storage.objects;

CREATE POLICY "work-covers public read"  ON storage.objects FOR SELECT TO public USING (bucket_id = 'work-covers');
CREATE POLICY "work-covers anon upload"  ON storage.objects FOR INSERT TO anon   WITH CHECK (bucket_id = 'work-covers');
CREATE POLICY "work-covers anon update"  ON storage.objects FOR UPDATE TO anon   USING (bucket_id = 'work-covers');
CREATE POLICY "work-covers anon delete"  ON storage.objects FOR DELETE TO anon   USING (bucket_id = 'work-covers');
