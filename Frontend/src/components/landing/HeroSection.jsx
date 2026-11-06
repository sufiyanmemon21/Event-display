import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import birthdayImage from '@/assets/birthday.avif';
import venueImage from '@/assets/Main.jpg';
import useAuth from '@/hooks/useAuth';
import useWebsiteBanner from '@/hooks/useWebsiteBanner';

export default function HeroSection() {
  const user = useAuth();
  const { bannerTitle, bannerDescription, bannerButton, bannerImage } = useWebsiteBanner();
  if (user?.role === 'attendee') {
    const image = bannerImage || venueImage;
    return <section id="home" className="attendee-hero" aria-labelledby="celebration-title" style={{ '--attendee-venue': `url(${image})` }}>
      <div className="celebration-wrap attendee-hero-layout">
        <div>
          <p className="celebration-kicker">Event management platform</p>
          <h1 id="celebration-title">{bannerTitle || 'Find an event worth getting dressed up for.'}</h1>
          <p className="attendee-hero-copy">{bannerDescription || 'Explore events and expos, book your place, and keep your passes ready in your EventSphere profile.'}</p>
          <div className="flex flex-wrap gap-3">
            <Link className="celebration-button" to="/#catalog-events">Explore events <ArrowUpRight size={16} /></Link>
            <Link className="celebration-button attendee-hero-secondary" to="/event-listing">{bannerButton || 'Book now'}</Link>
          </div>
        </div>
        <img src={image} alt={bannerImage ? '' : 'Tables set for an evening reception'} fetchPriority="high" />
      </div>
    </section>;
  }
  return (
    <section id="home" className="celebration-hero" aria-labelledby="celebration-title">
      <img className="celebration-hero-photo" src={bannerImage || birthdayImage} alt={bannerImage ? '' : 'Pink and ivory balloon décor around a birthday cake table'} fetchPriority="high" />
      <div className="celebration-wrap celebration-hero-inner">
        <p className="celebration-kicker">EventSphere · Events & celebrations</p>
        <h1 id="celebration-title">{bannerTitle || <>Beautifully planned.<br /><em>Joyfully celebrated.</em></>}</h1>
        <p>{bannerDescription || 'From intimate celebrations to full-scale expos, bring the people, setting, and details together in one place.'}</p>
        <Link className="celebration-button" to="/#inquire">{bannerButton || 'Plan your event'} <ArrowUpRight size={16} /></Link>
      </div>
    </section>
  );
}
