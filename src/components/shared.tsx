import { useState, useEffect, type ReactNode } from 'react';
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';
import { navItems } from './constants';
import type { OrgMap } from './types';

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="section-label"><span />{children}</div>;
}

export function Button({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={`button ${secondary ? 'button-light' : ''}`} href={href}>{children}<ArrowRight size={16} /></a>;
}

export function Logo({ compact = false, org = {} as OrgMap }: { compact?: boolean; org?: OrgMap }) {
  const name = org.org_name_english || 'Rajmudra Pratishthan';
  const logoSrc = org.logo_url || '/logo.png';
  return (
    <a href="/" className={`brand ${compact ? 'brand-compact' : ''}`} aria-label={`${name} home`}>
      <img src={logoSrc} alt={`${name} official logo`} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
      <span><strong>{name}</strong><small>Social & Cultural Organization</small></span>
    </a>
  );
}

export function Header({ org = {} as OrgMap }: { org?: OrgMap }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  function navigate(href: string) {
    setOpen(false);
    const [p, hash] = href.split('#');
    const targetPath = p || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (hash) {
      window.history.replaceState({}, '', href);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Logo org={org} />
        <nav className={open ? 'mobile-open' : ''}>
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={(e) => { e.preventDefault(); navigate(href); }}>{label}</a>)}
          <a className="header-donate" href="/donate" onClick={(e) => { e.preventDefault(); navigate('/donate'); }}>Donate <ArrowRight size={15} /></a>
        </nav>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </header>
  );
}

export function Footer({ org }: { org: OrgMap }) {
  const name = org.org_name_english || 'Rajmudra Pratishthan';
  const address = org.address || 'Maharashtra, India';
  const email = org.email || 'Official email coming soon';
  const tagline = org.description || 'Working for society, rooted in culture.\nTogether, we can shape a better tomorrow.';
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container footer-top">
        <div><Logo compact org={org} /><p>{tagline}</p></div>
        <div className="footer-links"><strong>Quick links</strong>{navItems.slice(0, 5).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div>
        <div className="footer-links"><strong>Contact</strong><span>{address}</span><span>{email}</span><a href="/#contact">Contact us <ArrowRight size={14} /></a></div>
        <div className="footer-note"><ShieldCheck size={18} /><span>Trust, transparency<br />and community.</span></div>
      </div>
      <div className="container footer-bottom">
        <span>© {year} {name}. All rights reserved.</span>
        <span>Privacy Policy · Donation Policy</span>
      </div>
    </footer>
  );
}

export function InnerHero({ label, title, desc, image }: { label: string; title: string; desc: string; image: string }) {
  return (
    <div className="inner-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="inner-hero-wash" />
      <div className="container"><SectionLabel>{label}</SectionLabel><h1>{title}<span>.</span></h1><p>{desc}</p></div>
    </div>
  );
}
