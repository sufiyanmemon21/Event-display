import { ArrowUpRight, CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isExpo } from '@/hooks/useExpos';
import { getEventImage } from './eventImages';
import './catalog-finishes.css';

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric' });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'short' });
const fullDateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });

function formatTime(value) {
  if (!value) return '';
  const time = new Date(`2000-01-01T${value}:00Z`);
  return Number.isFinite(time.getTime()) ? timeFormat.format(time) : '';
}

export default function EventCard({ event, index = 0 }) {
  const date = new Date(event.date);
  const hasDate = Boolean(event.date) && Number.isFinite(date.getTime());
  const kind = isExpo(event) ? 'Expo' : 'Event';
  const action = 'Book now';
  const startTime = formatTime(event.time);
  const endTime = formatTime(event.endTime);
  const schedule = endTime ? (startTime ? `${startTime} – ${endTime}` : `Ends at ${endTime}`) : startTime;
  const metadata = [
    { label: 'Date', Icon: CalendarDays, value: hasDate ? fullDateFormat.format(date) : 'To be announced' },
    { label: 'Time', Icon: Clock, value: schedule || 'To be announced' },
    { label: 'Location', Icon: MapPin, value: event.location || 'To be announced' },
    { label: 'Theme', Icon: Sparkles, value: event.category || 'To be announced' },
  ];

  return (
    <Link to={`/expos/${event._id}`} className="celebration-listing" data-kind={kind} aria-label={`${action}: ${event.title}`}>
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
          <p className="celebration-listing-description">{event.description || 'More details will be shared by the organizer.'}</p>
          <dl className="celebration-listing-meta">
            {metadata.map(({ label, Icon, value }) => (
              <div key={label}>
                <dt><Icon size={17} aria-hidden="true" />{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="celebration-listing-stub">
          <span className="celebration-listing-action">{action} <span aria-hidden="true"><ArrowUpRight size={17} /></span></span>
        </div>
      </article>
    </Link>
  );
}
