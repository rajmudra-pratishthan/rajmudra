import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './shared';
import { images } from './constants';
import type { OrgMap, SiteSettings } from './types';

const heroSlides = [images.hero, images.culture, images.education, images.festival];

export function HeroSection({ org, site }: { org: OrgMap; site: SiteSettings }) {
  const [active, setActive] = useState(0);
  const autoplay = site.hero_autoplay !== 'false';
  const speed = parseInt(site.hero_transition_speed || '5000', 10);
  const name = org.org_name_english || 'Rajmudra Pratishthan';
  const tagline = org.mission || 'Working for society, proud of our culture.';
  const description = org.description || `For more than a decade, ${name} has worked across social service, culture, education, sport and art to help communities thrive.`;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setActive((c) => (c + 1) % heroSlides.length), speed);
    return () => window.clearInterval(timer);
  }, [autoplay, speed]);

  return (
    <section className="hero">
      <div className="hero-image" style={{ backgroundImage: `url(${heroSlides[active]})` }}><div className="hero-image-wash" /></div>
      <div className="container hero-content">
        <div className="hero-copy">
          <div className="eyebrow light"><Sparkles size={15} /> Social service · Culture · Education · Sports · Art</div>
          <h1>{tagline.split(',').length > 1
            ? <>{tagline.split(',')[0]},<br /><em>{tagline.split(',').slice(1).join(',').trim()}</em></>
            : tagline}
          </h1>
          <p>{description}</p>
          <div className="hero-actions">
            <Button href="/#work">Explore our work</Button>
            <Button href="/#contact" secondary>Get in touch</Button>
          </div>
        </div>
        <div className="hero-caption">
          <span>0{active + 1} / 04</span>
          <div className="hero-progress">
            {heroSlides.map((_, index) => <button key={index} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} />)}
          </div>
          <span>Community moments</span>
        </div>
      </div>
    </section>
  );
}
