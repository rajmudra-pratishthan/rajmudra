import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
const AdminApp = lazy(() => import('./admin/AdminApp'));
import { ArrowRight, Award, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleArrowOutUpRight, Heart, Instagram, Landmark, Menu, MessageCircle, Palette, Send, ShieldCheck, Sparkles, Trophy, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Event = {
  id?: string; slug: string; title: string; description: string; category: string;
  event_date: string; location: string; image_url: string; highlights?: string[];
  short_description?: string; full_description?: string; is_featured?: boolean; display_order?: number;
};
type TeamMember = { id: string; display_name: string; position: string; occupation: string; profile_image_url: string | null; is_featured?: boolean };
type Testimonial = { id: string; name: string; designation: string; organization: string; message: string; photo_url: string | null };
type Reel = { id: string; reel_url: string; title: string; thumbnail_url: string | null };
type DonationData = {
  page_title: string; page_description: string; upi_id: string; upi_display_name: string;
  qr_code_url: string; bank_name: string; account_holder: string; account_number: string;
  ifsc: string; branch: string; instructions: string;
};
type OrgMap = Record<string, string>;
type IconType = typeof Users;

const images = {
  hero: '/images/hero-volunteers.jpg',
  culture: '/images/culture-festival.jpg',
  education: '/images/education-school.jpg',
  sports: '/images/sports-cricket.jpg',
  school: '/images/school-children.jpg',
  community: '/images/community-aid.jpg',
  rangoli: '/images/rangoli-art.jpg',
  flag: '/images/flag-india.jpg',
  gathering: '/images/gathering-community.jpg',
  volunteers: '/images/volunteers-packing.jpg',
  festival: '/images/festival-people.jpg',
};

const sampleEvents: Event[] = [
  { slug: 'shiv-janmotsav-2026', title: 'Chhatrapati Shivaji Maharaj Birth Celebration', description: 'A celebration of art, sport, knowledge and culture, bringing every generation together.', category: 'Cultural', event_date: '2026-03-19', location: 'Community Grounds, Maharashtra', image_url: images.festival, highlights: ['Drawing and speech competitions', 'Chess and sports events', 'Community prize ceremony'] },
  { slug: 'education-kit-2026', title: 'Student Education Kit Distribution', description: 'School supplies and encouragement for students as they begin a new academic year.', category: 'Educational', event_date: '2026-06-14', location: 'Maharashtra', image_url: images.education, highlights: ['School kits', 'Books and stationery', 'Parent conversations'] },
  { slug: 'community-sports-2026', title: 'Youth Sports Festival', description: 'A day of teamwork, discipline and healthy competition for young people in our community.', category: 'Sports', event_date: '2026-08-09', location: 'Community Sports Ground', image_url: images.sports, highlights: ['Cricket', 'Volleyball', 'Tug of war'] },
];

const fallbackTeam: TeamMember[] = [
  { id: '1', display_name: 'Name coming soon', position: 'President', occupation: 'Social service', profile_image_url: images.community },
  { id: '2', display_name: 'Name coming soon', position: 'Vice President', occupation: 'Community development', profile_image_url: images.gathering },
  { id: '3', display_name: 'Name coming soon', position: 'Secretary', occupation: 'Education', profile_image_url: images.education },
  { id: '4', display_name: 'Name coming soon', position: 'Treasurer', occupation: 'Finance & operations', profile_image_url: images.school },
  { id: '5', display_name: 'Name coming soon', position: 'Program coordinator', occupation: 'Arts and culture', profile_image_url: images.festival },
  { id: '6', display_name: 'Name coming soon', position: 'Outreach lead', occupation: 'Sports and youth', profile_image_url: images.sports },
];

const fallbackTestimonials: Testimonial[] = [
  { id: '1', name: 'Community well-wisher', designation: 'Appreciation Message', organization: 'Rajmudra Pratishthan', message: 'The organization\u2019s community-first initiatives and consistent work are truly inspiring.', photo_url: null },
  { id: '2', name: 'School teacher', designation: 'Education partner', organization: 'Local School', message: 'Their work to preserve culture while involving the next generation is deeply admirable.', photo_url: null },
  { id: '3', name: 'Local resident', designation: 'Community member', organization: 'Maharashtra', message: 'This is a sincere organization that brings every part of the community into the conversation.', photo_url: null },
  { id: '4', name: 'Volunteer', designation: 'Active member', organization: 'Rajmudra Pratishthan', message: 'Watching children and elders celebrate together at their events is a beautiful sight.', photo_url: null },
  { id: '5', name: 'Donor', designation: 'Supporter', organization: 'Rajmudra Pratishthan', message: 'They turned a simple idea into a movement that now touches thousands of lives.', photo_url: null },
];

const fallbackReels: Reel[] = [
  { id: '1', reel_url: 'https://instagram.com', title: '01', thumbnail_url: images.culture },
  { id: '2', reel_url: 'https://instagram.com', title: '02', thumbnail_url: images.rangoli },
  { id: '3', reel_url: 'https://instagram.com', title: '03', thumbnail_url: images.sports },
  { id: '4', reel_url: 'https://instagram.com', title: '04', thumbnail_url: images.community },
];

const navItems = [['Home', '/'], ['About us', '/about'], ['Our work', '/#work'], ['Events', '/events'], ['Our team', '/team'], ['Contact', '/#contact']];


const focusAreas: { title: string; text: string; icon: IconType; number: string }[] = [
  { title: 'Social service', text: 'Support for families in need and initiatives that strengthen everyday community life.', icon: Heart, number: '01' },
  { title: 'Culture', text: 'Preserving and celebrating Indian and Maharashtrian traditions through shared experiences.', icon: Landmark, number: '02' },
  { title: 'Education', text: 'Learning resources, competitions and encouragement for students to move forward.', icon: BookOpen, number: '03' },
  { title: 'Sports', text: 'Healthy competition, teamwork and opportunities for young people to grow.', icon: Trophy, number: '04' },
  { title: 'Art', text: 'Space for drawing, dance, speaking, rangoli and every form of creative expression.', icon: Palette, number: '05' },
  { title: 'Community development', text: 'Programs that bring local people together with purpose and pride.', icon: Users, number: '06' },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return <a href="/" className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Rajmudra Pratishthan home">
    <img src="/logo.png" alt="Rajmudra Pratishthan official logo" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
    <span><strong>Rajmudra Pratishthan</strong><small>Social & Cultural Organization</small></span>
  </a>;
}
function Header() {
  const [open, setOpen] = useState(false); const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll); }, []);
  function navigate(href: string) {
    setOpen(false);
    const [p, hash] = href.split('#');
    const targetPath = p || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (hash) {
      window.history.replaceState({}, '', href);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}><div className="container header-inner"><Logo />
    <nav className={open ? 'mobile-open' : ''}>{navItems.map(([label, href]) => <a key={href} href={href} onClick={(e) => { e.preventDefault(); navigate(href); }}>{label}</a>)}<a className="header-donate" href="/donate" onClick={(e) => { e.preventDefault(); navigate('/donate'); }}>Donate <ArrowRight size={15} /></a></nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
  </div></header>;
}
function SectionLabel({ children }: { children: ReactNode }) { return <div className="section-label"><span />{children}</div>; }
function Button({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) { return <a className={`button ${secondary ? 'button-light' : ''}`} href={href}>{children}<ArrowRight size={16} /></a>; }
function InnerHero({ label, title, desc, image }: { label: string; title: string; desc: string; image: string }) {
  return <div className="inner-hero" style={{ backgroundImage: `url(${image})` }}><div className="inner-hero-wash" /><div className="container"><SectionLabel>{label}</SectionLabel><h1>{title}<span>.</span></h1><p>{desc}</p></div></div>;
}

function Hero() {
  const [active, setActive] = useState(0); const heroSlides = [images.hero, images.culture, images.education, images.festival];
  useEffect(() => { const timer = window.setInterval(() => setActive((current) => (current + 1) % heroSlides.length), 5000); return () => window.clearInterval(timer); }, [heroSlides.length]);
  return <section className="hero"><div className="hero-image" style={{ backgroundImage: `url(${heroSlides[active]})` }}><div className="hero-image-wash" /></div><div className="container hero-content"><div className="hero-copy"><div className="eyebrow light"><Sparkles size={15} /> Social service · Culture · Education · Sports · Art</div><h1>Working for society,<br /><em>proud of our culture.</em></h1><p>For more than a decade, Rajmudra Pratishthan has worked across social service, culture, education, sport and art to help communities thrive.</p><div className="hero-actions"><Button href="/#work">Explore our work</Button><Button href="/#contact" secondary>Get in touch</Button></div></div><div className="hero-caption"><span>0{active + 1} / 04</span><div className="hero-progress">{heroSlides.map((_, index) => <button key={index} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} />)}</div><span>Community moments</span></div></div></section>;
}
function useCountUp(target: number, suffix: string, duration = 1800) {
  const [val, setVal] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(ease * target) + suffix);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, duration]);
  return { val, ref };
}
function StatCounter({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const { val, ref } = useCountUp(value, suffix);
  return <div className="stat" ref={ref}><strong>{val}</strong><span>{label}</span></div>;
}
function Stats({ org }: { org: OrgMap }) {
  const years = parseInt(org.stat_years || '10', 10);
  const members = parseInt(org.member_count || '50', 10);
  const activities = parseInt(org.activity_count || '100', 10);
  const families = parseInt(org.family_count || '1000', 10);
  return (
    <section className="stats">
      <div className="container stats-grid">
        <StatCounter value={years} suffix="+" label="Years of social service" />
        <StatCounter value={members} suffix="+" label="Active members" />
        <StatCounter value={activities} suffix="+" label="Social and cultural initiatives" />
        <StatCounter value={families} suffix="+" label="Families connected" />
      </div>
    </section>
  );
}
function WorkSection() { return <section className="section work-section" id="work"><div className="container"><div className="section-heading"><div><SectionLabel>Our direction</SectionLabel><h2>What we do<span>?</span></h2></div><p>We create opportunities, preserve culture and bring people together through meaningful action.</p></div><div className="focus-grid">{focusAreas.map(({ title, text, icon: Icon }) => <article className="focus-card" key={title}><div className="focus-icon"><Icon size={24} strokeWidth={1.8} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>; }
function EventCard({ event }: { event: Event }) {
  const isUpcoming = new Date(event.event_date) >= new Date(new Date().toDateString());
  return (
    <article className={`event-card ${isUpcoming ? 'event-upcoming' : 'event-past'}`}>
      <a href={`/events/${event.slug}`} className="event-image">
        <img src={event.image_url} alt={event.title} loading="lazy" />
        <div className="event-tags">
          <span className="event-tag-category">{event.category}</span>
          <span className={`event-tag-status ${isUpcoming ? 'tag-upcoming' : 'tag-past'}`}>{isUpcoming ? 'Upcoming' : 'Past'}</span>
        </div>
      </a>
      <div className="event-content">
        <div className="event-date"><CalendarDays size={16} /><strong>{new Date(event.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
        <h3><a href={`/events/${event.slug}`}>{event.title}</a></h3>
        <p>{event.description}</p>
        <div className="event-meta"><span>{event.location}</span><a href={`/events/${event.slug}`}>View details <ArrowRight size={15} /></a></div>
      </div>
    </article>
  );
}
function EventsSection({ events }: { events: Event[] }) { return <section className="section events-section"><div className="container"><div className="section-heading"><div><SectionLabel>Moments that bring us together</SectionLabel><h2>Our events</h2></div><Button href="/events" secondary>View all events</Button></div><div className="events-grid">{events.map((event) => <EventCard event={event} key={event.slug} />)}</div></div></section>; }

function TimelineSection() { const items = [['26 January', 'Republic Day', 'Flag hoisting, food support and gratitude for community contributors'], ['14 April', 'Dr. B. R. Ambedkar Jayanti', 'A message of equality and meaningful social initiatives'], ['15 August', 'Independence Day', 'School kits, books and educational support for students'], ['March–April', 'Shivaji Maharaj Birth Celebration', 'Competitions, art, sport and a community-wide celebration'], ['Dussehra · Diwali', 'Community gratitude', 'Mahaprasad, appreciation, gifts and time together']]; return <section className="section timeline-section"><div className="container timeline-grid"><div><SectionLabel>Across the year</SectionLabel><h2>Rooted in tradition,<br /><em>moving forward.</em></h2><p>Every festival, initiative and gathering is a chance to deepen our connection with the community.</p></div><div className="timeline">{items.map(([date, title, text], index) => <div className="timeline-item" key={title}><div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div><div><span>{date}</span><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></section>; }
function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  return (
    <a className="reel-card" href={reel.reel_url} target="_blank" rel="noreferrer">
      <img src={reel.thumbnail_url || images.culture} alt="Rajmudra Pratishthan Instagram moment" loading="lazy" />
      <span><Instagram size={18} /> 0{index + 1}</span>
    </a>
  );
}
function InstagramSection({ reels, org }: { reels: Reel[]; org: OrgMap }) {
  const display = reels.length > 0 ? reels : fallbackReels;
  const track = [...display, ...display];
  const igUrl = org.instagram || 'https://instagram.com';
  const igHandle = igUrl.replace(/\/+$/, '').split('/').pop() || 'Instagram';
  return (
    <section className="section instagram-section">
      <div className="container">
        <div className="section-heading">
          <div><SectionLabel>Digital memories</SectionLabel><h2>Moments from Instagram</h2></div>
          <a className="instagram-link" href={igUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> @{igHandle} <CircleArrowOutUpRight size={15} /></a>
        </div>
      </div>
      <div className="reel-marquee-wrap">
        <div className="reel-marquee">
          {track.map((reel, i) => <ReelCard key={i} reel={reel} index={i % display.length} />)}
        </div>
      </div>
    </section>
  );
}
function Footer({ org }: { org: OrgMap }) {
  const address = org.address || 'Maharashtra, India';
  const email = org.email || 'Official email coming soon';
  const phone = org.phone || 'Official number coming soon';
  return <footer><div className="container footer-top"><div><Logo compact /><p>Working for society, rooted in culture.<br />Together, we can shape a better tomorrow.</p></div><div className="footer-links"><strong>Quick links</strong>{navItems.slice(0, 5).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div><div className="footer-links"><strong>Contact</strong><span>{address}</span><span>{email}</span><a href="/#contact">Contact us <ArrowRight size={14} /></a></div><div className="footer-note"><ShieldCheck size={18} /><span>Trust, transparency<br />and community.</span></div></div><div className="container footer-bottom"><span>© 2026 Rajmudra Pratishthan. All rights reserved.</span><span>Privacy Policy · Donation Policy</span></div></footer>;
}
function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.transitionDelay = `${index * 80}ms`; el.classList.add('member-visible'); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);
  return (
    <article className="member-card" ref={ref}>
      <div className="member-img-wrap">
        <img src={member.profile_image_url || images.community} alt={member.display_name} loading="lazy" />
      </div>
      <div className="member-info">
        <span className="member-role">{member.position}</span>
        <h3 className="member-name">{member.display_name}</h3>
        {member.occupation && <p className="member-occ">{member.occupation}</p>}
      </div>
    </article>
  );
}
function TeamSlider({ team }: { team: TeamMember[] }) {
  const members = team.length > 0 ? team : fallbackTeam;
  return (
    <section className="section team-slider-section" id="team-preview">
      <div className="container">
        <div className="section-heading">
          <div><SectionLabel>The people behind the work</SectionLabel><h2>Meet our team</h2></div>
          <Button href="/team">Meet our whole team</Button>
        </div>
        <div className="team-cards-grid">
          {members.map((member, i) => <MemberCard key={member.id || i} member={member} index={i} />)}
        </div>
      </div>
    </section>
  );
}
function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const list = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const track = [...list, ...list];
  return (
    <section className="section testimonial-slider-section">
      <div className="container">
        <div className="section-heading" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <SectionLabel>Community trust</SectionLabel>
          <h2>What people <em>say about us</em></h2>
          <p style={{ maxWidth: 600, color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, margin: '12px 0 0' }}>Hear from the people who have shared our journey and experienced our work first-hand.</p>
        </div>
      </div>
      <div className="testimonial-marquee-wrap">
        <div className="testimonial-marquee">
          {track.map((t, i) => (
            <article className="testi-card" key={i}>
              <div className="testi-icon">&ldquo;</div>
              <p className="testi-text">{t.message}</p>
              <div className="testi-user">
                {t.photo_url
                  ? <div className="testi-img"><img src={t.photo_url} alt={t.name} /></div>
                  : <div className="testi-img">{t.name.charAt(0)}</div>}
                <div className="testi-info">
                  <strong className="testi-name">{t.name}</strong>
                  <span className="testi-meta">{t.designation}{t.organization ? ` · ${t.organization}` : ''}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function HomeContact({ org }: { org: OrgMap }) {
  const [sent, setSent] = useState(false); const [error, setError] = useState('');
  const address = org.address || 'Maharashtra, India';
  const email = org.email || 'Official email coming soon';
  const phone = org.phone || 'Official number coming soon';
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); if (supabase) { const { error: submitError } = await supabase.from('contact_messages').insert({ name: String(form.get('name')), phone: String(form.get('phone')), email: String(form.get('email')), message: String(form.get('message')) }); if (submitError) { setError('There was a problem sending your message. Please try again.'); return; } } setSent(true); }
  return <section className="section home-contact-section" id="contact"><div className="container home-contact-grid"><div className="contact-info"><SectionLabel>Get in touch</SectionLabel><h2>Let's make something <em>meaningful.</em></h2><p>Your time, skills and support can all make a lasting difference.</p><div className="contact-lines"><span><strong>Location</strong>{address}</span><span><strong>Email</strong>{email}</span><span><strong>Phone / WhatsApp</strong>{phone}</span></div></div><div className="contact-form-wrap">{sent ? <div className="success-state"><div><Send size={22} /></div><h3>Message received.</h3><p>Thank you for reaching out. Our team will get back to you soon.</p><a href="/">Back to home <ArrowRight size={15} /></a></div> : <form onSubmit={submit}><h3>Send a message</h3><label>Your name<input name="name" required placeholder="Full name" /></label><div className="form-row"><label>Phone<input name="phone" required placeholder="Phone number" /></label><label>Email<input name="email" required type="email" placeholder="Email address" /></label></div><label>Your message<textarea name="message" required rows={5} placeholder="How can we help?" /></label>{error && <p className="form-error">{error}</p>}<button className="button" type="submit">Send message <Send size={16} /></button></form>}</div></div></section>;
}
function Home({ events, featuredEvents, team, testimonials, reels, org }: { events: Event[]; featuredEvents: Event[]; team: TeamMember[]; testimonials: Testimonial[]; reels: Reel[]; org: OrgMap }) { return <><Header /><main><Hero /><EventsSection events={featuredEvents} /><Stats org={org} /><WorkSection /><TeamSlider team={team} /><TestimonialSlider testimonials={testimonials} /><InstagramSection reels={reels} org={org} /><HomeContact org={org} /><section className="cta-strip"><div className="container"><div><SectionLabel>Your support matters</SectionLabel><h2>Make a difference in the community.</h2></div><Button href="/donate">Donate now</Button></div></section></main><Footer org={org} /></>; }
function About({ org }: { org: OrgMap }) {
  const foundationYear = org.foundation_year || '2015';
  const memberCount = org.member_count || '50+';
  return <><Header /><main className="inner-page"><InnerHero label="Our identity" title="About us" desc="More than a decade of social service, culture and community development." image={images.gathering} /><section className="section about-content"><div className="container about-grid"><div><img src={images.community} alt="Community members gathered together" loading="lazy" /></div><div><SectionLabel>Rajmudra Pratishthan</SectionLabel><h2>One organization. Many dreams. <em>One shared journey.</em></h2><p>Rajmudra Pratishthan is a Maharashtra-based social and cultural organization. We work across education, art, sport, culture and community development, bringing every part of society into the conversation.</p><div className="about-facts"><span><strong>{foundationYear}</strong>Founded</span><span><strong>{memberCount}</strong>Active members</span><span><strong>6</strong>Focus areas</span></div></div></div></section><TimelineSection /></main><Footer org={org} /></>; }
function EventsPage({ events }: { events: Event[] }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [yearOpen, setYearOpen] = useState(false);
  const years = useMemo(() => [...new Set(events.map(e => new Date(e.event_date).getFullYear().toString()))].sort((a, b) => +b - +a), [events]);
  const sorted = useMemo(() => [...events].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)), [events]);
  const filtered = useMemo(() => sorted.filter(e =>
    (!year || new Date(e.event_date).getFullYear().toString() === year) &&
    (!query || e.title.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase()))
  ), [sorted, query, year]);
  return (
    <><Header /><main className="inner-page">
      <InnerHero label="Programs and celebrations" title="Events" desc="Gatherings, festivals and initiatives that connect our community." image={images.culture} />
      <section className="section events-list"><div className="container">
        <div className="search-row">
          <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" /></div>
          <div className="year-filter-wrap">
            <button className="filter-button" onClick={() => setYearOpen(o => !o)}>
              {year || 'All years'} <ChevronDown size={16} />
            </button>
            {yearOpen && (
              <div className="year-dropdown">
                <button className={!year ? 'active' : ''} onClick={() => { setYear(''); setYearOpen(false); }}>All years</button>
                {years.map(y => <button key={y} className={year === y ? 'active' : ''} onClick={() => { setYear(y); setYearOpen(false); }}>{y}</button>)}
              </div>
            )}
          </div>
        </div>
        <div className="events-grid">{filtered.map((event) => <EventCard event={event} key={event.slug} />)}</div>
        {filtered.length === 0 && <div className="empty-state">No events matched your search.</div>}
      </div></section>
    </main><Footer org={{}} /></>
  );
}
function EventDetail({ event }: { event: Event }) { const [liked, setLiked] = useState(false); return <><Header /><main className="inner-page detail-page"><div className="container"><a className="back-link" href="/events"><ChevronLeft size={16} /> All events</a><div className="detail-hero"><img src={event.image_url} alt={event.title} /><div className="detail-overlay"><span>{event.category}</span><h1>{event.title}</h1><div><CalendarDays size={16} /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} <span>·</span> {event.location}</div></div></div><div className="detail-grid"><article><SectionLabel>About the event</SectionLabel><h2>A beautiful moment <em>together.</em></h2><p>{event.description}</p><p>Children, students, parents and senior citizens come together for an experience that reflects our commitment to an active, connected community.</p><div className="highlight-box"><h3>Event highlights</h3>{(event.highlights ?? []).map((highlight) => <span key={highlight}><Sparkles size={15} /> {highlight}</span>)}</div></article><aside className="detail-aside"><button className={`like-button ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}><Heart size={19} fill={liked ? 'currentColor' : 'none'} /> Like <span>{liked ? '1' : '0'}</span></button><div className="thanks-card"><Award size={22} /><h3>With thanks</h3><p>Our heartfelt thanks to every volunteer, supporter, donor and community member who makes these initiatives possible.</p></div></aside></div></div></main><Footer org={{}} /></>; }

function Donate({ donation, org }: { donation: DonationData | null; org: OrgMap }) {
  const hasDetails = donation && (donation.upi_id || donation.bank_name || donation.account_number);
  return <><Header /><main className="inner-page"><InnerHero label="Your support" title="Donate" desc="Make a difference in the community." image={images.volunteers} /><section className="section donate-section"><div className="container donate-card"><div><Sparkles size={25} /><h2>{donation?.page_title || 'Your support helps us create more social, educational and cultural opportunities.'}</h2><p>{donation?.page_description || 'Please verify official details before making a donation. Public donation information will be added here by the organization.'}</p></div>{hasDetails ? <div className="donate-details"><div className="donate-section-block"><h3>UPI</h3>{donation.upi_id && <p><strong>UPI ID:</strong> {donation.upi_id}</p>}{donation.upi_display_name && <p><strong>Name:</strong> {donation.upi_display_name}</p>}{donation.qr_code_url && <img src={donation.qr_code_url} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 12, marginTop: 12 }} />}</div>{(donation.bank_name || donation.account_number) && <div className="donate-section-block"><h3>Bank Details</h3>{donation.bank_name && <p><strong>Bank:</strong> {donation.bank_name}</p>}{donation.account_holder && <p><strong>Account Holder:</strong> {donation.account_holder}</p>}{donation.account_number && <p><strong>Account Number:</strong> {donation.account_number}</p>}{donation.ifsc && <p><strong>IFSC:</strong> {donation.ifsc}</p>}{donation.branch && <p><strong>Branch:</strong> {donation.branch}</p>}</div>}{donation.instructions && <p className="donate-instructions">{donation.instructions}</p>}<div className="donate-trust"><ShieldCheck size={17} /><small>Your safety and transparency matter to us.</small></div></div> : <div className="donate-placeholder"><Landmark size={32} /><strong>Official details coming soon</strong><span>UPI, QR code and bank details<br />will be published by the organization.</span><ShieldCheck size={17} /><small>Your safety and transparency matter to us.</small></div>}</div></section></main><Footer org={org} /></>; }
function Team({ team, org }: { team: TeamMember[]; org: OrgMap }) {
  const members = team.length > 0 ? team : fallbackTeam;
  return <><Header /><main className="inner-page"><InnerHero label="The people behind the work" title="Our team" desc="A dedicated group turning shared values into action." image={images.gathering} /><section className="section team-section"><div className="container"><div className="team-cards-grid team-cards-grid-4">{members.map((member, i) => <MemberCard key={member.id || i} member={member} index={i} />)}</div></div></section></main><Footer org={org} /></>;
}
function Testimonials({ testimonials, org }: { testimonials: Testimonial[]; org: OrgMap }) {
  const list = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  return <><Header /><main className="inner-page"><InnerHero label="Community trust" title="Testimonials" desc="Words of appreciation from people who have shared our journey." image={images.culture} /><section className="section testimonial-section"><div className="container testimonial-grid">{list.map((t, i) => <article className="quote-card" key={t.id || i}><MessageCircle size={22} /><p>{`\u201C${t.message}\u201D`}</p><strong>{t.name}</strong><span>{t.designation}{t.organization ? ` · ${t.organization}` : ''}</span><small>0{i + 1}</small></article>)}</div></section></main><Footer org={org} /></>; }

function useSiteData(path: string) {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allTeam, setAllTeam] = useState<TeamMember[]>([]);
  const team = useMemo(() => allTeam.filter(m => m.is_featured), [allTeam]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [org, setOrg] = useState<OrgMap>({});
  const [donation, setDonation] = useState<DonationData | null>(null);

  const isHome = path === '/' || path === '';
  const isEvents = path === '/events' || path.startsWith('/events/');
  const isTeam = path === '/team';
  const isDonate = path === '/donate';

  useEffect(() => {
    if (!supabase) return;
    // org settings needed on every page
    supabase.from('organization_settings').select('key, value').eq('is_public', true).then(({ data }) => {
      if (data) { const map: OrgMap = {}; (data as { key: string; value: string }[]).forEach((r) => { map[r.key] = r.value; }); setOrg(map); }
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
    if (isDonate) {
      supabase.from('donation_settings').select('*').limit(1).single().then(({ data }) => {
        if (data) setDonation(data as DonationData);
      });
    }
  }, [path]);

  return { events, featuredEvents, team, allTeam, testimonials, reels, org, donation };
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const { events, featuredEvents, team, allTeam, testimonials, reels, org, donation } = useSiteData(path);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
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
  if (path === '/about') return <About org={org} />;
  if (path === '/events') return <EventsPage events={events} />;
  if (path === '/team') return <Team team={allTeam} org={org} />;
  if (path === '/testimonials') return <Testimonials testimonials={testimonials} org={org} />;
  if (path === '/donate') return <Donate donation={donation} org={org} />;
  if (path === '/contact') { window.location.replace('/#contact'); return null; }
  if (path.startsWith('/events/')) return <EventDetail event={events.find((item) => item.slug === path.split('/')[2]) ?? events[0]} />;
  return <Home events={events} featuredEvents={featuredEvents} team={team} testimonials={testimonials} reels={reels} org={org} />;
}
export default App;
