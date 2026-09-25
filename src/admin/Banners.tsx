import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm, logActivity } from './utils';

type Banner = { id: string; title: string; subtitle: string; description: string; image_url: string; cta_text: string; cta_url: string; status: boolean; display_order: number };
const empty: Omit<Banner, 'id'> = { title: '', subtitle: '', description: '', image_url: '', cta_text: '', cta_url: '', status: true, display_order: 0 };

export default function Banners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [modal, setModal] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const { data } = await supabase!.from('banners').select('*').order('display_order');
    setItems((data ?? []) as Banner[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Banner;
    const op = id
      ? supabase!.from('banners').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
      : supabase!.from('banners').insert(rest);
    const { error } = await op;
    if (error) { toast('error', error.message); } else {
      toast('success', id ? 'Banner updated.' : 'Banner created.');
      await logActivity(id ? 'Updated banner' : 'Created banner', 'banner', id);
      setModal(null); load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete banner?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('banners').delete().eq('id', id);
    toast('success', 'Banner deleted.'); await logActivity('Deleted banner', 'banner', id); load();
  }

  async function toggleStatus(item: Banner) {
    await supabase!.from('banners').update({ status: !item.status }).eq('id', item.id);
    load();
  }

  return (
    <AdminLayout title="Banners">
      <div className="page-header">
        <div><h1>Banners</h1><p>Manage homepage banner slides</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Banner</button>
      </div>

      <div className="a-card">
        {items.length === 0 ? (
          <div className="empty-state"><X size={32} /><p>No banners yet. Add your first banner.</p></div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th></th><th>Image</th><th>Title</th><th>CTA</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><GripVertical size={16} style={{ color: '#cbd5e1', cursor: 'grab' }} /></td>
                    <td>{item.image_url && <img src={item.image_url} alt={item.title} />}</td>
                    <td><strong>{item.title}</strong>{item.subtitle && <><br /><span style={{ fontSize: 12, color: '#64748b' }}>{item.subtitle}</span></>}</td>
                    <td style={{ fontSize: 12 }}>{item.cta_text || '—'}</td>
                    <td>
                      <label className="toggle"><input type="checkbox" checked={item.status} onChange={() => toggleStatus(item)} /><span className="toggle-slider" /></label>
                    </td>
                    <td>{item.display_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => setModal(item)}><Pencil size={14} /></button>
                        <button className="btn-icon danger" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
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
              <h3>{(modal as Banner).id ? 'Edit Banner' : 'Add Banner'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="a-field"><label>Title *</label><input value={modal.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></div>
                <div className="a-field"><label>Subtitle</label><input value={modal.subtitle ?? ''} onChange={(e) => setModal({ ...modal, subtitle: e.target.value })} /></div>
                <div className="a-field"><label>Description</label><textarea value={modal.description ?? ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></div>
                <div className="a-field"><label>Image URL</label><input value={modal.image_url ?? ''} onChange={(e) => setModal({ ...modal, image_url: e.target.value })} placeholder="https://..." /></div>
                <div className="form-row">
                  <div className="a-field"><label>CTA Text</label><input value={modal.cta_text ?? ''} onChange={(e) => setModal({ ...modal, cta_text: e.target.value })} /></div>
                  <div className="a-field"><label>CTA URL</label><input value={modal.cta_url ?? ''} onChange={(e) => setModal({ ...modal, cta_url: e.target.value })} /></div>
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
