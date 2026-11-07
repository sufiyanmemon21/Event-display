import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, Building2, Cake, Flower2, Heart, Images, Music2, Trees } from 'lucide-react';
import HeroSection from '@/components/landing/HeroSection';
import PublicPageShell from '@/components/landing/PublicPageShell';
import ExpoCollection from '@/components/landing/ExpoCollection';
import useExpos, { isExpo } from '@/hooks/useExpos';
import birthdayImage from '@/assets/birthday.avif';
import weddingImage from '@/assets/wedding.avif';
import gardenImage from '@/assets/last.avif';
import receptionImage from '@/assets/Main.jpg';
import concertImage from '@/assets/live concerts.avif';
import LandingExtras from '@/components/landing/LandingExtras';
import './celebration.css';

const occasions = [
  { name: 'Birthdays', icon: Cake, photo: birthdayImage, alt: 'Pink balloon garland and birthday cake' },
  { name: 'Showers', icon: Flower2, photo: gardenImage, alt: 'Garden celebration with bright floral arrangements' },
  { name: 'Weddings', icon: Heart, photo: weddingImage, alt: 'Neutral outdoor wedding ceremony setting' },
  { name: 'Corporate events', icon: Building2, photo: receptionImage, alt: 'Reception tables set for a formal gathering' },
  { name: 'Live events', icon: Music2, photo: concertImage, alt: 'Blue-lit stage at a live music event' },
  { name: 'Outdoor gatherings', icon: Trees, photo: gardenImage, alt: 'Rows of gold chairs along a garden aisle' },
];

const packages = ['Classic', 'Signature', 'Bespoke'];
const galleryPreview = occasions.filter(({ name }) => ['Birthdays', 'Weddings', 'Live events'].includes(name));

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
  const catalog = useExpos();
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

        <section id="about" className="celebration-wrap celebration-intro" aria-labelledby="about-title">
          <div>
            <p className="celebration-kicker">Events and celebrations</p>
            <h2 id="about-title">About <em>EventSphere</em></h2>
            <p>EventSphere brings attendees, organizers, and exhibitors together. Discover local events and expos, check what’s happening, and book a place when you’re ready.</p>
            <p>Planning a gathering of your own? Explore ideas for birthdays, weddings, and corporate events, then share your plans with us through the inquiry form.</p>
          </div>
          <img src={receptionImage} alt="Tables set with flowers for a formal reception" loading="lazy" />
        </section>

        <ExpoCollection data={{ ...catalog, items: eventItems }} kind="events" limit={3} />
        <ExpoCollection data={{ ...catalog, items: expoItems }} kind="expos" limit={3} />

        <LandingExtras photos={galleryPreview} />

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
            <label>Package<select name="package">
              <option value="">Help me decide</option>
              {packages.map((name) => <option key={name}>{name}</option>)}
            </select></label>
            <label>Tell us about your event<textarea name="message" rows={3} required /></label>
            <button className="celebration-button" type="submit">Open email draft <ArrowUpRight size={16} /></button>
          </form>
        </section>
      </main>
    </PublicPageShell>
  );
}
