import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Star, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { useToast, useConfirm } from './utils';

type GalleryItem = { id: string; event_id: string; image_url: string; is_featured: boolean; display_order: number };

function navigate(to: string) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }

export default function EventGallery() {
  const eventId = window.location.pathname.split('/')[3];
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function load() {
    const [{ data: ev }, { data: gallery }] = await Promise.all([
      supabase!.from('events').select('title').eq('id', eventId).single(),
      supabase!.from('event_gallery').select('*').eq('event_id', eventId).order('display_order'),
    ]);
    setEventTitle(ev?.title ?? '');
    setItems((gallery ?? []) as GalleryItem[]);
  }
  useEffect(() => { load(); }, []);

  async function addImage() {
    if (!addUrl.trim()) return;
    setAdding(true);
    const { error } = await supabase!.from('event_gallery').insert({ event_id: eventId, image_url: addUrl.trim(), display_order: items.length });
    if (error) { toast('error', error.message); } else { toast('success', 'Image added.'); setAddUrl(''); setShowAdd(false); load(); }
    setAdding(false);
  }

  async function remove(id: string) {
    if (!await confirm({ title: 'Delete image?', message: 'This cannot be undone.', danger: true })) return;
    await supabase!.from('event_gallery').delete().eq('id', id);
    toast('success', 'Image deleted.'); load();
  }

  async function setFeatured(id: string) {
    await supabase!.from('event_gallery').update({ is_featured: false }).eq('event_id', eventId);
    await supabase!.from('event_gallery').update({ is_featured: true }).eq('id', id);
    load();
  }

  return (
    <AdminLayout title="Event Gallery">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')} style={{ marginBottom: 8 }}><ArrowLeft size={14} />Back to Events</button>
          <h1>Gallery — {eventTitle}</h1>
          <p>{items.length} image{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} />Add Image</button>
      </div>

      {items.length === 0 ? (
        <div className="a-card"><div className="empty-state"><X size={32} /><p>No images yet. Add photos to this event's gallery.</p></div></div>
      ) : (
        <div className="image-grid">
          {items.map((item) => (
            <div key={item.id} className={`image-thumb ${item.is_featured ? 'featured' : ''}`}>
              <img src={item.image_url} alt="Gallery" loading="lazy" />
              <div className="image-thumb-actions">
                <button className="btn-icon" title="Set as featured" onClick={() => setFeatured(item.id)} style={{ background: item.is_featured ? '#fbbf24' : 'rgba(255,255,255,.9)', color: item.is_featured ? '#fff' : '#374151' }}><Star size={14} /></button>
                <button className="btn-icon danger" onClick={() => remove(item.id)} style={{ background: 'rgba(255,255,255,.9)' }}><Trash2 size={14} /></button>
              </div>
              {item.is_featured && <div style={{ position: 'absolute', top: 6, left: 6, background: '#fbbf24', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#fff' }}>Featured</div>}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Image</h3>
              <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="a-form">
                <div className="a-field"><label>Image URL</label><input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://..." autoFocus /></div>
                <p className="field-hint">Paste a direct image URL. Supported: JPG, PNG, WebP.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addImage} disabled={adding || !addUrl.trim()}>{adding ? 'Adding…' : 'Add Image'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
