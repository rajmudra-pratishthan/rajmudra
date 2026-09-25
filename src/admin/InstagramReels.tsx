import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Instagram } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type Reel = { id: string; reel_url: string; title: string; description: string; thumbnail_url: string; is_active: boolean; display_order: number };
const empty: Omit<Reel, 'id'> = { reel_url: '', title: '', description: '', thumbnail_url: '', is_active: true, display_order: 0 };

export default function InstagramReels() {
  const [items, setItems] = useState<Reel[]>([]);
  const [modal, setModal] = useState<Partial<Reel> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const { data } = await supabase!.from('instagram_reels').select('*').order('display_order');
    setItems((data ?? []) as Reel[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Reel;
    const { error } = id
      ? await supabase!.from('instagram_reels').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('instagram_reels').insert(rest);
    if (error) { toast('error', error.message); } else { toast('success', id ? 'Updated.' : 'Reel added.'); setModal(null); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete reel?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('instagram_reels').delete().eq('id', id);
    toast('success', 'Deleted.'); load();
  }

  return (
    <AdminLayout title="Instagram Reels">
      <div className="page-header">
        <div><h1>Instagram Reels</h1><p>Manage reels shown on the public website</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Reel</button>
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><Instagram size={32} /><p>No reels yet.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Thumbnail</th><th>Title</th><th>URL</th><th>Active</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.thumbnail_url && <img src={r.thumbnail_url} alt={r.title} />}</td>
                    <td><strong>{r.title || '—'}</strong></td>
                    <td><a href={r.reel_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#f26a00', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reel_url}</a></td>
                    <td><label className="toggle"><input type="checkbox" checked={r.is_active} onChange={async () => { await supabase!.from('instagram_reels').update({ is_active: !r.is_active }).eq('id', r.id); load(); }} /><span className="toggle-slider" /></label></td>
                    <td>{r.display_order}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => setModal(r)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
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
              <h3>{(modal as Reel).id ? 'Edit Reel' : 'Add Reel'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="a-field"><label>Instagram Reel URL *</label><input value={modal.reel_url ?? ''} onChange={(e) => setModal({ ...modal, reel_url: e.target.value })} placeholder="https://www.instagram.com/reel/..." /></div>
                <div className="a-field"><label>Title</label><input value={modal.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></div>
                <div className="a-field"><label>Description</label><textarea rows={2} value={modal.description ?? ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></div>
                <div className="a-field"><label>Thumbnail URL</label><input value={modal.thumbnail_url ?? ''} onChange={(e) => setModal({ ...modal, thumbnail_url: e.target.value })} /></div>
                <div className="form-row">
                  <div className="a-field"><label>Display Order</label><input type="number" value={modal.display_order ?? 0} onChange={(e) => setModal({ ...modal, display_order: +e.target.value })} /></div>
                  <div className="a-field"><label>Active</label>
                    <select value={modal.is_active ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_active: e.target.value === 'true' })}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.reel_url}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
