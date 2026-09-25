import { useState, type ReactNode } from 'react';
import { BarChart2, Bell, BookOpen, CalendarDays, FileText, Image, Instagram, LayoutDashboard, LogOut, Mail, MessageSquare, Settings, Shield, Star, Users, Menu, X, Heart, DollarSign, Building2 } from 'lucide-react';
import { useAuth } from './utils';

const NAV = [
  { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin' }] },
  { section: 'Content', items: [
    { label: 'Banners', icon: Image, path: '/admin/banners' },
    { label: 'Announcements', icon: Bell, path: '/admin/announcements' },
    { label: 'Events', icon: CalendarDays, path: '/admin/events' },
  ]},
  { section: 'Community', items: [
    { label: 'Team Members', icon: Users, path: '/admin/team' },
    { label: 'Testimonials', icon: Star, path: '/admin/testimonials' },
    { label: 'Instagram Reels', icon: Instagram, path: '/admin/instagram-reels' },
  ]},
  { section: 'Engagement', items: [
    { label: 'Comments', icon: MessageSquare, path: '/admin/comments' },
    { label: 'Contact Messages', icon: Mail, path: '/admin/contact-messages' },
  ]},
  { section: 'Settings', items: [
    { label: 'Donation Settings', icon: Heart, path: '/admin/donation-settings' },
    { label: 'Organization', icon: Building2, path: '/admin/organization-settings' },
    { label: 'Site Settings', icon: Settings, path: '/admin/site-settings' },
  ]},
];

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { signOut, session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;

  function navigate(to: string) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); setSidebarOpen(false); }

  return (
    <div className="admin-root">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <strong>Rajmudra Pratishthan</strong>
          <small>Admin Panel</small>
        </div>
        <nav className="admin-nav">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="admin-nav-section">{section}</div>
              {items.map(({ label, icon: Icon, path: p }) => (
                <a key={p} href={p} className={path === p ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate(p); }}>
                  <Icon size={16} />{label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>{session?.user.email}</div>
          <button onClick={signOut}><LogOut size={15} />Logout</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2>{title}</h2>
          </div>
          <div className="admin-topbar-right">
            <Shield size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>Admin</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
