import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Image, FileText, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm, logActivity, usePagination } from './utils';

type Event = {
  id: string; slug: string; title: string; category: string; start_date: string; end_date: string;
  location: string; image_url: string; short_description: string; full_description: string;
  highlights: string[]; thanks_to: string; special_thanks_to: string;
  is_published: boolean; is_featured: boolean; status_override: string;
  likes_enabled: boolean; comments_enabled: boolean; display_order: number;
};
const CATEGORIES = ['Social', 'Cultural', 'Educational', 'Sports', 'Art', 'Festival', 'Community'];
const empty: Omit<Event, 'id'> = { slug: '', title: '', category: 'Social', start_date: '', end_date: '', location: '', image_url: '', short_description: '', full_description: '', highlights: [], thanks_to: '', special_thanks_to: '', is_published: false, is_featured: false, status_override: '', likes_enabled: true, comments_enabled: true, display_order: 0 };

function navigate(to: string) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function computeStatus(ev: Event) {
  if (ev.status_override) return ev.status_override;
  const today = new Date().toISOString().split('T')[0];
  if (ev.start_date > today) return 'upcoming';
  if (ev.end_date && ev.end_date >= today) return 'ongoing';
  return 'past';
}

export default function Events() {
  const [items, setItems] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Partial<Event> | null>(null);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { page, setPage, totalPages, from, to } = usePagination(total, 15);

  async function load() {
    let q = supabase!.from('events').select('*', { count: 'exact' }).order('display_order').range(from, to);
    if (query) q = q.ilike('title', `%${query}%`);
    const { data, count } = await q;
    setItems((data ?? []) as Event[]); setTotal(count ?? 0);
  }
  useEffect(() => { load(); }, [page, query]);

  function openNew() { setModal({ ...empty }); setTab(0); }
  function openEdit(ev: Event) { setModal({ ...ev, highlights: ev.highlights ?? [] }); setTab(0); }

  async function save() {
    if (!modal) return;
    setSaving(true);
    const { id, ...rest } = modal as Event;
    const payload = { ...rest, slug: rest.slug || slugify(rest.title), status_override: rest.status_override || null, end_date: rest.end_date || null };
    const { error } = id
      ? await supabase!.from('events').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase!.from('events').insert(payload);
    if (error) { toast('error', error.message); } else {
      toast('success', id ? 'Event updated.' : 'Event created.');
      await logActivity(id ? 'Updated event' : 'Created event', 'event', id, { title: rest.title });
      setModal(null); load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete event?', message: 'Gallery and documents will also be deleted.', danger: true })) return;
    await supabase!.from('events').delete().eq('id', id);
    toast('success', 'Event deleted.'); await logActivity('Deleted event', 'event', id); load();
  }

  async function toggle(id: string, field: 'is_published' | 'is_featured', val: boolean) {
    await supabase!.from('events').update({ [field]: !val }).eq('id', id); load();
  }

  const statusBadge = (ev: Event) => {
    const s = computeStatus(ev);
    return <span className={`badge ${s === 'upcoming' ? 'badge-blue' : s === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>{s}</span>;
  };

  const tabs = ['Basic Details', 'Date & Location', 'Description', 'Settings'];

  return (
    <AdminLayout title="Events">
      <div className="page-header">
        <div><h1>Events</h1><p>Manage all events</p></div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} />Add Event</button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap"><Search size={15} /><input className="a-field input" placeholder="Search events…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} style={{ padding: '8px 8px 8px 34px', border: '1px solid #e2e8f0', borderRadius: 6, width: '100%' }} /></div>
      </div>

      <div className="a-card">
        {items.length === 0 ? <div className="empty-state"><X size={32} /><p>No events found.</p></div> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Published</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong style={{ fontSize: 13 }}>{ev.title}</strong></td>
                    <td><span className="badge badge-blue">{ev.category}</span></td>
                    <td style={{ fontSize: 12 }}>{ev.start_date}</td>
                    <td>{statusBadge(ev)}</td>
                    <td><label className="toggle"><input type="checkbox" checked={ev.is_published} onChange={() => toggle(ev.id, 'is_published', ev.is_published)} /><span className="toggle-slider" /></label></td>
                    <td><label className="toggle"><input type="checkbox" checked={ev.is_featured} onChange={() => toggle(ev.id, 'is_featured', ev.is_featured)} /><span className="toggle-slider" /></label></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(ev)}><Pencil size={14} /></button>
                        <button className="btn-icon" title="Gallery" onClick={() => navigate(`/admin/events/${ev.id}/gallery`)}><Image size={14} /></button>
                        <button className="btn-icon" title="Documents" onClick={() => navigate(`/admin/events/${ev.id}/documents`)}><FileText size={14} /></button>
                        <button className="btn-icon danger" onClick={() => remove(ev.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
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
              <h3>{(modal as Event).id ? 'Edit Event' : 'Add Event'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="a-tabs" style={{ padding: '0 24px' }}>
              {tabs.map((t, i) => <button key={t} className={`a-tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>)}
            </div>
            <div className="modal-body">
              {tab === 0 && (
                <div className="a-form">
                  <div className="a-field"><label>Title *</label><input value={modal.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value, slug: slugify(e.target.value) })} /></div>
                  <div className="a-field"><label>Slug</label><input value={modal.slug ?? ''} onChange={(e) => setModal({ ...modal, slug: e.target.value })} /></div>
                  <div className="form-row">
                    <div className="a-field"><label>Category</label>
                      <select value={modal.category ?? 'Social'} onChange={(e) => setModal({ ...modal, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="a-field"><label>Main Image URL</label><input value={modal.image_url ?? ''} onChange={(e) => setModal({ ...modal, image_url: e.target.value })} /></div>
                  </div>
                  <div className="a-field"><label>Short Description</label><textarea rows={2} value={modal.short_description ?? ''} onChange={(e) => setModal({ ...modal, short_description: e.target.value })} /></div>
                </div>
              )}
              {tab === 1 && (
                <div className="a-form">
                  <div className="form-row">
                    <div className="a-field"><label>Start Date *</label><input type="date" value={modal.start_date ?? ''} onChange={(e) => setModal({ ...modal, start_date: e.target.value })} /></div>
                    <div className="a-field"><label>End Date</label><input type="date" value={modal.end_date ?? ''} onChange={(e) => setModal({ ...modal, end_date: e.target.value })} /></div>
                  </div>
                  <div className="a-field"><label>Location</label><input value={modal.location ?? ''} onChange={(e) => setModal({ ...modal, location: e.target.value })} /></div>
                  <div className="a-field"><label>Status Override</label>
                    <select value={modal.status_override ?? ''} onChange={(e) => setModal({ ...modal, status_override: e.target.value })}>
                      <option value="">Auto (based on date)</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>
              )}
              {tab === 2 && (
                <div className="a-form">
                  <div className="a-field"><label>Full Description</label><textarea rows={6} value={modal.full_description ?? ''} onChange={(e) => setModal({ ...modal, full_description: e.target.value })} /></div>
                  <div className="a-field"><label>Highlights (one per line)</label><textarea rows={4} value={(modal.highlights ?? []).join('\n')} onChange={(e) => setModal({ ...modal, highlights: e.target.value.split('\n').filter(Boolean) })} /></div>
                  <div className="a-field"><label>Thanks To</label><input value={modal.thanks_to ?? ''} onChange={(e) => setModal({ ...modal, thanks_to: e.target.value })} /></div>
                  <div className="a-field"><label>Special Thanks To</label><input value={modal.special_thanks_to ?? ''} onChange={(e) => setModal({ ...modal, special_thanks_to: e.target.value })} /></div>
                </div>
              )}
              {tab === 3 && (
                <div className="a-form">
                  <div className="form-row">
                    <div className="a-field"><label>Published</label>
                      <select value={modal.is_published ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_published: e.target.value === 'true' })}>
                        <option value="false">Draft</option><option value="true">Published</option>
                      </select>
                    </div>
                    <div className="a-field"><label>Featured</label>
                      <select value={modal.is_featured ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, is_featured: e.target.value === 'true' })}>
                        <option value="false">No</option><option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="a-field"><label>Likes</label>
                      <select value={modal.likes_enabled ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, likes_enabled: e.target.value === 'true' })}>
                        <option value="true">Enabled</option><option value="false">Disabled</option>
                      </select>
                    </div>
                    <div className="a-field"><label>Comments</label>
                      <select value={modal.comments_enabled ? 'true' : 'false'} onChange={(e) => setModal({ ...modal, comments_enabled: e.target.value === 'true' })}>
                        <option value="true">Enabled</option><option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="a-field"><label>Display Order</label><input type="number" value={modal.display_order ?? 0} onChange={(e) => setModal({ ...modal, display_order: +e.target.value })} /></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {tab > 0 && <button className="btn btn-ghost" onClick={() => setTab(tab - 1)}>← Back</button>}
              {tab < tabs.length - 1 && <button className="btn btn-ghost" onClick={() => setTab(tab + 1)}>Next →</button>}
              <button className="btn btn-primary" onClick={save} disabled={saving || !modal.title}>{saving ? 'Saving…' : 'Save Event'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
