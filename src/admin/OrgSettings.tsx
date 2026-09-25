import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, logActivity } from './utils';

type OrgSettings = Record<string, string>;

const FIELDS: { key: string; label: string; type?: string; section: string }[] = [
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

export default function OrgSettings() {
  const [settings, setSettings] = useState<OrgSettings>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase!.from('organization_settings').select('key, value').then(({ data }) => {
      const map: OrgSettings = {};
      (data ?? []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      setSettings(map);
    });
  }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value, is_public: true, updated_at: new Date().toISOString() }));
    const { error } = await supabase!.from('organization_settings').upsert(upserts, { onConflict: 'key' });
    if (error) { toast('error', error.message); } else {
      toast('success', 'Organization settings saved.');
      await logActivity('Updated organization settings', 'org_settings');
    }
    setSaving(false);
  }

  const sections = [...new Set(FIELDS.map((f) => f.section))];

  return (
    <AdminLayout title="Organization Settings">
      <div className="page-header">
        <div><h1>Organization Settings</h1><p>Manage public organization information</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {sections.map((section) => (
          <div className="a-card" key={section}>
            <div className="section-title">{section}</div>
            <div className="a-form">
              <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {FIELDS.filter((f) => f.section === section).map((field) => (
                  <div className="a-field" key={field.key} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                    <label>{field.label}</label>
                    {field.type === 'textarea'
                      ? <textarea rows={3} value={settings[field.key] ?? ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} />
                      : <input value={settings[field.key] ?? ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} />
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
