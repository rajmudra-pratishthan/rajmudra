import { useEffect, useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm, logActivity } from './utils';

type DonationSettings = { id?: string; page_title: string; page_description: string; upi_id: string; upi_display_name: string; qr_code_url: string; bank_name: string; account_holder: string; account_number: string; ifsc: string; branch: string; instructions: string };
const empty: DonationSettings = { page_title: '', page_description: '', upi_id: '', upi_display_name: '', qr_code_url: '', bank_name: '', account_holder: '', account_number: '', ifsc: '', branch: '', instructions: '' };

export default function DonationSettings() {
  const [form, setForm] = useState<DonationSettings>(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    supabase!.from('donation_settings').select('*').limit(1).single().then(({ data }) => {
      if (data) setForm(data as DonationSettings);
    });
  }, []);

  async function save() {
    const ok = await confirm({ title: 'Save donation settings?', message: 'Please verify all payment details are correct before saving. These will be visible to the public.' });
    if (!ok) return;
    setSaving(true);
    const { id, ...rest } = form;
    const { error } = id
      ? await supabase!.from('donation_settings').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('donation_settings').insert(rest);
    if (error) { toast('error', error.message); } else {
      toast('success', 'Donation settings saved.');
      await logActivity('Updated donation settings', 'donation_settings');
    }
    setSaving(false);
  }

  const f = (key: keyof DonationSettings) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <AdminLayout title="Donation Settings">
      <div className="page-header">
        <div><h1>Donation Settings</h1><p>Public donation receiving details</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: '#92400e' }}>Only enter public donation receiving details here. Never store bank login credentials, OTPs, payment gateway secrets, or admin passwords.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        <div className="a-card">
          <div className="section-title">Page Content</div>
          <div className="a-form">
            <div className="a-field"><label>Page Title</label><input {...f('page_title')} /></div>
            <div className="a-field"><label>Description</label><textarea rows={3} {...f('page_description')} /></div>
            <div className="a-field"><label>Instructions</label><textarea rows={3} {...f('instructions')} /></div>
          </div>
        </div>

        <div className="a-card">
          <div className="section-title">UPI Details</div>
          <div className="a-form">
            <div className="a-field"><label>UPI ID</label><input {...f('upi_id')} placeholder="name@upi" /></div>
            <div className="a-field"><label>UPI Display Name</label><input {...f('upi_display_name')} /></div>
            <div className="a-field"><label>QR Code Image URL</label><input {...f('qr_code_url')} placeholder="https://..." /></div>
            {form.qr_code_url && <img src={form.qr_code_url} alt="QR Code" style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 8 }} />}
          </div>
        </div>

        <div className="a-card">
          <div className="section-title">Bank Details</div>
          <div className="a-form">
            <div className="a-field"><label>Bank Name</label><input {...f('bank_name')} /></div>
            <div className="a-field"><label>Account Holder</label><input {...f('account_holder')} /></div>
            <div className="a-field"><label>Account Number</label><input {...f('account_number')} /></div>
            <div className="form-row">
              <div className="a-field"><label>IFSC Code</label><input {...f('ifsc')} /></div>
              <div className="a-field"><label>Branch</label><input {...f('branch')} /></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
