import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { SectionLabel } from './shared';
import { supabase } from '@/lib/supabase';
import type { OrgMap } from './types';

function ContactItem({ icon, value, href, index }: { icon: ReactNode; value: string; href?: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.transitionDelay = `${index * 90}ms`; el.classList.add('contact-item-visible'); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const inner = (
    <>
      <div className="contact-detail-icon">{icon}</div>
      <span>{value}</span>
    </>
  );

  return (
    <div className="contact-detail-item" ref={ref}>
      {href ? <a href={href}>{inner}</a> : inner}
    </div>
  );
}

export function ContactSection({ org }: { org: OrgMap }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const phone = org.phone || '';
  const whatsapp = org.whatsapp || '';
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '';
  const email = org.email || '';
  const registration = org.registration_number || '';
  const address = org.address || '';
  const mapUrl = org.google_maps_url || '';

  const details = [
    phone        && { icon: <Phone size={18} strokeWidth={1.8} />, value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    whatsapp     && { icon: <MessageCircle size={18} strokeWidth={1.8} />, value: whatsapp, href: whatsappHref },
    email        && { icon: <Mail size={18} strokeWidth={1.8} />, value: email, href: `mailto:${email}` },
    registration && { icon: <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1 }}>R</span>, value: registration },
    address      && { icon: <MapPin size={18} strokeWidth={1.8} />, value: address },
  ].filter(Boolean) as { icon: ReactNode; value: string; href?: string }[];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    if (supabase) {
      const { error: submitError } = await supabase.from('contact_messages').insert({
        name: String(form.get('name')), phone: String(form.get('phone')),
        email: '', message: String(form.get('message')),
      });
      if (submitError) { setError('There was a problem sending your message. Please try again.'); return; }
    }
    setSent(true);
  }

  return (
    <section className="section home-contact-section" id="contact">
      <div className="container">
        <div className="home-contact-grid">

          <div className="contact-left">
            <SectionLabel>Get in touch</SectionLabel>
            <div className="contact-details">
              {details.map((d, i) => <ContactItem key={i} icon={d.icon} value={d.value} href={d.href} index={i} />)}
            </div>
            <div className="contact-map">
              {mapUrl ? (
                <iframe src={mapUrl} title="Location map" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
              ) : (
                <div className="contact-map-placeholder">
                  <MapPin size={24} />
                  <span>Map will appear once location is set in admin settings.</span>
                </div>
              )}
            </div>
          </div>

          <div className="contact-form-wrap">
            {sent ? (
              <div className="success-state">
                <div><Send size={22} /></div>
                <h3>Message received.</h3>
                <p>Thank you for reaching out. Our team will get back to you soon.</p>
                <a href="/">Back to home <ArrowRight size={15} /></a>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3>Send a message</h3>
                <label>Your name<input name="name" required placeholder="Full name" /></label>
                <label>Phone<input name="phone" required placeholder="Phone number" /></label>
                <label>Your message<textarea name="message" required rows={4} placeholder="How can we help?" /></label>
                {error && <p className="form-error">{error}</p>}
                <button className="button" type="submit">Send message <Send size={16} /></button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
