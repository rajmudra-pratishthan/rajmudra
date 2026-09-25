import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type Testimonial = { id: string; name: string; photo_url: string; designation: string; organization: string; message: string; event_id: string; testimonial_date: string; is_featured: boolean; status: boolean; display_order: number };
const empty: Omit<Testimonial, 'id'> = { name: '', photo_url: '', designation: '', organization: '', message: '', event_id: '', testimonial_date: '', is_featured: false, status: true, display_order: 0 };

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [modal, setModal] = useState<Partial<Testimonial> | null>(null);
  const [preview, setPreview] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const [{ data: t }, { data: ev }] = await Promise.all([
      supabase!.from('testimonials').select('*').order('display_order'),
      supabase!.from('events').select('id, title').eq('is_published', true),
    ]);
    setItems((t ?? []) as Testimonial[]);
    setEvents((ev ?? []) as { id: string; title: string }[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Testimonial;
    const payload = { ...rest, event_id: rest.event_id || null, testimonial_date: rest.testimonial_date || null };
    const { error } = id
      ? await supabase!.from('testimonials').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('testimonials').insert(payload);
    if (error) { toast('error', error.message); } else { toast('success', id ? 'Updated.' : 'Created.'); setModal(null); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete testimonial?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('testimonials').delete().eq('id', id);
    toast('success', 'Deleted.'); load();
  }

  return (
    <AdminLayout title="Testimonials">
      <div className="page-header">
        <div><h1>Testimonials</h1><p>Manage community testimonials</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Testimonial</button>
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><MessageCircle size={32} /><p>No testimonials yet.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Photo</th><th>Name</th><th>Message</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>{t.photo_url && <img src={t.photo_url} alt={t.name} />}</td>
                    <td><strong>{t.name}</strong><br /><span style={{ fontSize: 11, color: '#64748b' }}>{t.designation}{t.organization ? ` · ${t.organization}` : ''}</span></td>
                    <td style={{ maxWidth: 240 }}><span style={{ fontSize: 12, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.message}</span></td>
                    <td><label className="toggle"><input type="checkbox" checked={t.status} onChange={async () => { await supabase!.from('testimonials').update({ status: !t.status }).eq('id', t.id); load(); }} /><span className="toggle-slider" /></label></td>
                    <td><label className="toggle"><input type="checkbox" checked={t.is_featured} onChange={async () => { await supabase!.from('testimonials').update({ is_featured: !t.is_featured }).eq('id', t.id); load(); }} /><span className="toggle-slider" /></label></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" title="Preview" onClick={() => setPreview(t)}><MessageCircle size={14} /></button>
                      <button className="btn-icon" onClick={() => setModal(t)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => remove(t.id)}><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Preview</h3><button className="btn-icon" onClick={() => setPreview(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              {preview.photo_url && <img src={preview.photo_url} alt={preview.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />}
              <p style={{ fontSize: 15, fontStyle: 'italic', color: '#374151', marginBottom: 16 }}>"{preview.message}"</p>
              <strong>{preview.name}</strong>
              <p style={{ fontSize: 12, color: '#64748b' }}>{preview.designation}{preview.organization ? ` · ${preview.organization}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{(modal as Testimonial).id ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="form-row">
                  <div className="a-field"><label>Name *</label><input value={modal.name ?? ''} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></div>
                  <div className="a-field"><label>Photo URL</label><input value={modal.photo_url ?? ''} onChange={(e) => setModal({ ...modal, photo_url: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Designation</label><input value={modal.designation ?? ''} onChange={(e) => setModal({ ...modal, designation: e.target.value })} /></div>
                  <div className="a-field"><label>Organization</label><input value={modal.organization ?? ''} onChange={(e) => setModal({ ...modal, organization: e.target.value })} /></div>
                </div>
                <div className="a-field"><label>Message *</label><textarea rows={4} value={modal.message ?? ''} onChange={(e) => setModal({ ...modal, message: e.target.value })} /></div>
                <div className="form-row">
                  <div className="a-field"><label>Related Event</label>
                    <select value={modal.event_id ?? ''} onChange={(e) => setModal({ ...modal, event_id: e.target.value })}>
                      <option value="">None</option>
                      {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  </div>
                  <div className="a-field"><label>Date</label><input type="date" value={modal.testimonial_date ?? ''} onChange={(e) => setModal({ ...modal, testimonial_date: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Published</label>
                    <select value={modal.status ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, status: e.target.value === 'true' })}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                  <div className="a-field"><label>Featured</label>
                    <select value={modal.is_featured ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_featured: e.target.value === 'true' })}>
                      <option value="false">No</option><option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.name || !modal.message}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
