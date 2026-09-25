/*
# Create Rajmudra public content

1. New Tables
- `public_events` stores public event cards and detail content, including dates, locations, categories, imagery, highlights, and publish state.
- `organization_settings` stores public organization profile values that may be managed later without changing the website.
- `contact_messages` stores messages submitted through the public contact form.
2. Security
- Row level security is enabled on every table.
- Public visitors can read published events and the public organization profile.
- Contact submissions are insert-only for the public role and cannot be read or modified by it.
3. Important Notes
- The tables are single-tenant public content tables because this site does not include a sign-in screen.
- Sample content is intentionally limited to public, non-sensitive information.
*/

CREATE TABLE IF NOT EXISTS public_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  event_date date NOT NULL,
  end_date date,
  location text NOT NULL,
  image_url text NOT NULL,
  highlights text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published events" ON public_events;
CREATE POLICY "Public can read published events" ON public_events FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Public can insert events" ON public_events;
CREATE POLICY "Public can insert events" ON public_events FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "Public can update events" ON public_events;
CREATE POLICY "Public can update events" ON public_events FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Public can delete events" ON public_events;
CREATE POLICY "Public can delete events" ON public_events FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Public can read public settings" ON organization_settings;
CREATE POLICY "Public can read public settings" ON organization_settings FOR SELECT TO anon, authenticated USING (is_public = true);
DROP POLICY IF EXISTS "Public can insert settings" ON organization_settings;
CREATE POLICY "Public can insert settings" ON organization_settings FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "Public can update settings" ON organization_settings;
CREATE POLICY "Public can update settings" ON organization_settings FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Public can delete settings" ON organization_settings;
CREATE POLICY "Public can delete settings" ON organization_settings FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Visitors can submit contact messages" ON contact_messages;
CREATE POLICY "Visitors can submit contact messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (char_length(name) BETWEEN 2 AND 120 AND char_length(phone) BETWEEN 7 AND 30 AND char_length(email) BETWEEN 5 AND 254 AND char_length(message) BETWEEN 5 AND 3000);
DROP POLICY IF EXISTS "Visitors cannot read contact messages" ON contact_messages;
CREATE POLICY "Visitors cannot read contact messages" ON contact_messages FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "Visitors cannot update contact messages" ON contact_messages;
CREATE POLICY "Visitors cannot update contact messages" ON contact_messages FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Visitors cannot delete contact messages" ON contact_messages;
CREATE POLICY "Visitors cannot delete contact messages" ON contact_messages FOR DELETE TO anon, authenticated USING (false);

INSERT INTO public_events (slug, title, description, category, event_date, location, image_url, highlights)
VALUES
('shiv-janmotsav-2026', 'छत्रपती शिवाजी महाराज जन्मोत्सव', 'कला, क्रीडा, ज्ञान आणि संस्कृतीचा उत्सव — सर्व वयोगटांसाठी स्पर्धा आणि समुदाय सोहळा.', 'Cultural', '2026-03-19', 'स्थानिक क्रीडांगण, महाराष्ट्र', 'https://images.pexels.com/photos/14546937/pexels-photo-14546937.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['चित्रकला आणि भाषण', 'बुद्धिबळ व क्रीडा स्पर्धा', 'पारितोषिक वितरण सोहळा']),
('education-kit-2026', 'विद्यार्थी शैक्षणिक साहित्य वाटप', 'विद्यार्थ्यांना शाळेच्या नव्या वर्षासाठी आवश्यक साहित्य आणि प्रोत्साहन देण्याचा उपक्रम.', 'Educational', '2026-06-14', 'महाराष्ट्र', 'https://images.pexels.com/photos/35558791/pexels-photo-35558791.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['School kits', 'पुस्तके आणि पेन', 'पालक संवाद']),
('community-sports-2026', 'युवा क्रीडा महोत्सव', 'युवकांना संघभावना, शिस्त आणि निरोगी जीवनशैलीकडे प्रेरित करणाऱ्या स्पर्धा.', 'Sports', '2026-08-09', 'समुदाय क्रीडांगण', 'https://images.pexels.com/photos/27907317/pexels-photo-27907317.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', ARRAY['क्रिकेट', 'व्हॉलीबॉल', 'रस्सीखेच'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO organization_settings (key, value)
VALUES
('foundation_year', '2015'),
('member_count', '50+'),
('family_count', '1000+'),
('activity_count', '100+'),
('registration_number', 'लवकरच उपलब्ध'),
('address', 'महाराष्ट्र, भारत'),
('phone', 'अधिकृत क्रमांक लवकरच उपलब्ध'),
('email', 'अधिकृत ईमेल लवकरच उपलब्ध')
ON CONFLICT (key) DO NOTHING;