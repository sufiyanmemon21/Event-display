import BookLink from "@/components/landing/BookLink";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isPastEvent } from "@/lib/eventDates";
import { isExpo } from "@/hooks/useExpos";
import { getEventImage } from "./eventImages";

const dayFormat = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "short" });
const fullDateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "UTC",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatTime(value) {
  if (!value) return "";
  const time = new Date(`2000-01-01T${value}:00Z`);
  return Number.isFinite(time.getTime()) ? timeFormat.format(time) : "";
}

export default function EventCard({ event, index = 0 }) {
  const date = new Date(event.date);
  const hasDate = Boolean(event.date) && Number.isFinite(date.getTime());
  const expo = isExpo(event);
  const kind = expo ? "Expo" : "Event";
  const closed = expo && isPastEvent(event.date);
  const startTime = formatTime(event.time);
  const endTime = formatTime(event.endTime);
  const schedule = endTime
    ? startTime
      ? `${startTime} – ${endTime}`
      : `Ends at ${endTime}`
    : startTime;
  const metadata = [
    {
      label: "Date",
      Icon: CalendarDays,
      value: hasDate ? fullDateFormat.format(date) : "To be announced",
    },
    { label: "Time", Icon: Clock, value: schedule || "To be announced" },
  ];
  const venueMetadata = [
    {
      label: "Location",
      Icon: MapPin,
      value: event.location || "To be announced",
    },
    {
      label: "Theme",
      Icon: Sparkles,
      value: event.category || "To be announced",
    },
  ];
  const displayMetadata = expo
    ? [...metadata, ...venueMetadata]
    : venueMetadata;

  return (
    <div
      className="celebration-listing group block min-w-0 rounded-2xl text-[#362621]
                   shadow-[0_4px_12px_#52301e0b,0_12px_28px_#52301e08] transition-shadow duration-200 ease-out
                   hover:shadow-[0_14px_32px_#52301e20]
                   focus-visible:[outline:2px_solid_var(--ticket-accent)] focus-visible:outline-offset-4
                   motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      data-kind={kind}
    >
      <article className="celebration-listing-ticket flex flex-col h-full overflow-hidden [border:1px_solid_var(--ticket-line)] rounded-2xl [background:#fffaf5]">
        <div
          className="celebration-listing-photo relative flex-none h-[clamp(132px,_15vw,_188px)] overflow-hidden [background:#e9cfc0]
"
        >
          <img
            src={getEventImage(event, index)}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-center transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
          />
          <span
            className="celebration-listing-kind absolute top-3 [border:1px_solid_#fff8ee] rounded-[4px] [background:#fff7edf2]
          text-[#56392e] left-3 p-[5px_10px] text-[.75rem] font-[650] uppercase tracking-[.09em]"
          >
            {kind}
          </span>
          {expo && hasDate && (
            <time
              className="celebration-listing-date absolute top-3 [border:1px_solid_#fff8ee] rounded-[4px] [background:#fff7edf2]
          text-[#56392e] right-3 grid justify-items-center min-w-[54px] p-[6px_8px]
          [&_strong]:[font:1.55rem/1_Georgia,_serif] [&_span]:text-[.72rem] [&_span]:uppercase [&_span]:tracking-[.08em]"
              dateTime={date.toISOString()}
              aria-label={fullDateFormat.format(date)}
            >
              <strong>{dayFormat.format(date)}</strong>
              <span>{monthFormat.format(date)}</span>
            </time>
          )}
        </div>
        <div
          className="celebration-listing-details flex-1 p-[13px_15px_10px] text-left [overflow-wrap:anywhere]
          [.celebration-listing_&_h3]:[display:-webkit-box] [.celebration-listing_&_h3]:[-webkit-box-orient:vertical]
          [.celebration-listing_&_h3]:[-webkit-line-clamp:2] [.celebration-listing_&_h3]:overflow-hidden
          [.celebration-listing_&_h3]:[font:clamp(1.4rem,_2vw,_1.75rem)/1.11_Georgia,_serif]
          [.celebration-listing_&_h3]:tracking-[-.025em] [.celebration-listing_&_h3]:text-[#452d24]"
        >
          <p
            className="celebration-listing-category [.celebration-listing-details_&]:mb-1
          [.celebration-listing-details_&]:overflow-hidden [.celebration-listing-details_&]:text-ellipsis
          [.celebration-listing-details_&]:whitespace-nowrap [.celebration-listing-details_&]:text-[var(--ticket-accent)]
          [.celebration-listing-details_&]:text-[.73rem] [.celebration-listing-details_&]:font-[650]
          [.celebration-listing-details_&]:uppercase [.celebration-listing-details_&]:tracking-[.1em]"
          >
            {event.category || kind}
          </p>
          <h3>
            <Link className="hover:underline" to={`/expos/${event._id}`}>
              {event.title}
            </Link>
          </h3>
          <p
            className="celebration-listing-description [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]
          overflow-hidden [.celebration-listing-details_&]:mt-2 [.celebration-listing-details_&]:text-[#69534b]
          [.celebration-listing-details_&]:text-[.94rem] [.celebration-listing-details_&]:leading-[1.45]"
          >
            {event.description ||
              "More details will be shared by the organizer."}
          </p>
          {!expo && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f3ead7] px-3 py-1.5 text-xs font-semibold text-[#76500d]">
              <Sparkles size={14} aria-hidden="true" />
              Booking open · Request a spot anytime
            </p>
          )}
          <dl
            className="celebration-listing-meta grid [grid-template-columns:minmax(0,_1.35fr)_minmax(0,_1fr)] gap-[12px_10px]
          mt-[15px] text-[.875rem] leading-[1.4] [&_>_div]:relative [&_>_div]:ps-[25px] [&_dt]:text-[#69534b]
          [&_dt]:text-[.75rem] [&_svg]:absolute [&_svg]:start-0 [&_svg]:top-[.35rem] [&_svg]:text-[#a57514]"
          >
            {displayMetadata.map(({ label, Icon, value }) => (
              <div key={label}>
                <dt>
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[var(--ticket-line)] mx-4 py-3">
          <Link to={`/expos/${event._id}`} className="action-button flex-1" aria-label={`View details: ${event.title}`}>
            View details <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {closed ? <span className="w-full text-center text-sm text-[#69534b]">Bookings closed</span> : (
            <BookLink eventId={event._id} expo={expo} className="flex-1" aria-label={`Book now: ${event.title}`}>
              Book Now <ArrowUpRight size={16} aria-hidden="true" />
            </BookLink>
          )}
        </div>
      </article>
    </div>
  );
}
