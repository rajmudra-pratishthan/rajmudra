import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from './shared';
import { focusAreas } from './constants';
import type { OrgMap } from './types';

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

export function Stats({ org }: { org: OrgMap }) {
  const years = parseInt(org.stat_years, 10);
  const members = parseInt(org.member_count, 10);
  const activities = parseInt(org.activity_count, 10);
  const families = parseInt(org.family_count, 10);
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

export function WorkSection() {
  return (
    <section className="section work-section" id="work">
      <div className="container">
        <div className="section-heading">
          <div><SectionLabel>Our direction</SectionLabel><h2>What we do<span>?</span></h2></div>
          <p>We create opportunities, preserve culture and bring people together through meaningful action.</p>
        </div>
        <div className="focus-grid">
          {focusAreas.map(({ title, text, icon: Icon }) => (
            <article className="focus-card" key={title}>
              <div className="focus-icon"><Icon size={24} strokeWidth={1.8} /></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const timelineItems = [
  ['26 January', 'Republic Day', 'Flag hoisting, food support and gratitude for community contributors'],
  ['14 April', 'Dr. B. R. Ambedkar Jayanti', 'A message of equality and meaningful social initiatives'],
  ['15 August', 'Independence Day', 'School kits, books and educational support for students'],
  ['March–April', 'Shivaji Maharaj Birth Celebration', 'Competitions, art, sport and a community-wide celebration'],
  ['Dussehra · Diwali', 'Community gratitude', 'Mahaprasad, appreciation, gifts and time together'],
];

export function TimelineSection() {
  return (
    <section className="section timeline-section">
      <div className="container timeline-grid">
        <div>
          <SectionLabel>Across the year</SectionLabel>
          <h2>Rooted in tradition,<br /><em>moving forward.</em></h2>
          <p>Every festival, initiative and gathering is a chance to deepen our connection with the community.</p>
        </div>
        <div className="timeline">
          {timelineItems.map(([date, title, text], index) => (
            <div className="timeline-item" key={title}>
              <div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div>
              <div><span>{date}</span><h3>{title}</h3><p>{text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
