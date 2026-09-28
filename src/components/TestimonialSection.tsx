import { SectionLabel } from './shared';
import { fallbackTestimonials } from './constants';
import type { Testimonial } from './types';

export function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
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
