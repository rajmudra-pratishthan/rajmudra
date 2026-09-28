import { MessageCircle } from 'lucide-react';
import { Header, Footer, InnerHero } from './shared';
import { fallbackTestimonials, images } from './constants';
import type { OrgMap, Testimonial } from './types';

export function TestimonialsPage({ testimonials, org }: { testimonials: Testimonial[]; org: OrgMap }) {
  const list = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  return (
    <><Header org={org} /><main className="inner-page">
      <InnerHero label="Community trust" title="Testimonials" desc="Words of appreciation from people who have shared our journey." image={images.culture} />
      <section className="section testimonial-section"><div className="container">
        <div className="testimonial-grid">
          {list.map((t, i) => (
            <article className="quote-card" key={t.id || i}>
              <MessageCircle size={22} />
              <p>{`\u201C${t.message}\u201D`}</p>
              <strong>{t.name}</strong>
              <span>{t.designation}{t.organization ? ` · ${t.organization}` : ''}</span>
              <small>0{i + 1}</small>
            </article>
          ))}
        </div>
      </div></section>
    </main><Footer org={org} /></>
  );
}
