import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm, logActivity } from './utils';

type Ann = { id: string; title: string; description: string; image_url: string; cta_text: string; cta_url: string; start_date: string; end_date: string; status: boolean; display_order: number };
const empty: Omit<Ann, 'id'> = { title: '', description: '', image_url: '', cta_text: '', cta_url: '', start_date: '', end_date: '', status: true, display_order: 0 };

export default function Announcements() {
  const [items, setItems] = useState<Ann[]>([]);
  const [modal, setModal] = useState<Partial<Ann> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const { data } = await supabase!.from('announcements').select('*').order('display_order');
    setItems((data ?? []) as Ann[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Ann;
    const payload = { ...rest, start_date: rest.start_date || null, end_date: rest.end_date || null };
    const { error } = id
      ? await supabase!.from('announcements').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('announcements').insert(payload);
    if (error) { toast('error', error.message); } else {
      toast('success', id ? 'Announcement updated.' : 'Announcement created.');
      await logActivity(id ? 'Updated announcement' : 'Created announcement', 'announcement', id);
      setModal(null); load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete announcement?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('announcements').delete().eq('id', id);
    toast('success', 'Deleted.'); load();
  }

  async function toggleStatus(item: Ann) {
    await supabase!.from('announcements').update({ status: !item.status }).eq('id', item.id);
    load();
  }

  return (
    <AdminLayout title="Announcements">
      <div className="page-header">
        <div><h1>Announcements</h1><p>Manage public announcements</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Announcement</button>
      </div>
      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><X size={32} /><p>No announcements yet.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Title</th><th>Start</th><th>End</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td style={{ fontSize: 12 }}>{item.start_date || '—'}</td>
                    <td style={{ fontSize: 12 }}>{item.end_date || '—'}</td>
                    <td><label className="toggle"><input type="checkbox" checked={item.status} onChange={() => toggleStatus(item)} /><span className="toggle-slider" /></label></td>
                    <td>{item.display_order}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => setModal(item)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{(modal as Ann).id ? 'Edit Announcement' : 'Add Announcement'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="a-field"><label>Title *</label><input value={modal.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></div>
                <div className="a-field"><label>Description</label><textarea value={modal.description ?? ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></div>
                <div className="a-field"><label>Image URL</label><input value={modal.image_url ?? ''} onChange={(e) => setModal({ ...modal, image_url: e.target.value })} /></div>
                <div className="form-row">
                  <div className="a-field"><label>CTA Text</label><input value={modal.cta_text ?? ''} onChange={(e) => setModal({ ...modal, cta_text: e.target.value })} /></div>
                  <div className="a-field"><label>CTA URL</label><input value={modal.cta_url ?? ''} onChange={(e) => setModal({ ...modal, cta_url: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Start Date</label><input type="date" value={modal.start_date ?? ''} onChange={(e) => setModal({ ...modal, start_date: e.target.value })} /></div>
                  <div className="a-field"><label>End Date</label><input type="date" value={modal.end_date ?? ''} onChange={(e) => setModal({ ...modal, end_date: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Display Order</label><input type="number" value={modal.display_order ?? 0} onChange={(e) => setModal({ ...modal, display_order: +e.target.value })} /></div>
                  <div className="a-field"><label>Status</label>
                    <select value={modal.status ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, status: e.target.value === 'true' })}>
                      <option value="true">Active</option><option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.title}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
