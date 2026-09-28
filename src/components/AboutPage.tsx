import { Header, Footer, SectionLabel, InnerHero } from './shared';
import { TimelineSection } from './AboutSection';
import { images } from './constants';
import type { OrgMap } from './types';

export function AboutPage({ org }: { org: OrgMap }) {
  const name = org.org_name_english || 'Rajmudra Pratishthan';
  const foundationYear = org.foundation_year || '2015';
  const memberCount = org.member_count || '50+';
  const focusCount = org.focus_count || '6';
  const description = org.description || `${name} is a Maharashtra-based social and cultural organization. We work across education, art, sport, culture and community development, bringing every part of society into the conversation.`;
  const mission = org.mission || 'One organization. Many dreams. One shared journey.';
  return (
    <><Header org={org} /><main className="inner-page">
      <InnerHero label="Our identity" title="About us" desc="More than a decade of social service, culture and community development." image={images.gathering} />
      <section className="section about-content"><div className="container about-grid">
        <div><img src={images.community} alt="Community members gathered together" loading="lazy" /></div>
        <div>
          <SectionLabel>{name}</SectionLabel>
          <h2><em>{mission}</em></h2>
          <p>{description}</p>
          <div className="about-facts">
            <span><strong>{foundationYear}</strong>Founded</span>
            <span><strong>{memberCount}</strong>Active members</span>
            <span><strong>{focusCount}</strong>Focus areas</span>
          </div>
        </div>
      </div></section>
      <TimelineSection />
    </main><Footer org={org} /></>
  );
}
