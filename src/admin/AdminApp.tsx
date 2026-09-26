import './admin.css';
import { useEffect, useState, type ReactNode } from 'react';
import { AuthProvider, ToastProvider, ConfirmProvider, useAuth } from './utils';
import AdminLogin from './AdminLogin';
import Dashboard from './Dashboard';
import Banners from './Banners';
import Announcements from './Announcements';
import Events from './Events';
import EventGallery from './EventGallery';
import EventDocuments from './EventDocuments';
import Team from './Team';
import Testimonials from './Testimonials';
import InstagramReels from './InstagramReels';
import ContactMessages from './ContactMessages';
import DonationSettings from './DonationSettings';
import OrgSettings from './OrgSettings';
import SiteSettings from './SiteSettings';
import {
  Bell, CalendarDays, ChevronLeft, ChevronRight,
  Heart, Image, Instagram, LayoutDashboard, LogOut,
  Mail, Settings, Star, Users, Menu, X,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Banners', icon: Image, path: '/admin/banners' },
  { label: 'Announcements', icon: Bell, path: '/admin/announcements' },
  { label: 'Events', icon: CalendarDays, path: '/admin/events' },
  { label: 'Team Members', icon: Users, path: '/admin/team' },
  { label: 'Testimonials', icon: Star, path: '/admin/testimonials' },
  { label: 'Instagram Reels', icon: Instagram, path: '/admin/instagram-reels' },
  { label: 'Contact Messages', icon: Mail, path: '/admin/contact-messages' },
  { label: 'Donation', icon: Heart, path: '/admin/donation-settings' },
  { label: 'Site & Organization', icon: Settings, path: '/admin/site-settings' },
];

function matchPath(path: string) {
  if (path === '/admin' || path === '/admin/') return '/admin';
  if (/^\/admin\/events\/[^/]+\/gallery$/.test(path)) return '/admin/events/gallery';
  if (/^\/admin\/events\/[^/]+\/documents$/.test(path)) return '/admin/events/documents';
  return path;
}

function PagePanel({ active, path, children }: { active: string; path: string; children: ReactNode }) {
  return (
    <div className={`admin-panel ${active === path ? 'admin-panel-active' : ''}`}>
      {children}
    </div>
  );
}

function AdminShell() {
  const { signOut, session } = useAuth();
  const [path, setPath] = useState(matchPath(window.location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => { setPath(matchPath(window.location.pathname)); setMobileOpen(false); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  function navigate(to: string) {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  const activeLabel = NAV.find(i => i.path === path)?.label ?? 'Admin';
  const initials = session?.user.email?.slice(0, 2).toUpperCase() ?? 'A';

  const sidebarContent = (isMobile = false) => (
    <>
      <div className="sb-brand">
        <img src="/logo.png" alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        {(!collapsed || isMobile) && (
          <div className="sb-brand-text">
            <strong>Rajmudra</strong>
            <span>Admin Panel</span>
          </div>
        )}
        {isMobile
          ? <button className="sb-icon-btn" onClick={() => setMobileOpen(false)}><X size={18} /></button>
          : <button className="sb-icon-btn sb-collapse-btn" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
        }
      </div>

      <nav className="sb-nav">
        {NAV.map(({ label, icon: Icon, path: p }) => (
          <button
            key={p}
            className={`sb-link ${path === p ? 'active' : ''}`}
            onClick={() => navigate(p)}
            title={collapsed && !isMobile ? label : undefined}
          >
            <span className="sb-link-icon"><Icon size={18} /></span>
            {(!collapsed || isMobile) && <span className="sb-link-label">{label}</span>}
            {path === p && <span className="sb-active-bar" />}
          </button>
        ))}
      </nav>

      <div className="sb-footer">
        {(!collapsed || isMobile) && (
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <span className="sb-user-email">{session?.user.email}</span>
              <span className="sb-user-role">Administrator</span>
            </div>
          </div>
        )}
        <button className="sb-logout" onClick={signOut} title="Logout">
          <LogOut size={15} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={`admin-shell ${collapsed ? 'sb-collapsed' : ''}`}>
      {/* Desktop sidebar */}
      <aside className="admin-sb sb-desktop">{sidebarContent(false)}</aside>

      {/* Mobile drawer */}
      {mobileOpen && <div className="sb-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`admin-sb sb-mobile ${mobileOpen ? 'open' : ''}`}>{sidebarContent(true)}</aside>

      {/* Main */}
      <div className="admin-body">
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="sb-icon-btn mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span className="admin-breadcrumb-root">Admin</span>
              <ChevronRight size={13} />
              <span className="admin-breadcrumb-current">{activeLabel}</span>
            </div>
          </div>
          <div className="admin-header-right">
            <a href="/" target="_blank" rel="noreferrer" className="header-view-site">View site ↗</a>
            <div className="header-avatar">{initials}</div>
          </div>
        </header>

        <main className="admin-panels">
          <PagePanel active={path} path="/admin"><Dashboard /></PagePanel>
          <PagePanel active={path} path="/admin/banners"><Banners /></PagePanel>
          <PagePanel active={path} path="/admin/announcements"><Announcements /></PagePanel>
          <PagePanel active={path} path="/admin/events"><Events /></PagePanel>
          <PagePanel active={path} path="/admin/events/gallery"><EventGallery /></PagePanel>
          <PagePanel active={path} path="/admin/events/documents"><EventDocuments /></PagePanel>
          <PagePanel active={path} path="/admin/team"><Team /></PagePanel>
          <PagePanel active={path} path="/admin/testimonials"><Testimonials /></PagePanel>
          <PagePanel active={path} path="/admin/instagram-reels"><InstagramReels /></PagePanel>
          <PagePanel active={path} path="/admin/contact-messages"><ContactMessages /></PagePanel>
          <PagePanel active={path} path="/admin/donation-settings"><DonationSettings /></PagePanel>
          <PagePanel active={path} path="/admin/site-settings"><SiteSettings /></PagePanel>
        </main>
      </div>
    </div>
  );
}

function AdminRouter() {
  const { session, loading } = useAuth();
  if (loading) return (
    <div className="admin-loading">
      <div className="admin-loading-spinner" />
    </div>
  );
  if (!session) return <AdminLogin />;
  return <AdminShell />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AdminRouter />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
