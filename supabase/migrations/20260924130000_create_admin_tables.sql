/*
# Admin tables for Rajmudra Pratishthan
Creates all admin-managed content tables, extends existing public tables,
and sets up RLS so only authenticated admins can write.
*/

-- ─── BANNERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  cta_text text,
  cta_url text,
  status boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cta_text text,
  cta_url text,
  start_date date,
  end_date date,
  status boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── EVENTS (full schema, replaces public_events for admin) ─────────────────
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Social',
  start_date date NOT NULL,
  end_date date,
  location text NOT NULL,
  image_url text,
  short_description text,
  full_description text,
  highlights text[] NOT NULL DEFAULT '{}',
  thanks_to text,
  special_thanks_to text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  status_override text CHECK (status_override IN ('upcoming','ongoing','past',NULL)),
  likes_enabled boolean NOT NULL DEFAULT true,
  comments_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── EVENT GALLERY ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── EVENT DOCUMENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'Other',
  file_url text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── EVENT LIKES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, fingerprint)
);

-- ─── EVENT COMMENTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden','spam')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── TEAM MEMBERS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  display_name text NOT NULL,
  profile_image_url text,
  position text NOT NULL,
  occupation text,
  joining_year integer,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  -- private fields
  mobile text,
  whatsapp text,
  email text,
  address text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── TESTIMONIALS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  designation text,
  organization text,
  message text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  testimonial_date date,
  is_featured boolean NOT NULL DEFAULT false,
  status boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── INSTAGRAM REELS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instagram_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_url text NOT NULL,
  title text,
  description text,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── DONATION SETTINGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text,
  page_description text,
  upi_id text,
  upi_display_name text,
  qr_code_url text,
  bank_name text,
  account_holder text,
  account_number text,
  ifsc text,
  branch text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── SITE SETTINGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── ADMIN ACTIVITY LOGS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── CONTACT MESSAGES: add status column ────────────────────────────────────
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','resolved'));

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies (published/active only)
CREATE POLICY "Public read banners" ON banners FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT TO anon, authenticated USING (status = true AND (start_date IS NULL OR start_date <= current_date) AND (end_date IS NULL OR end_date >= current_date));
CREATE POLICY "Public read events" ON events FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Public read gallery" ON event_gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read documents" ON event_documents FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Public read team" ON team_members FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "Public read reels" ON instagram_reels FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read donation" ON donation_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

-- Public can like events
CREATE POLICY "Public insert likes" ON event_likes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public read likes" ON event_likes FOR SELECT TO anon, authenticated USING (true);

-- Public can submit comments (pending)
CREATE POLICY "Public insert comments" ON event_comments FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Public read approved comments" ON event_comments FOR SELECT TO anon, authenticated USING (status = 'approved');

-- Admin full access (authenticated users = admins via Supabase Auth)
CREATE POLICY "Admin all banners" ON banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all announcements" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all gallery" ON event_gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all documents" ON event_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all comments" ON event_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all team" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all reels" ON instagram_reels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all donation" ON donation_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all site settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin all logs" ON admin_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin read contact messages" ON contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update contact messages" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete contact messages" ON contact_messages FOR DELETE TO authenticated USING (true);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_autoplay', 'true'),
  ('hero_transition_speed', '5000'),
  ('show_instagram_section', 'true'),
  ('show_testimonials', 'true'),
  ('comments_enabled', 'true'),
  ('likes_enabled', 'true'),
  ('donate_cta_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Seed default donation settings row
INSERT INTO donation_settings (page_title, page_description, instructions)
VALUES ('Support Rajmudra Pratishthan', 'Your donation helps us continue our social, cultural and educational work.', 'Please verify all details before transferring. Contact us if you need assistance.')
ON CONFLICT DO NOTHING;
