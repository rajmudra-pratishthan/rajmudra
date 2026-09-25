import { useEffect, useState } from 'react';
import { Trash2, CheckCircle, EyeOff, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type Comment = { id: string; event_id: string; name: string; comment: string; status: string; created_at: string; event_title?: string };
type Status = 'pending' | 'approved' | 'hidden' | 'spam';

export default function Comments() {
  const [items, setItems] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<Status>('pending');
  const [counts, setCounts] = useState<Record<Status, number>>({ pending: 0, approved: 0, hidden: 0, spam: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const [{ data }, ...countResults] = await Promise.all([
      supabase!.from('event_comments').select('*, events(title)').eq('status', activeTab).order('created_at', { ascending: false }),
      ...(['pending', 'approved', 'hidden', 'spam'] as Status[]).map((s) => supabase!.from('event_comments').select('id', { count: 'exact' }).eq('status', s)),
    ]);
    const mapped = (data ?? []).map((c: any) => ({ ...c, event_title: c.events?.title })) as Comment[];
    setItems(mapped);
    setSelected(new Set());
    const [p, a, h, sp] = countResults;
    setCounts({ pending: p.count ?? 0, approved: a.count ?? 0, hidden: h.count ?? 0, spam: sp.count ?? 0 });
  }
  useEffect(() => { load(); }, [activeTab]);

  async function setStatus(id: string, status: Status) {
    await supabase!.from('event_comments').update({ status }).eq('id', id);
    toast('success', `Comment marked as ${status}.`); load();
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete comment?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('event_comments').delete().eq('id', id);
    toast('success', 'Deleted.'); load();
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!await confirm({ title: `Delete ${selected.size} comments?`, message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('event_comments').delete().in('id', [...selected]);
    toast('success', `${selected.size} comments deleted.`); load();
  }

  const tabs: { label: string; value: Status }[] = [
    { label: `Pending (${counts.pending})`, value: 'pending' },
    { label: `Approved (${counts.approved})`, value: 'approved' },
    { label: `Hidden (${counts.hidden})`, value: 'hidden' },
    { label: `Spam (${counts.spam})`, value: 'spam' },
  ];

  return (
    <AdminLayout title="Comments">
      <div className="page-header">
        <div><h1>Comments</h1><p>Moderate event comments</p></div>
        {selected.size > 0 && <button className="btn btn-danger" onClick={bulkDelete}><Trash2 size={14} />Delete Selected ({selected.size})</button>}
      </div>

      <div className="a-tabs">
        {tabs.map((t) => <button key={t.value} className={`a-tab ${activeTab === t.value ? 'active' : ''}`} onClick={() => setActiveTab(t.value)}>{t.label}</button>)}
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><MessageSquare size={32} /><p>No {activeTab} comments.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr>
                <th><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())} /></th>
                <th>Event</th><th>Name</th><th>Comment</th><th>Date</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td><input type="checkbox" checked={selected.has(c.id)} onChange={(e) => { const s = new Set(selected); e.target.checked ? s.add(c.id) : s.delete(c.id); setSelected(s); }} /></td>
                    <td style={{ fontSize: 12 }}>{c.event_title ?? '—'}</td>
                    <td><strong>{c.name}</strong></td>
                    <td style={{ maxWidth: 280, fontSize: 13 }}>{c.comment}</td>
                    <td style={{ fontSize: 11, color: '#6f675f' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {activeTab !== 'approved' && <button className="btn-icon" title="Approve" onClick={() => setStatus(c.id, 'approved')}><CheckCircle size={14} style={{ color: '#2d8a4f' }} /></button>}
                        {activeTab !== 'hidden' && <button className="btn-icon" title="Hide" onClick={() => setStatus(c.id, 'hidden')}><EyeOff size={14} /></button>}
                        {activeTab !== 'spam' && <button className="btn-icon" title="Spam" onClick={() => setStatus(c.id, 'spam')}><AlertTriangle size={14} style={{ color: '#d97706' }} /></button>}
                        <button className="btn-icon danger" onClick={() => remove(c.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
