import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
const AdminApp = lazy(() => import('./admin/AdminApp'));
import { supabase } from '@/lib/supabase';

import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { EventsPage, EventDetail } from './components/EventsSection';
import { TeamPage } from './components/TeamSection';
import { TestimonialsPage } from './components/TestimonialsPage';
import { DonateModal } from './components/DonateModal';
import { images, sampleEvents } from './components/constants';
import type { Event, TeamMember, Testimonial, Reel, DonationData, OrgMap, SiteSettings } from './components/types';

function useSiteData(path: string) {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allTeam, setAllTeam] = useState<TeamMember[]>([]);
  const team = useMemo(() => allTeam.filter(m => m.is_featured), [allTeam]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [org, setOrg] = useState<OrgMap>({});
  const [site, setSite] = useState<SiteSettings>({});
  const [donation, setDonation] = useState<DonationData | null>(null);

  const isHome = path === '/' || path === '';
  const isEvents = path === '/events' || path.startsWith('/events/');
  const isTeam = path === '/team';

  useEffect(() => {
    if (!supabase) return;
    supabase.from('organization_settings').select('key, value').eq('is_public', true).then(({ data }) => {
      if (data) { const map: OrgMap = {}; (data as { key: string; value: string }[]).forEach((r) => { map[r.key] = r.value; }); setOrg(map); }
    });
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) { const map: SiteSettings = {}; (data as { key: string; value: string }[]).forEach((r) => { map[r.key] = r.value; }); setSite(map); }
    });
    // fetch donation always so modal is ready
    supabase.from('donation_settings').select('*').limit(1).single().then(({ data }) => {
      if (data) setDonation(data as DonationData);
    });
    if (isHome || isEvents) {
      supabase.from('events').select('*').eq('is_published', true).order('start_date', { ascending: true }).then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = (data as Record<string, unknown>[]).map((e) => ({
            id: e.id as string, slug: e.slug as string, title: e.title as string,
            description: (e.short_description as string) || (e.full_description as string) || '',
            category: e.category as string, event_date: e.start_date as string,
            location: e.location as string, image_url: (e.image_url as string) || images.festival,
            highlights: e.highlights as string[] | undefined,
            is_featured: e.is_featured as boolean,
            display_order: (e.display_order as number) ?? 0,
          }));
          setEvents(mapped);
          setFeaturedEvents(mapped.filter(e => e.is_featured).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
        }
      });
    }
    if (isHome || isTeam) {
      supabase.from('team_members').select('id, display_name, position, occupation, profile_image_url, is_featured').eq('is_published', true).order('display_order').then(({ data }) => {
        if (data && data.length > 0) setAllTeam(data as TeamMember[]);
      });
    }
    if (isHome) {
      supabase.from('testimonials').select('id, name, designation, organization, message, photo_url').eq('status', true).order('display_order').then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data as Testimonial[]);
      });
      supabase.from('instagram_reels').select('id, reel_url, title, thumbnail_url').eq('is_active', true).order('display_order').then(({ data }) => {
        if (data && data.length > 0) setReels(data as Reel[]);
      });
    }
  }, [path]);

  return { events, featuredEvents, team, allTeam, testimonials, reels, org, site, donation };
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [donateOpen, setDonateOpen] = useState(false);
  const { events, featuredEvents, team, allTeam, testimonials, reels, org, site, donation } = useSiteData(path);

  useEffect(() => {
    const handler = () => {
      const p = window.location.pathname;
      if (p === '/donate') {
        setDonateOpen(true);
        window.history.replaceState({}, '', '/');
      } else {
        setPath(p);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // intercept all donate link clicks globally
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (a && (a.getAttribute('href') === '/donate' || a.pathname === '/donate')) {
        e.preventDefault();
        setDonateOpen(true);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (path === '/donate') { setDonateOpen(true); setPath('/'); return; }
    const hash = window.location.hash;
    if (hash) {
      const tryScroll = (attempts = 0) => {
        const el = document.querySelector(hash);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        else if (attempts < 10) { setTimeout(() => tryScroll(attempts + 1), 100); }
      };
      tryScroll();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [path]);

  if (path.startsWith('/admin')) return <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading…</div>}><AdminApp /></Suspense>;

  return (
    <>
      {donateOpen && <DonateModal donation={donation} onClose={() => setDonateOpen(false)} />}
      {path === '/about' && <AboutPage org={org} />}
      {path === '/events' && <EventsPage events={events} org={org} />}
      {path === '/team' && <TeamPage team={allTeam} org={org} />}
      {path === '/testimonials' && <TestimonialsPage testimonials={testimonials} org={org} />}
      {path === '/contact' && (() => { window.location.replace('/#contact'); return null; })()}
      {path.startsWith('/events/') && <EventDetail event={events.find((item) => item.slug === path.split('/')[2]) ?? events[0]} org={org} />}
      {(path === '/' || path === '') && <HomePage featuredEvents={featuredEvents} team={team} testimonials={testimonials} reels={reels} org={org} site={site} />}
    </>
  );
}

export default App;
