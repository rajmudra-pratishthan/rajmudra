import { Header, Footer, SectionLabel, Button } from './shared';
import { HeroSection } from './HeroSection';
import { Stats, WorkSection } from './AboutSection';
import { EventsSection } from './EventsSection';
import { TeamSlider } from './TeamSection';
import { TestimonialSection } from './TestimonialSection';
import { ReelsSection } from './ReelsSection';
import { ContactSection } from './ContactSection';
import type { Event, TeamMember, Testimonial, Reel, OrgMap, SiteSettings } from './types';

export function HomePage({ featuredEvents, team, testimonials, reels, org, site }: {
  featuredEvents: Event[]; team: TeamMember[]; testimonials: Testimonial[];
  reels: Reel[]; org: OrgMap; site: SiteSettings;
}) {
  const showInstagram = site.show_instagram_section !== 'false';
  const showTestimonials = site.show_testimonials !== 'false';
  const showDonateCta = site.donate_cta_enabled !== 'false';
  return (
    <><Header org={org} /><main>
      <HeroSection org={org} site={site} />
      <EventsSection events={featuredEvents} />
      <Stats org={org} />
      <WorkSection />
      <TeamSlider team={team} />
      {showTestimonials && <TestimonialSection testimonials={testimonials} />}
      {showInstagram && <ReelsSection reels={reels} org={org} />}
      <ContactSection org={org} />
      {showDonateCta && (
        <section className="cta-strip"><div className="container"><div><SectionLabel>Your support matters</SectionLabel><h2>Make a difference in the community.</h2></div><Button href="/donate">Donate now</Button></div></section>
      )}
    </main><Footer org={org} /></>
  );
}
