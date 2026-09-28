import { useEffect, useRef } from 'react';
import { Header, Footer, SectionLabel, Button, InnerHero } from './shared';
import { images, fallbackTeam } from './constants';
import type { OrgMap, TeamMember } from './types';

export function MemberCard({ member, index }: { member: TeamMember; index: number }) {
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

export function TeamSlider({ team }: { team: TeamMember[] }) {
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

export function TeamPage({ team, org }: { team: TeamMember[]; org: OrgMap }) {
  const members = team.length > 0 ? team : fallbackTeam;
  return (
    <><Header org={org} /><main className="inner-page">
      <InnerHero label="The people behind the work" title="Our team" desc="A dedicated group turning shared values into action." image={images.gathering} />
      <section className="section team-section"><div className="container">
        <div className="team-cards-grid team-cards-grid-4">
          {members.map((member, i) => <MemberCard key={member.id || i} member={member} index={i} />)}
        </div>
      </div></section>
    </main><Footer org={org} /></>
  );
}
