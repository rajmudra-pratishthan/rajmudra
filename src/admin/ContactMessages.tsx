import { useEffect, useState } from 'react';
import { Trash2, Mail, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type Message = { id: string; name: string; phone: string; email: string; message: string; status: string; created_at: string };
type Status = 'new' | 'read' | 'resolved';

export default function ContactMessages() {
  const [items, setItems] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<Status>('new');
  const [counts, setCounts] = useState<Record<Status, number>>({ new: 0, read: 0, resolved: 0 });
  const [detail, setDetail] = useState<Message | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const [{ data }, ...countResults] = await Promise.all([
      supabase!.from('contact_messages').select('*').eq('status', activeTab).order('created_at', { ascending: false }),
      ...(['new', 'read', 'resolved'] as Status[]).map((s) => supabase!.from('contact_messages').select('id', { count: 'exact' }).eq('status', s)),
    ]);
    setItems((data ?? []) as Message[]);
    const [n, r, res] = countResults;
    setCounts({ new: n.count ?? 0, read: r.count ?? 0, resolved: res.count ?? 0 });
  }
  useEffect(() => { load(); }, [activeTab]);

  async function setStatus(id: string, status: Status) {
    await supabase!.from('contact_messages').update({ status }).eq('id', id);
    toast('success', `Marked as ${status}.`); load();
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete message?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('contact_messages').delete().eq('id', id);
    toast('success', 'Deleted.'); if (detail?.id === id) setDetail(null); load();
  }

  async function openDetail(msg: Message) {
    setDetail(msg);
    if (msg.status === 'new') { await supabase!.from('contact_messages').update({ status: 'read' }).eq('id', msg.id); load(); }
  }

  const tabs: { label: string; value: Status }[] = [
    { label: `New (${counts.new})`, value: 'new' },
    { label: `Read (${counts.read})`, value: 'read' },
    { label: `Resolved (${counts.resolved})`, value: 'resolved' },
  ];

  return (
    <AdminLayout title="Contact Messages">
      <div className="page-header"><h1>Contact Messages</h1></div>

      <div className="a-tabs">
        {tabs.map((t) => <button key={t.value} className={`a-tab ${activeTab === t.value ? 'active' : ''}`} onClick={() => setActiveTab(t.value)}>{t.label}</button>)}
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><Mail size={32} /><p>No {activeTab} messages.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Name</th><th>Email</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((msg) => (
                  <tr key={msg.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(msg)}>
                    <td><strong>{msg.name}</strong></td>
                    <td style={{ fontSize: 12 }}>{msg.email}</td>
                    <td style={{ fontSize: 11, color: '#6f675f' }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {activeTab !== 'read' && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(msg.id, 'read')}>Mark Read</button>}
                        {activeTab !== 'resolved' && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(msg.id, 'resolved')}>Resolve</button>}
                        <button className="btn-icon danger" onClick={() => remove(msg.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message from {detail.name}</h3>
              <button className="btn-icon" onClick={() => setDetail(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 12 }}>
                <div><strong style={{ fontSize: 11, color: '#6f675f', textTransform: 'uppercase' }}>Name</strong><p>{detail.name}</p></div>
                <div><strong style={{ fontSize: 11, color: '#6f675f', textTransform: 'uppercase' }}>Phone</strong><p>{detail.phone}</p></div>
                <div><strong style={{ fontSize: 11, color: '#6f675f', textTransform: 'uppercase' }}>Email</strong><p>{detail.email}</p></div>
                <div><strong style={{ fontSize: 11, color: '#6f675f', textTransform: 'uppercase' }}>Message</strong><p style={{ whiteSpace: 'pre-wrap' }}>{detail.message}</p></div>
                <div><strong style={{ fontSize: 11, color: '#6f675f', textTransform: 'uppercase' }}>Received</strong><p>{new Date(detail.created_at).toLocaleString()}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              {detail.status !== 'resolved' && <button className="btn btn-primary" onClick={() => { setStatus(detail.id, 'resolved'); setDetail(null); }}>Mark Resolved</button>}
              <button className="btn btn-danger" onClick={() => remove(detail.id)}><Trash2 size={14} />Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
