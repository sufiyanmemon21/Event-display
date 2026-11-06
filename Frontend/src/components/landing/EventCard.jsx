import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isExpo } from '@/hooks/useExpos';
import { getEventImage } from './eventImages';
import './catalog-finishes.css';

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric' });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'short' });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });

export default function EventCard({ event, index = 0 }) {
  const date = new Date(event.date);
  const hasDate = Boolean(event.date) && Number.isFinite(date.getTime());
  const kind = isExpo(event) ? 'Expo' : 'Event';

  return (
    <Link to={`/expos/${event._id}`} className="celebration-listing" data-kind={kind} aria-label={`Book now: ${event.title}`}>
      <article className="celebration-listing-ticket">
        <div className="celebration-listing-photo">
          <img src={getEventImage(event, index)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-center" />
          <span className="celebration-listing-kind">{kind}</span>
          {hasDate && <time className="celebration-listing-date" dateTime={date.toISOString()} aria-label={fullDateFormat.format(date)}>
            <strong>{dayFormat.format(date)}</strong><span>{monthFormat.format(date)}</span>
          </time>}
        </div>
        <div className="celebration-listing-details">
          <p className="celebration-listing-category">{event.category || kind}</p>
          <h3>{event.title}</h3>
          <div className="celebration-listing-meta">
            <p>{event.organizer?.name && <>by {event.organizer.name}</>}</p>
            <p><MapPin size={15} aria-hidden="true" /> <span>{event.location || 'Location to be announced'}</span></p>
          </div>
          <p className="celebration-listing-description">{event.description || 'More details will be shared by the organizer.'}</p>
        </div>
        <div className="celebration-listing-stub">
          <p>{hasDate ? fullDateFormat.format(date) : 'Date to be announced'}</p>
          <span className="celebration-listing-action">Book now <span aria-hidden="true"><ArrowUpRight size={17} /></span></span>
        </div>
      </article>
    </Link>
  );
}
