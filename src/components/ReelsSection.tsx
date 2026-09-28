import { CircleArrowOutUpRight, Instagram } from 'lucide-react';
import { SectionLabel } from './shared';
import { fallbackReels, images } from './constants';
import type { OrgMap, Reel } from './types';

function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  return (
    <a className="reel-card" href={reel.reel_url} target="_blank" rel="noreferrer">
      <img src={reel.thumbnail_url || images.culture} alt="Rajmudra Pratishthan Instagram moment" loading="lazy" />
      <span><Instagram size={18} /> 0{index + 1}</span>
    </a>
  );
}

export function ReelsSection({ reels, org }: { reels: Reel[]; org: OrgMap }) {
  const display = reels.length > 0 ? reels : fallbackReels;
  const track = [...display, ...display];
  const igUrl = org.instagram || 'https://instagram.com';
  const igHandle = igUrl.replace(/\/+$/, '').split('/').pop() || 'Instagram';
  return (
    <section className="section instagram-section">
      <div className="container">
        <div className="section-heading">
          <div><SectionLabel>Digital memories</SectionLabel><h2>Moments from Instagram</h2></div>
          <a className="instagram-link" href={igUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> @{igHandle} <CircleArrowOutUpRight size={15} /></a>
        </div>
      </div>
      <div className="reel-marquee-wrap">
        <div className="reel-marquee">
          {track.map((reel, i) => <ReelCard key={i} reel={reel} index={i % display.length} />)}
        </div>
      </div>
    </section>
  );
}
