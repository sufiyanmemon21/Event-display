import { useEffect } from 'react';
import PublicPageShell from '@/components/landing/PublicPageShell';
import birthdayImage from '@/assets/birthday.avif';
import concertImage from '@/assets/live concerts.avif';
import weddingImage from '@/assets/wedding.avif';
import planningImage from '@/assets/last.avif';
import eventImage from '@/assets/Event.jpg';
import mainImage from '@/assets/Main.jpg';
import downloadImage from '@/assets/download.jfif';

const galleryImages = [
  [weddingImage, 'A warmly lit outdoor wedding reception'],
  [eventImage, 'An event venue prepared for a gathering'],
  [concertImage, 'A live music performance in vibrant stage lighting'],
  [mainImage, 'A refined venue set for a memorable event'],
  [birthdayImage, 'A joyful birthday celebration'],
  [planningImage, 'A team bringing event plans together'],
  [downloadImage, 'A detail from an event space'],
];

export default function Gallery() {
  useEffect(() => {
    document.title = 'Event Gallery — EventSphere';
  }, []);

  return (
    <PublicPageShell>
      <main className="px-4 pb-16 pt-12 sm:px-7 sm:pt-16">
        <header className="mx-auto mb-9 max-w-2xl text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
            Our moments
          </p>
          <h1 className="font-serif text-4xl font-semibold text-[#321b1f] sm:text-5xl">
            Event <span className="text-[#bd8b2e]">Gallery</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#756a64]">
            Explore memorable moments from weddings, corporate gatherings, birthdays,
            and special celebrations.
          </p>
        </header>
        <div className="mx-auto max-w-6xl columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {galleryImages.map(([src, alt], index) => (
            <figure
              key={src}
              className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-[#eadfd5] bg-white shadow-sm sm:mb-4 sm:rounded-2xl"
            >
              <img
                src={src}
                alt={alt}
                loading={index < 3 ? 'eager' : 'lazy'}
                className={`w-full object-cover transition duration-500 hover:scale-[1.03] ${
                  index % 3 === 0 ? 'aspect-[1.15]' : index % 3 === 1 ? 'aspect-[0.82]' : 'aspect-[1.35]'
                }`}
              />
            </figure>
          ))}
        </div>
      </main>
    </PublicPageShell>
  );
}
