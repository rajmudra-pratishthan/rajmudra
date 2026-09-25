import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
const AdminApp = lazy(() => import('./admin/AdminApp'));
import { ArrowRight, ArrowLeft, Award, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleArrowOutUpRight, Heart, Instagram, Landmark, Menu, MessageCircle, Palette, Send, ShieldCheck, Sparkles, Trophy, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Event = { id?: string; slug: string; title: string; description: string; category: string; event_date: string; location: string; image_url: string; highlights?: string[] };
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

const navItems = [['Home', '/'], ['About us', '/about'], ['Our work', '/#work'], ['Events', '/events'], ['Our team', '/team'], ['Contact', '/#contact']];
const teamMembers: { position: string; occupation: string; image: string }[] = [
  { position: 'President', occupation: 'Social service', image: images.community },
  { position: 'Vice President', occupation: 'Community development', image: images.gathering },
  { position: 'Secretary', occupation: 'Education', image: images.education },
  { position: 'Treasurer', occupation: 'Finance & operations', image: images.school },
  { position: 'Program coordinator', occupation: 'Arts and culture', image: images.festival },
  { position: 'Outreach lead', occupation: 'Sports and youth', image: images.sports },
];
const testimonials: { quote: string; author: string; role: string }[] = [
  { quote: 'The organization\u2019s community-first initiatives and consistent work are truly inspiring.', author: 'Community well-wisher', role: 'Appreciation Message' },
  { quote: 'Their work to preserve culture while involving the next generation is deeply admirable.', author: 'School teacher', role: 'Education partner' },
  { quote: 'This is a sincere organization that brings every part of the community into the conversation.', author: 'Local resident', role: 'Community member' },
  { quote: 'Watching children and elders celebrate together at their events is a beautiful sight.', author: 'Volunteer', role: 'Active member' },
  { quote: 'They turned a simple idea into a movement that now touches thousands of lives.', author: 'Donor', role: 'Supporter' },
];
function useSlider(count: number, perView: number) {
  const [index, setIndex] = useState(0);
  const max = Math.max(0, count - perView);
  const next = useCallback(() => setIndex((i) => (i >= max ? 0 : i + 1)), [max]);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? max : i - 1)), [max]);
  const canNext = index < max;
  const canPrev = index > 0;
  return { index, next, prev, canNext, canPrev, setIndex, max };
}
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
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}><div className="container header-inner"><Logo />
    <nav className={open ? 'mobile-open' : ''}>{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}<a className="header-donate" href="/donate">Donate <ArrowRight size={15} /></a></nav>
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
function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
        <StatCounter value={10} suffix="+" label="Years of social service" />
        <StatCounter value={50} suffix="+" label="Active members" />
        <StatCounter value={100} suffix="+" label="Social and cultural initiatives" />
        <StatCounter value={1000} suffix="+" label="Families connected" />
      </div>
    </section>
  );
}
function WorkSection() { return <section className="section work-section" id="work"><div className="container"><div className="section-heading"><div><SectionLabel>Our direction</SectionLabel><h2>What we do<span>?</span></h2></div><p>We create opportunities, preserve culture and bring people together through meaningful action.</p></div><div className="focus-grid">{focusAreas.map(({ title, text, icon: Icon }) => <article className="focus-card" key={title}><div className="focus-icon"><Icon size={24} strokeWidth={1.8} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>; }
function EventCard({ event }: { event: Event }) { return <article className="event-card"><a href={`/events/${event.slug}`} className="event-image"><img src={event.image_url} alt={event.title} loading="lazy" /><span>{event.category}</span></a><div className="event-content"><div className="event-date"><CalendarDays size={16} /><strong>{new Date(event.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div><h3><a href={`/events/${event.slug}`}>{event.title}</a></h3><p>{event.description}</p><div className="event-meta"><span>{event.location}</span><a href={`/events/${event.slug}`}>View details <ArrowRight size={15} /></a></div></div></article>; }
function EventsSection({ events }: { events: Event[] }) { return <section className="section events-section"><div className="container"><div className="section-heading"><div><SectionLabel>Moments that bring us together</SectionLabel><h2>Upcoming events</h2></div><Button href="/events" secondary>View all events</Button></div><div className="events-grid">{events.slice(0, 3).map((event) => <EventCard event={event} key={event.slug} />)}</div></div></section>; }

function TimelineSection() { const items = [['26 January', 'Republic Day', 'Flag hoisting, food support and gratitude for community contributors'], ['14 April', 'Dr. B. R. Ambedkar Jayanti', 'A message of equality and meaningful social initiatives'], ['15 August', 'Independence Day', 'School kits, books and educational support for students'], ['March–April', 'Shivaji Maharaj Birth Celebration', 'Competitions, art, sport and a community-wide celebration'], ['Dussehra · Diwali', 'Community gratitude', 'Mahaprasad, appreciation, gifts and time together']]; return <section className="section timeline-section"><div className="container timeline-grid"><div><SectionLabel>Across the year</SectionLabel><h2>Rooted in tradition,<br /><em>moving forward.</em></h2><p>Every festival, initiative and gathering is a chance to deepen our connection with the community.</p></div><div className="timeline">{items.map(([date, title, text], index) => <div className="timeline-item" key={title}><div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div><div><span>{date}</span><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></section>; }
function InstagramSection() { return <section className="section instagram-section"><div className="container"><div className="section-heading"><div><SectionLabel>Digital memories</SectionLabel><h2>Moments from Instagram</h2></div><a className="instagram-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={17} /> @rajmudrapratishthan <CircleArrowOutUpRight size={15} /></a></div><div className="reel-row">{[images.culture, images.rangoli, images.sports, images.community].map((image, index) => <a className="reel-card" href="https://instagram.com" target="_blank" rel="noreferrer" key={image}><img src={image} alt="Rajmudra Pratishthan Instagram moment" loading="lazy" /><span><Instagram size={18} /> 0{index + 1}</span></a>)}</div></div></section>; }
function Footer() { return <footer><div className="container footer-top"><div><Logo compact /><p>Working for society, rooted in culture.<br />Together, we can shape a better tomorrow.</p></div><div className="footer-links"><strong>Quick links</strong>{navItems.slice(0, 5).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div><div className="footer-links"><strong>Contact</strong><span>Maharashtra, India</span><span>Official details coming soon</span><a href="/#contact">Contact us <ArrowRight size={14} /></a></div><div className="footer-note"><ShieldCheck size={18} /><span>Trust, transparency<br />and community.</span></div></div><div className="container footer-bottom"><span>© 2026 Rajmudra Pratishthan. All rights reserved.</span><span>Privacy Policy · Donation Policy</span></div></footer>; }
function TeamSlider() {
  const perView = 3; const { index, next, prev, canNext, canPrev, max } = useSlider(teamMembers.length, perView);
  return <section className="section team-slider-section" id="team-preview"><div className="container"><div className="section-heading"><div><SectionLabel>The people behind the work</SectionLabel><h2>Meet our team</h2></div><div className="slider-nav"><button onClick={prev} disabled={!canPrev} aria-label="Previous"><ArrowLeft size={18} /></button><button onClick={next} disabled={!canNext} aria-label="Next"><ArrowRight size={18} /></button></div></div><div className="slider-viewport"><div className="slider-track" style={{ transform: `translateX(-${index * (100 / perView)}%)` }}>{teamMembers.map((member, i) => <article className="member-card slider-slide" key={i} style={{ width: `${100 / perView}%` }}><img src={member.image} alt={member.position} loading="lazy" /><div><span>{member.position}</span><h3>Name coming soon</h3><p>{member.occupation}</p></div></article>)}</div></div><div className="slider-dots">{Array.from({ length: max + 1 }).map((_, i) => <button key={i} className={i === index ? 'active' : ''} onClick={() => {}} aria-label={`Go to slide ${i + 1}`} />)}</div><div className="slider-cta"><Button href="/team">Meet our whole team</Button></div></div></section>;
}
function TestimonialSlider() {
  const track = [...testimonials, ...testimonials];
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
              <p className="testi-text">{t.quote}</p>
              <div className="testi-user">
                <div className="testi-img">{t.author.charAt(0)}</div>
                <div className="testi-info">
                  <strong className="testi-name">{t.author}</strong>
                  <span className="testi-meta">{t.role} &middot; Rajmudra Pratishthan</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function HomeContact() {
  const [sent, setSent] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); if (supabase) { const { error: submitError } = await supabase.from('contact_messages').insert({ name: String(form.get('name')), phone: String(form.get('phone')), email: String(form.get('email')), message: String(form.get('message')) }); if (submitError) { setError('There was a problem sending your message. Please try again.'); return; } } setSent(true); }
  return <section className="section home-contact-section" id="contact"><div className="container home-contact-grid"><div className="contact-info"><SectionLabel>Get in touch</SectionLabel><h2>Let's make something <em>meaningful.</em></h2><p>Your time, skills and support can all make a lasting difference.</p><div className="contact-lines"><span><strong>Location</strong>Maharashtra, India</span><span><strong>Email</strong>Official email coming soon</span><span><strong>Phone / WhatsApp</strong>Official number coming soon</span></div></div><div className="contact-form-wrap">{sent ? <div className="success-state"><div><Send size={22} /></div><h3>Message received.</h3><p>Thank you for reaching out. Our team will get back to you soon.</p><a href="/">Back to home <ArrowRight size={15} /></a></div> : <form onSubmit={submit}><h3>Send a message</h3><label>Your name<input name="name" required placeholder="Full name" /></label><div className="form-row"><label>Phone<input name="phone" required placeholder="Phone number" /></label><label>Email<input name="email" required type="email" placeholder="Email address" /></label></div><label>Your message<textarea name="message" required rows={5} placeholder="How can we help?" /></label>{error && <p className="form-error">{error}</p>}<button className="button" type="submit">Send message <Send size={16} /></button></form>}</div></div></section>;
}
function Home({ events }: { events: Event[] }) { return <><Header /><main><Hero /><EventsSection events={events} /><Stats /><WorkSection /><TeamSlider /><TestimonialSlider /><InstagramSection /><HomeContact /><section className="cta-strip"><div className="container"><div><SectionLabel>Your support matters</SectionLabel><h2>Make a difference in the community.</h2></div><Button href="/donate">Donate now</Button></div></section></main><Footer /></>; }
function About() { return <><Header /><main className="inner-page"><InnerHero label="Our identity" title="About us" desc="More than a decade of social service, culture and community development." image={images.gathering} /><section className="section about-content"><div className="container about-grid"><div><img src={images.community} alt="Community members gathered together" loading="lazy" /></div><div><SectionLabel>Rajmudra Pratishthan</SectionLabel><h2>One organization. Many dreams. <em>One shared journey.</em></h2><p>Rajmudra Pratishthan is a Maharashtra-based social and cultural organization. We work across education, art, sport, culture and community development, bringing every part of society into the conversation.</p><div className="about-facts"><span><strong>2015</strong>Founded</span><span><strong>50+</strong>Active members</span><span><strong>6</strong>Focus areas</span></div></div></div></section><TimelineSection /></main><Footer /></>; }
function EventsPage({ events }: { events: Event[] }) { const [query, setQuery] = useState(''); const filtered = useMemo(() => events.filter((event) => event.title.toLowerCase().includes(query.toLowerCase()) || event.category.toLowerCase().includes(query.toLowerCase())), [events, query]); return <><Header /><main className="inner-page"><InnerHero label="Programs and celebrations" title="Events" desc="Gatherings, festivals and initiatives that connect our community." image={images.culture} /><section className="section events-list"><div className="container"><div className="search-row"><div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" /></div><button className="filter-button">All years <ChevronDown size={16} /></button></div><div className="events-grid">{filtered.map((event) => <EventCard event={event} key={event.slug} />)}</div>{filtered.length === 0 && <div className="empty-state">No events matched your search.</div>}</div></section></main><Footer /></>; }
function EventDetail({ event }: { event: Event }) { const [liked, setLiked] = useState(false); return <><Header /><main className="inner-page detail-page"><div className="container"><a className="back-link" href="/events"><ChevronLeft size={16} /> All events</a><div className="detail-hero"><img src={event.image_url} alt={event.title} /><div className="detail-overlay"><span>{event.category}</span><h1>{event.title}</h1><div><CalendarDays size={16} /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} <span>·</span> {event.location}</div></div></div><div className="detail-grid"><article><SectionLabel>About the event</SectionLabel><h2>A beautiful moment <em>together.</em></h2><p>{event.description}</p><p>Children, students, parents and senior citizens come together for an experience that reflects our commitment to an active, connected community.</p><div className="highlight-box"><h3>Event highlights</h3>{(event.highlights ?? []).map((highlight) => <span key={highlight}><Sparkles size={15} /> {highlight}</span>)}</div></article><aside className="detail-aside"><button className={`like-button ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}><Heart size={19} fill={liked ? 'currentColor' : 'none'} /> Like <span>{liked ? '1' : '0'}</span></button><div className="thanks-card"><Award size={22} /><h3>With thanks</h3><p>Our heartfelt thanks to every volunteer, supporter, donor and community member who makes these initiatives possible.</p></div></aside></div></div></main><Footer /></>; }

function Donate() { return <><Header /><main className="inner-page"><InnerHero label="Your support" title="Donate" desc="Make a difference in the community." image={images.volunteers} /><section className="section donate-section"><div className="container donate-card"><div><Sparkles size={25} /><h2>Your support helps us create more social, educational and cultural opportunities.</h2><p>Please verify official details before making a donation. Public donation information will be added here by the organization.</p></div><div className="donate-placeholder"><Landmark size={32} /><strong>Official details coming soon</strong><span>UPI, QR code and bank details<br />will be published by the organization.</span><ShieldCheck size={17} /><small>Your safety and transparency matter to us.</small></div></div></section></main><Footer /></>; }
function Team() { return <><Header /><main className="inner-page"><InnerHero label="The people behind the work" title="Our team" desc="A dedicated group turning shared values into action." image={images.gathering} /><section className="section team-section"><div className="container"><div className="team-grid">{teamMembers.map((member, i) => <article className="member-card" key={i}><img src={member.image} alt={member.position} loading="lazy" /><div><span>{member.position}</span><h3>Name coming soon</h3><p>{member.occupation}</p></div></article>)}</div></div></section></main><Footer /></>; }
function Testimonials() { return <><Header /><main className="inner-page"><InnerHero label="Community trust" title="Testimonials" desc="Words of appreciation from people who have shared our journey." image={images.culture} /><section className="section testimonial-section"><div className="container testimonial-grid">{testimonials.map((t, i) => <article className="quote-card" key={i}><MessageCircle size={22} /><p>{`\u201C${t.quote}\u201D`}</p><strong>{t.author}</strong><span>{t.role} · Rajmudra Pratishthan</span><small>0{i + 1}</small></article>)}</div></section></main><Footer /></>; }
function App() { const [events, setEvents] = useState<Event[]>(sampleEvents); useEffect(() => { if (!supabase) return; supabase.from('public_events').select('*').eq('is_published', true).order('event_date', { ascending: true }).then(({ data }) => { if (data && data.length > 0) setEvents(data as Event[]); }); }, []); const path = window.location.pathname; if (path.startsWith('/admin')) return <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading…</div>}><AdminApp /></Suspense>; if (path === '/about') return <About />; if (path === '/events') return <EventsPage events={events} />; if (path === '/team') return <Team />; if (path === '/testimonials') return <Testimonials />; if (path === '/donate') return <Donate />; if (path === '/contact') { window.location.replace('/#contact'); return null; } if (path.startsWith('/events/')) return <EventDetail event={events.find((item) => item.slug === path.split('/')[2]) ?? events[0]} />; return <Home events={events} />; }
export default App;
