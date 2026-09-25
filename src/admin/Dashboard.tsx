import { useEffect, useState } from 'react';
import { CalendarDays, Users, Star, Instagram, MessageSquare, Mail, Plus, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';

type Stats = { totalEvents: number; upcomingEvents: number; pastEvents: number; teamMembers: number; testimonials: number; reels: number; pendingComments: number; contactMessages: number };
type RecentEvent = { id: string; title: string; start_date: string; category: string; is_published: boolean };
type RecentTestimonial = { id: string; name: string; designation: string; created_at: string };
type RecentContact = { id: string; name: string; email: string; status: string; created_at: string };

function navigate(to: string) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, upcomingEvents: 0, pastEvents: 0, teamMembers: 0, testimonials: 0, reels: 0, pendingComments: 0, contactMessages: 0 });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [recentTestimonials, setRecentTestimonials] = useState<RecentTestimonial[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      supabase.from('events').select('id, start_date', { count: 'exact' }),
      supabase.from('events').select('id', { count: 'exact' }).gte('start_date', today),
      supabase.from('events').select('id', { count: 'exact' }).lt('start_date', today),
      supabase.from('team_members').select('id', { count: 'exact' }).eq('is_published', true),
      supabase.from('testimonials').select('id', { count: 'exact' }),
      supabase.from('instagram_reels').select('id', { count: 'exact' }),
      supabase.from('event_comments').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('contact_messages').select('id', { count: 'exact' }),
      supabase.from('events').select('id, title, start_date, category, is_published').order('created_at', { ascending: false }).limit(5),
      supabase.from('testimonials').select('id, name, designation, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('contact_messages').select('id, name, email, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]).then(([e, ue, pe, tm, t, r, pc, cm, re, rt, rc]) => {
      setStats({ totalEvents: e.count ?? 0, upcomingEvents: ue.count ?? 0, pastEvents: pe.count ?? 0, teamMembers: tm.count ?? 0, testimonials: t.count ?? 0, reels: r.count ?? 0, pendingComments: pc.count ?? 0, contactMessages: cm.count ?? 0 });
      setRecentEvents((re.data ?? []) as RecentEvent[]);
      setRecentTestimonials((rt.data ?? []) as RecentTestimonial[]);
      setRecentContacts((rc.data ?? []) as RecentContact[]);
    });
  }, []);

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: CalendarDays },
    { label: 'Upcoming', value: stats.upcomingEvents, icon: Clock },
    { label: 'Past Events', value: stats.pastEvents, icon: CalendarDays },
    { label: 'Team Members', value: stats.teamMembers, icon: Users },
    { label: 'Testimonials', value: stats.testimonials, icon: Star },
    { label: 'Reels', value: stats.reels, icon: Instagram },
    { label: 'Pending Comments', value: stats.pendingComments, icon: MessageSquare },
    { label: 'Contact Messages', value: stats.contactMessages, icon: Mail },
  ];

  const quickActions = [
    { label: '+ Add Event', path: '/admin/events?new=1' },
    { label: '+ Add Member', path: '/admin/team?new=1' },
    { label: '+ Add Testimonial', path: '/admin/testimonials?new=1' },
    { label: '+ Add Announcement', path: '/admin/announcements?new=1' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="stat-grid">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <Icon size={22} className="stat-icon" />
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-title"><Plus size={15} />Quick Actions</div>
      <div className="quick-actions" style={{ marginBottom: 28 }}>
        {quickActions.map(({ label, path }) => (
          <a key={path} className="quick-action" href={path} onClick={(e) => { e.preventDefault(); navigate(path); }}>{label}</a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        <div className="a-card">
          <div className="section-title"><CalendarDays size={14} />Recent Events</div>
          {recentEvents.length === 0 ? <p style={{ color: '#6f675f', fontSize: 13 }}>No events yet.</p> : (
            <table className="a-table">
              <tbody>
                {recentEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong style={{ fontSize: 13 }}>{ev.title}</strong><br /><span style={{ fontSize: 11, color: '#6f675f' }}>{ev.category} · {ev.start_date}</span></td>
                    <td><span className={`badge ${ev.is_published ? 'badge-green' : 'badge-gray'}`}>{ev.is_published ? 'Published' : 'Draft'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="a-card">
          <div className="section-title"><Star size={14} />Recent Testimonials</div>
          {recentTestimonials.length === 0 ? <p style={{ color: '#6f675f', fontSize: 13 }}>No testimonials yet.</p> : (
            <table className="a-table">
              <tbody>
                {recentTestimonials.map((t) => (
                  <tr key={t.id}>
                    <td><strong style={{ fontSize: 13 }}>{t.name}</strong><br /><span style={{ fontSize: 11, color: '#6f675f' }}>{t.designation}</span></td>
                    <td style={{ fontSize: 11, color: '#6f675f' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="a-card">
          <div className="section-title"><Mail size={14} />Recent Contact Messages</div>
          {recentContacts.length === 0 ? <p style={{ color: '#6f675f', fontSize: 13 }}>No messages yet.</p> : (
            <table className="a-table">
              <tbody>
                {recentContacts.map((c) => (
                  <tr key={c.id}>
                    <td><strong style={{ fontSize: 13 }}>{c.name}</strong><br /><span style={{ fontSize: 11, color: '#6f675f' }}>{c.email}</span></td>
                    <td><span className={`badge ${c.status === 'new' ? 'badge-blue' : c.status === 'read' ? 'badge-yellow' : 'badge-green'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
