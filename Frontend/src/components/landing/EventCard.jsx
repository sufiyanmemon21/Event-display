import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEventImage } from './eventImages';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date to be announced'
    : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

export default function EventCard({ event, index = 0 }) {
  return (
    <Link
      to={`/expos/${event._id}`}
      aria-label={`View details for ${event.title}`}
      className="group block overflow-hidden rounded-2xl border border-[#eadfd5] bg-white shadow-[0_8px_24px_rgba(54,27,25,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(54,27,25,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a97818]"
    >
      <article>
        <div className="relative aspect-[1.65] overflow-hidden bg-[#f0e2d9]">
          <img
            src={getEventImage(event, index)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-[#fffaf5]/95 px-3 py-1 text-[11px] font-medium text-[#765122] shadow-sm">
            {event.category || 'Event'}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <h3 className="font-serif text-xl font-semibold leading-snug text-[#321b1f] transition-colors group-hover:text-[#a36f13]">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#756a64]">
            {event.description || 'More details will be shared by the organizer.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#665b54]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#b8872c]" />
              {formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-[#b8872c]" />
              {event.location || 'Location to be announced'}
            </span>
          </div>
          <span className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#c6952d] px-5 text-xs font-semibold text-white transition group-hover:bg-[#a97818]">
            View details <ArrowUpRight size={15} />
          </span>
        </div>
      </article>
    </Link>
  );
}
