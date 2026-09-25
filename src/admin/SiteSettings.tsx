import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, logActivity } from './utils';

type SiteSettings = Record<string, string>;

const SETTINGS: { key: string; label: string; description: string; type: 'toggle' | 'number' }[] = [
  { key: 'hero_autoplay', label: 'Hero Autoplay', description: 'Automatically cycle through hero banner slides', type: 'toggle' },
  { key: 'hero_transition_speed', label: 'Hero Transition Speed (ms)', description: 'Time between slide transitions in milliseconds', type: 'number' },
  { key: 'show_instagram_section', label: 'Show Instagram Section', description: 'Display the Instagram reels section on homepage', type: 'toggle' },
  { key: 'show_testimonials', label: 'Show Testimonials', description: 'Display testimonials section on homepage', type: 'toggle' },
  { key: 'comments_enabled', label: 'Comments Enabled', description: 'Allow visitors to comment on events (global default)', type: 'toggle' },
  { key: 'likes_enabled', label: 'Likes Enabled', description: 'Allow visitors to like events (global default)', type: 'toggle' },
  { key: 'donate_cta_enabled', label: 'Donate CTA Enabled', description: 'Show the donation call-to-action section', type: 'toggle' },
];

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase!.from('site_settings').select('key, value').then(({ data }) => {
      const map: SiteSettings = {};
      (data ?? []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      setSettings(map);
    });
  }, []);

  async function save() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase!.from('site_settings').upsert(upserts, { onConflict: 'key' });
    if (error) { toast('error', error.message); } else {
      toast('success', 'Site settings saved.');
      await logActivity('Updated site settings', 'site_settings');
    }
    setSaving(false);
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="page-header">
        <div><h1>Site Settings</h1><p>Control homepage features and behavior</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      <div className="a-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {SETTINGS.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < SETTINGS.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <div>
                <strong style={{ fontSize: 14 }}>{s.label}</strong>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.description}</p>
              </div>
              {s.type === 'toggle' ? (
                <label className="toggle">
                  <input type="checkbox" checked={settings[s.key] === 'true'} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.checked ? 'true' : 'false' })} />
                  <span className="toggle-slider" />
                </label>
              ) : (
                <input type="number" value={settings[s.key] ?? ''} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} style={{ width: 100, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
