import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm, logActivity, usePagination } from './utils';

type Member = {
  id: string; full_name: string; display_name: string; profile_image_url: string;
  position: string; occupation: string; joining_year: number;
  is_featured: boolean; is_published: boolean; display_order: number;
  mobile: string; whatsapp: string; email: string; address: string; internal_notes: string;
};
const empty: Omit<Member, 'id'> = { full_name: '', display_name: '', profile_image_url: '', position: '', occupation: '', joining_year: new Date().getFullYear(), is_featured: false, is_published: true, display_order: 0, mobile: '', whatsapp: '', email: '', address: '', internal_notes: '' };

export default function Team() {
  const [items, setItems] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Partial<Member> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { page, setPage, totalPages, from, to } = usePagination(total, 20);

  async function load() {
    let q = supabase!.from('team_members').select('*', { count: 'exact' }).order('display_order').range(from, to);
    if (query) q = q.ilike('full_name', `%${query}%`);
    const { data, count } = await q;
    setItems((data ?? []) as Member[]); setTotal(count ?? 0);
  }
  useEffect(() => { load(); }, [page, query]);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Member;
    const { error } = id
      ? await supabase!.from('team_members').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('team_members').insert(rest);
    if (error) { toast('error', error.message); } else {
      toast('success', id ? 'Member updated.' : 'Member added.');
      await logActivity(id ? 'Updated team member' : 'Added team member', 'team_member', id, { name: rest.full_name });
      setModal(null); load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete member?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('team_members').delete().eq('id', id);
    toast('success', 'Member deleted.'); load();
  }

  async function toggle(id: string, field: 'is_published' | 'is_featured', val: boolean) {
    await supabase!.from('team_members').update({ [field]: !val }).eq('id', id); load();
  }

  return (
    <AdminLayout title="Team Members">
      <div className="page-header">
        <div><h1>Team Members</h1><p>{total} members</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Member</button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap"><Search size={15} /><input placeholder="Search members…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} style={{ padding: '8px 8px 8px 34px', border: '1px solid #e2e8f0', borderRadius: 6, width: '100%' }} /></div>
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><X size={32} /><p>No members found.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Year</th><th>Published</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td>{m.profile_image_url && <img src={m.profile_image_url} alt={m.display_name} />}</td>
                    <td><strong>{m.display_name}</strong><br /><span style={{ fontSize: 11, color: '#64748b' }}>{m.occupation}</span></td>
                    <td>{m.position}</td>
                    <td>{m.joining_year}</td>
                    <td><label className="toggle"><input type="checkbox" checked={m.is_published} onChange={() => toggle(m.id, 'is_published', m.is_published)} /><span className="toggle-slider" /></label></td>
                    <td><label className="toggle"><input type="checkbox" checked={m.is_featured} onChange={() => toggle(m.id, 'is_featured', m.is_featured)} /><span className="toggle-slider" /></label></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => setModal(m)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => remove(m.id)}><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{(modal as Member).id ? 'Edit Member' : 'Add Member'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="section-title">Public Information</div>
                <div className="form-row">
                  <div className="a-field"><label>Full Name *</label><input value={modal.full_name ?? ''} onChange={(e) => setModal({ ...modal, full_name: e.target.value, display_name: modal.display_name || e.target.value })} /></div>
                  <div className="a-field"><label>Display Name *</label><input value={modal.display_name ?? ''} onChange={(e) => setModal({ ...modal, display_name: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Position *</label><input value={modal.position ?? ''} onChange={(e) => setModal({ ...modal, position: e.target.value })} /></div>
                  <div className="a-field"><label>Occupation</label><input value={modal.occupation ?? ''} onChange={(e) => setModal({ ...modal, occupation: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Joining Year</label><input type="number" value={modal.joining_year ?? ''} onChange={(e) => setModal({ ...modal, joining_year: +e.target.value })} /></div>
                  <div className="a-field"><label>Profile Image URL</label><input value={modal.profile_image_url ?? ''} onChange={(e) => setModal({ ...modal, profile_image_url: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="a-field"><label>Published</label>
                    <select value={modal.is_published ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_published: e.target.value === 'true' })}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                  <div className="a-field"><label>Featured (Homepage)</label>
                    <select value={modal.is_featured ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_featured: e.target.value === 'true' })}>
                      <option value="false">No</option><option value="true">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="private-section">
                  <div className="private-section-label"><Lock size={13} />Private Information — Never shown publicly</div>
                  <div className="a-form">
                    <div className="form-row">
                      <div className="a-field"><label>Mobile</label><input value={modal.mobile ?? ''} onChange={(e) => setModal({ ...modal, mobile: e.target.value })} /></div>
                      <div className="a-field"><label>WhatsApp</label><input value={modal.whatsapp ?? ''} onChange={(e) => setModal({ ...modal, whatsapp: e.target.value })} /></div>
                    </div>
                    <div className="a-field"><label>Email</label><input type="email" value={modal.email ?? ''} onChange={(e) => setModal({ ...modal, email: e.target.value })} /></div>
                    <div className="a-field"><label>Address</label><textarea rows={2} value={modal.address ?? ''} onChange={(e) => setModal({ ...modal, address: e.target.value })} /></div>
                    <div className="a-field"><label>Internal Notes</label><textarea rows={2} value={modal.internal_notes ?? ''} onChange={(e) => setModal({ ...modal, internal_notes: e.target.value })} /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.full_name || !modal.position}>{saving ? 'Saving…' : 'Save Member'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
