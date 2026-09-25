import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type Doc = { id: string; event_id: string; title: string; document_type: string; file_url: string; is_published: boolean; display_order: number };
const DOC_TYPES = ['Police Permission', 'Ground Permission', 'Rule Book', 'Official Notice', 'Other'];
const empty: Omit<Doc, 'id'> = { event_id: '', title: '', document_type: 'Other', file_url: '', is_published: true, display_order: 0 };

function navigate(to: string) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }

export default function EventDocuments() {
  const eventId = window.location.pathname.split('/')[3];
  const [items, setItems] = useState<Doc[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [modal, setModal] = useState<Partial<Doc> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const [{ data: ev }, { data: docs }] = await Promise.all([
      supabase!.from('events').select('title').eq('id', eventId).single(),
      supabase!.from('event_documents').select('*').eq('event_id', eventId).order('display_order'),
    ]);
    setEventTitle(ev?.title ?? '');
    setItems((docs ?? []) as Doc[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Doc;
    const payload = { ...rest, event_id: eventId };
    const { error } = id
      ? await supabase!.from('event_documents').update(payload).eq('id', id)
      : await supabase!.from('event_documents').insert(payload);
    if (error) { toast('error', error.message); } else { toast('success', id ? 'Document updated.' : 'Document added.'); setModal(null); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete document?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('event_documents').delete().eq('id', id);
    toast('success', 'Deleted.'); load();
  }

  return (
    <AdminLayout title="Event Documents">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')} style={{ marginBottom: 8 }}><ArrowLeft size={14} />Back to Events</button>
          <h1>Documents — {eventTitle}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ ...empty })}><Plus size={15} />Add Document</button>
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><X size={32} /><p>No documents yet.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Title</th><th>Type</th><th>File URL</th><th>Published</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.title}</strong></td>
                    <td><span className="badge badge-blue">{doc.document_type}</span></td>
                    <td><a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3b82f6' }}>View PDF</a></td>
                    <td><label className="toggle"><input type="checkbox" checked={doc.is_published} onChange={async () => { await supabase!.from('event_documents').update({ is_published: !doc.is_published }).eq('id', doc.id); load(); }} /><span className="toggle-slider" /></label></td>
                    <td>{doc.display_order}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => setModal(doc)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => remove(doc.id)}><Trash2 size={14} /></button>
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
              <h3>{(modal as Doc).id ? 'Edit Document' : 'Add Document'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="a-field"><label>Title *</label><input value={modal.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></div>
                <div className="a-field"><label>Document Type</label>
                  <select value={modal.document_type ?? 'Other'} onChange={(e) => setModal({ ...modal, document_type: e.target.value })}>
                    {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="a-field"><label>File URL (PDF)</label><input value={modal.file_url ?? ''} onChange={(e) => setModal({ ...modal, file_url: e.target.value })} placeholder="https://..." /></div>
                <div className="form-row">
                  <div className="a-field"><label>Display Order</label><input type="number" value={modal.display_order ?? 0} onChange={(e) => setModal({ ...modal, display_order: +e.target.value })} /></div>
                  <div className="a-field"><label>Published</label>
                    <select value={modal.is_published ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_published: e.target.value === 'true' })}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.title || !modal.file_url}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
