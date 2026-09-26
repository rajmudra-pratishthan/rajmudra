import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, logActivity } from './utils';

type SettingsMap = Record<string, string>;

const ORG_FIELDS: { key: string; label: string; type?: string; section: string }[] = [
  { key: 'org_name_marathi', label: 'Organization Name (Marathi)', section: 'Identity' },
  { key: 'org_name_english', label: 'Organization Name (English)', section: 'Identity' },
  { key: 'logo_url', label: 'Logo URL', section: 'Identity' },
  { key: 'registration_number', label: 'Registration Number', section: 'Identity' },
  { key: 'foundation_year', label: 'Foundation Year', section: 'Identity' },
  { key: 'description', label: 'Description', type: 'textarea', section: 'Identity' },
  { key: 'mission', label: 'Mission', type: 'textarea', section: 'Identity' },
  { key: 'vision', label: 'Vision', type: 'textarea', section: 'Identity' },
  { key: 'address', label: 'Address', section: 'Contact' },
  { key: 'phone', label: 'Phone', section: 'Contact' },
  { key: 'whatsapp', label: 'WhatsApp', section: 'Contact' },
  { key: 'email', label: 'Email', section: 'Contact' },
  { key: 'instagram', label: 'Instagram URL', section: 'Social' },
  { key: 'facebook', label: 'Facebook URL', section: 'Social' },
  { key: 'youtube', label: 'YouTube URL', section: 'Social' },
  { key: 'google_maps_url', label: 'Google Maps URL', section: 'Social' },
  { key: 'stat_years', label: 'Years of Service', section: 'Impact Stats' },
  { key: 'member_count', label: 'Members', section: 'Impact Stats' },
  { key: 'activity_count', label: 'Activities', section: 'Impact Stats' },
  { key: 'family_count', label: 'Families Reached', section: 'Impact Stats' },
];

const SITE_TOGGLES: { key: string; label: string; description: string; type: 'toggle' | 'number' }[] = [
  { key: 'hero_autoplay', label: 'Hero Autoplay', description: 'Automatically cycle through hero banner slides', type: 'toggle' },
  { key: 'hero_transition_speed', label: 'Hero Transition Speed (ms)', description: 'Time between slide transitions in milliseconds', type: 'number' },
  { key: 'show_instagram_section', label: 'Show Instagram Section', description: 'Display the Instagram reels section on homepage', type: 'toggle' },
  { key: 'show_testimonials', label: 'Show Testimonials', description: 'Display testimonials section on homepage', type: 'toggle' },
  { key: 'comments_enabled', label: 'Comments Enabled', description: 'Allow visitors to comment on events (global default)', type: 'toggle' },
  { key: 'likes_enabled', label: 'Likes Enabled', description: 'Allow visitors to like events (global default)', type: 'toggle' },
  { key: 'donate_cta_enabled', label: 'Donate CTA Enabled', description: 'Show the donation call-to-action section', type: 'toggle' },
];

export default function SiteSettings() {
  const [orgSettings, setOrgSettings] = useState<SettingsMap>({});
  const [siteSettings, setSiteSettings] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase!.from('organization_settings').select('key, value').then(({ data }) => {
      const map: SettingsMap = {};
      (data ?? []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      setOrgSettings(map);
    });
    supabase!.from('site_settings').select('key, value').then(({ data }) => {
      const map: SettingsMap = {};
      (data ?? []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      setSiteSettings(map);
    });
  }, []);

  async function save() {
    setSaving(true);
    const orgUpserts = Object.entries(orgSettings).map(([key, value]) => ({ key, value, is_public: true, updated_at: new Date().toISOString() }));
    const siteUpserts = Object.entries(siteSettings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));

    const [orgRes, siteRes] = await Promise.all([
      supabase!.from('organization_settings').upsert(orgUpserts, { onConflict: 'key' }),
      supabase!.from('site_settings').upsert(siteUpserts, { onConflict: 'key' }),
    ]);

    if (orgRes.error || siteRes.error) {
      toast('error', orgRes.error?.message ?? siteRes.error?.message ?? 'Failed to save');
    } else {
      toast('success', 'Settings saved.');
      await logActivity('Updated site & organization settings', 'site_settings');
    }
    setSaving(false);
  }

  const orgSections = [...new Set(ORG_FIELDS.map((f) => f.section))];

  return (
    <AdminLayout title="Site & Organization">
      <div className="page-header">
        <div><h1>Site & Organization</h1><p>Manage organization info and site behavior</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save All Settings'}</button>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {orgSections.map((section) => (
          <div className="a-card" key={section}>
            <div className="section-title">{section}</div>
            <div className="a-form">
              <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {ORG_FIELDS.filter((f) => f.section === section).map((field) => (
                  <div className="a-field" key={field.key} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                    <label>{field.label}</label>
                    {field.type === 'textarea'
                      ? <textarea rows={3} value={orgSettings[field.key] ?? ''} onChange={(e) => setOrgSettings({ ...orgSettings, [field.key]: e.target.value })} />
                      : <input value={orgSettings[field.key] ?? ''} onChange={(e) => setOrgSettings({ ...orgSettings, [field.key]: e.target.value })} />
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="a-card">
          <div className="section-title">Site Behavior</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {SITE_TOGGLES.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < SITE_TOGGLES.length - 1 ? '1px solid #ede5d8' : 'none' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{s.label}</strong>
                  <p style={{ fontSize: 12, color: '#6f675f', marginTop: 2 }}>{s.description}</p>
                </div>
                {s.type === 'toggle' ? (
                  <label className="toggle">
                    <input type="checkbox" checked={siteSettings[s.key] === 'true'} onChange={(e) => setSiteSettings({ ...siteSettings, [s.key]: e.target.checked ? 'true' : 'false' })} />
                    <span className="toggle-slider" />
                  </label>
                ) : (
                  <input type="number" value={siteSettings[s.key] ?? ''} onChange={(e) => setSiteSettings({ ...siteSettings, [s.key]: e.target.value })} style={{ width: 100, padding: '6px 10px', border: '1px solid #ede5d8', borderRadius: 6, fontSize: 14 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
