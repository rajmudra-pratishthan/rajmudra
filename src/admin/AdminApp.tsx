import './admin.css';
import { useEffect, useState } from 'react';
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
import Comments from './Comments';
import ContactMessages from './ContactMessages';
import DonationSettings from './DonationSettings';
import OrgSettings from './OrgSettings';
import SiteSettings from './SiteSettings';

function AdminRouter() {
  const { session, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6f675f' }}>Loading…</div>;
  if (!session) return <AdminLogin />;

  if (path === '/admin' || path === '/admin/') return <Dashboard />;
  if (path === '/admin/banners') return <Banners />;
  if (path === '/admin/announcements') return <Announcements />;
  if (path === '/admin/events') return <Events />;
  if (/^\/admin\/events\/[^/]+\/gallery$/.test(path)) return <EventGallery />;
  if (/^\/admin\/events\/[^/]+\/documents$/.test(path)) return <EventDocuments />;
  if (path === '/admin/team') return <Team />;
  if (path === '/admin/testimonials') return <Testimonials />;
  if (path === '/admin/instagram-reels') return <InstagramReels />;
  if (path === '/admin/comments') return <Comments />;
  if (path === '/admin/contact-messages') return <ContactMessages />;
  if (path === '/admin/donation-settings') return <DonationSettings />;
  if (path === '/admin/organization-settings') return <OrgSettings />;
  if (path === '/admin/site-settings') return <SiteSettings />;

  return <Dashboard />;
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
