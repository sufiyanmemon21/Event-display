import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Building2, Cake, Flower2, Heart, Images, Music2, Trees } from 'lucide-react';
import HeroSection from '@/components/landing/HeroSection';
import PublicPageShell from '@/components/landing/PublicPageShell';
import ExpoCollection from '@/components/landing/ExpoCollection';
import useExpos, { isExpo } from '@/hooks/useExpos';
import birthdayImage from '@/assets/birthday.avif';
import weddingImage from '@/assets/wedding.avif';
import gardenImage from '@/assets/last.avif';
import receptionImage from '@/assets/Main.jpg';
import concertImage from '@/assets/live concerts.avif';
import './celebration.css';

const occasions = [
  { name: 'Birthdays', icon: Cake, photo: birthdayImage, alt: 'Pink balloon garland and birthday cake' },
  { name: 'Showers', icon: Flower2, photo: gardenImage, alt: 'Garden celebration with bright floral arrangements' },
  { name: 'Weddings', icon: Heart, photo: weddingImage, alt: 'Neutral outdoor wedding ceremony setting' },
  { name: 'Corporate events', icon: Building2, photo: receptionImage, alt: 'Reception tables set for a formal gathering' },
  { name: 'Live events', icon: Music2, photo: concertImage, alt: 'Blue-lit stage at a live music event' },
  { name: 'Outdoor gatherings', icon: Trees, photo: gardenImage, alt: 'Rows of gold chairs along a garden aisle' },
];

const packages = [
  { name: 'Classic', title: 'The essentials', description: 'A focused setup for smaller gatherings and intimate celebrations.' },
  { name: 'Signature', title: 'Room to celebrate', description: 'A coordinated look for birthdays, showers, and milestone events.', featured: true },
  { name: 'Bespoke', title: 'Made for your occasion', description: 'A custom plan for larger events with more moving parts.' },
];

function openInquiry(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`EventSphere inquiry · ${form.get('package') || 'General inquiry'}`);
  const body = encodeURIComponent(`Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`);
  window.location.href = `mailto:hello@eventsphere.com?subject=${subject}&body=${body}`;
}

export default function EventSphereHome() {
  const { hash, key } = useLocation();
  const [occasion, setOccasion] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const catalog = useExpos();
  const upcoming = catalog.items.find((item) => isExpo(item) && Date.parse(item.date) >= catalog.fetchedAt);
  const latest = [...catalog.items].sort((left, right) =>
    (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0),
  );
  const expoItems = latest.filter(isExpo);
  const eventItems = latest.filter((item) => !isExpo(item));
  const photos = occasion ? occasions.filter(({ name }) => name === occasion) : occasions.slice(0, 4);

  useEffect(() => {
    document.title = 'EventSphere — Events & Celebrations';
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return (
    <PublicPageShell>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-4">
        Skip to content
      </a>
      <main id="main-content" className="celebration-page" tabIndex={-1}>
        <HeroSection />

        <section id="gallery" className="celebration-wrap celebration-gallery" aria-label="Celebration gallery">
          <div className="celebration-occasions" role="group" aria-label="Filter gallery by occasion">
            {occasions.map(({ name, icon: Icon }) => (
              <button key={name} type="button" aria-pressed={occasion === name} aria-controls="occasion-photos" onClick={() => setOccasion(occasion === name ? '' : name)}>
                <Icon size={25} strokeWidth={1.2} aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>
          <div id="occasion-photos" className={`celebration-photos${occasion ? ' is-filtered' : ''}`}>
            {photos.map(({ name, photo, alt }) => (
              <figure key={name}>
                <img src={photo} alt={alt} loading="lazy" />
                <figcaption>{name}</figcaption>
              </figure>
            ))}
            {occasion && (
              <div className="celebration-gallery-note">
                <p className="celebration-kicker">In the gallery</p>
                <h2>{occasion}</h2>
                <button type="button" className="celebration-text-link" onClick={() => setOccasion('')}>Show all occasions <Images size={16} /></button>
              </div>
            )}
          </div>
        </section>

        <section id="about" className="celebration-wrap celebration-intro">
          <div>
            <p className="celebration-kicker">The EventSphere approach</p>
            <h2>We bring it together.<br /><em>You celebrate.</em></h2>
            <p>Start with the kind of gathering you have in mind. Browse real expos, find ideas for your own celebration, or get in touch to discuss the details.</p>
            <Link className="celebration-button" to="/gallery">Visit the gallery <ArrowRight size={16} /></Link>
          </div>
          <aside className="celebration-note">
            <p className="celebration-kicker">From the live event catalog</p>
            <h3>{upcoming?.title || 'Find your next event'}</h3>
            <p>{upcoming ? upcoming.location : 'See what organizers are planning and find a gathering worth making time for.'}</p>
            <Link className="celebration-text-link" to={upcoming ? `/expos/${upcoming._id}` : '/expos'}>
              {upcoming ? 'View expo details' : 'Browse expos'} <ArrowUpRight size={15} />
            </Link>
          </aside>
        </section>

        <ExpoCollection data={{ ...catalog, items: eventItems }} kind="events" limit={3} />
        <ExpoCollection data={{ ...catalog, items: expoItems }} kind="expos" limit={3} />

        <section id="packages" className="celebration-packages" aria-labelledby="packages-title">
          <div className="celebration-wrap">
            <p className="celebration-kicker">Start with what you need</p>
            <h2 id="packages-title">Celebration packages</h2>
            <div className="celebration-package-grid">
              {packages.map(({ name, title, description, featured }) => (
                <article key={name} className="celebration-package">
                  {featured && <p className="celebration-package-label">Featured package</p>}
                  <h3>{name}</h3>
                  <p className="celebration-package-title">{title}</p>
                  <p>{description}</p>
                  <Link className="celebration-button" to="/#inquire" onClick={() => setSelectedPackage(name)}>Request a quote <ArrowUpRight size={14} /></Link>
                </article>
              ))}
            </div>
            <div className="celebration-package-footer">
              <Link className="celebration-text-link celebration-services-link" to="/services">Explore our services <ArrowRight size={16} /></Link>
              <Link to="/gallery" className="celebration-filmstrip" aria-label="Explore the event gallery">
                {occasions.slice(0, 4).map(({ name, photo }) => <img key={name} src={photo} alt="" loading="lazy" />)}
              </Link>
            </div>
          </div>
        </section>

        <section id="inquire" className="celebration-wrap celebration-inquiry" aria-labelledby="inquiry-title">
          <div>
            <p className="celebration-kicker">Make it yours</p>
            <h2 id="inquiry-title">Let’s plan your next gathering.</h2>
            <p>Tell us what you have in mind, from the occasion and date to the details you already know.</p>
          </div>
          <img src={receptionImage} alt="Tables set with candles and flowers for a reception" loading="lazy" />
          <form onSubmit={openInquiry} className="celebration-form">
            <h3>Send an inquiry</h3>
            <label>Your name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
            <label>Package<select name="package" value={selectedPackage} onChange={(event) => setSelectedPackage(event.target.value)}>
              <option value="">Help me decide</option>
              {packages.map(({ name }) => <option key={name}>{name}</option>)}
            </select></label>
            <label>Tell us about your event<textarea name="message" rows={3} required /></label>
            <button className="celebration-button" type="submit">Open email draft <ArrowUpRight size={16} /></button>
          </form>
        </section>
      </main>
    </PublicPageShell>
  );
}
