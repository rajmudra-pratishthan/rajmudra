import { useState, useMemo } from 'react';
import { ArrowRight, Award, CalendarDays, ChevronDown, ChevronLeft, Heart, Sparkles } from 'lucide-react';
import { Header, Footer, SectionLabel, Button, InnerHero } from './shared';
import { images } from './constants';
import type { Event, OrgMap } from './types';

export function EventCard({ event }: { event: Event }) {
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

export function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="section events-section">
      <div className="container">
        <div className="section-heading">
          <div><SectionLabel>Moments that bring us together</SectionLabel><h2>Our events</h2></div>
          <Button href="/events" secondary>View all events</Button>
        </div>
        <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.slug} />)}</div>
      </div>
    </section>
  );
}

export function EventsPage({ events, org }: { events: Event[]; org: OrgMap }) {
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
    <><Header org={org} /><main className="inner-page">
      <InnerHero label="Programs and celebrations" title="Events" desc="Gatherings, festivals and initiatives that connect our community." image={images.culture} />
      <section className="section events-list"><div className="container">
        <div className="search-row">
          <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" /></div>
          <div className="year-filter-wrap">
            <button className="filter-button" onClick={() => setYearOpen(o => !o)}>{year || 'All years'} <ChevronDown size={16} /></button>
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
    </main><Footer org={org} /></>
  );
}

export function EventDetail({ event, org }: { event: Event; org: OrgMap }) {
  const [liked, setLiked] = useState(false);
  return (
    <><Header org={org} /><main className="inner-page detail-page"><div className="container">
      <a className="back-link" href="/events"><ChevronLeft size={16} /> All events</a>
      <div className="detail-hero">
        <img src={event.image_url} alt={event.title} />
        <div className="detail-overlay">
          <span>{event.category}</span><h1>{event.title}</h1>
          <div><CalendarDays size={16} /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} <span>·</span> {event.location}</div>
        </div>
      </div>
      <div className="detail-grid">
        <article>
          <SectionLabel>About the event</SectionLabel>
          <h2>A beautiful moment <em>together.</em></h2>
          <p>{event.description}</p>
          <p>Children, students, parents and senior citizens come together for an experience that reflects our commitment to an active, connected community.</p>
          <div className="highlight-box"><h3>Event highlights</h3>{(event.highlights ?? []).map((h) => <span key={h}><Sparkles size={15} /> {h}</span>)}</div>
        </article>
        <aside className="detail-aside">
          <button className={`like-button ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}><Heart size={19} fill={liked ? 'currentColor' : 'none'} /> Like <span>{liked ? '1' : '0'}</span></button>
          <div className="thanks-card"><Award size={22} /><h3>With thanks</h3><p>Our heartfelt thanks to every volunteer, supporter, donor and community member who makes these initiatives possible.</p></div>
        </aside>
      </div>
    </div></main><Footer org={org} /></>
  );
}
