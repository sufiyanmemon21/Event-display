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
  const kind = isExpo(event) ? "Expo" : "Event";
  const closed = isPastEvent(event.date);
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

  return (
    <div
      className="celebration-listing block min-w-0 rounded-[5px] text-[#362621]
                   [box-shadow:0_4px_12px_#52301e0b,_0_12px_28px_#52301e08] [transition:translate_.2s_ease,_box-shadow_.2s_ease]
                   hover:[translate:0_-3px] hover:[box-shadow:0_14px_32px_#52301e20]
                   focus-visible:[outline:2px_solid_var(--ticket-accent)] focus-visible:outline-offset-4
                   motion-reduce:transition-none motion-reduce:hover:[translate:none]"
      data-kind={kind}
    >
      <article className="celebration-listing-ticket flex flex-col h-full overflow-hidden [border:1px_solid_var(--ticket-line)] rounded-[inherit] [background:#fffaf5]">
        <div
          className="celebration-listing-photo relative flex-none h-[clamp(132px,_15vw,_188px)] overflow-hidden [background:#e9cfc0]
          [&_img]:block [&_img]:[transition:scale_.4s_ease] [.celebration-listing:hover_&_img]:[scale:1.035]
          motion-reduce:[&_img]:transition-none motion-reduce:[.celebration-listing:hover_&_img]:[scale:none]"
        >
          <img
            src={getEventImage(event, index)}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <span
            className="celebration-listing-kind absolute top-3 [border:1px_solid_#fff8ee] rounded-[4px] [background:#fff7edf2]
          text-[#56392e] left-3 p-[5px_10px] text-[.75rem] font-[650] uppercase tracking-[.09em]"
          >
            {kind}
          </span>
          {hasDate && (
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
          <dl
            className="celebration-listing-meta grid [grid-template-columns:minmax(0,_1.35fr)_minmax(0,_1fr)] gap-[12px_10px]
          mt-[15px] text-[.875rem] leading-[1.4] [&_>_div]:relative [&_>_div]:ps-[25px] [&_dt]:text-[#69534b]
          [&_dt]:text-[.75rem] [&_svg]:absolute [&_svg]:start-0 [&_svg]:top-[.35rem] [&_svg]:text-[#a57514]"
          >
            {metadata.map(({ label, Icon, value }) => (
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
        <div className="celebration-listing-stub flex flex-wrap items-center justify-between gap-[6px_10px] mx-[15px] p-[8px_0_10px] [border-top:1px_solid_var(--ticket-line)] text-[.8rem] text-[#634a40]">
          {closed ? (
            <Link
              to={`/expos/${event._id}`}
              className="celebration-listing-action flex w-full items-center justify-between gap-3 min-h-[48px] p-[6px_8px_6px_18px]
          [border:1px_solid_#8d583b] rounded-[999px] [background:linear-gradient(115deg,_#8b5235,_#57342b_70%)]
          [background-size:160%_100%] [box-shadow:inset_0_1px_#fff2d54d,_0_4px_10px_#57342b29] text-[#fffaf6]
          text-[.9rem] font-[650] [transition:background-position_.25s_ease,_box-shadow_.25s_ease] [&_>_span]:grid
          [&_>_span]:place-items-center [&_>_span]:w-[32px] [&_>_span]:h-[32px] [&_>_span]:rounded-[50%]
          [&_>_span]:[background:#f5dbaf] [&_>_span]:text-[#57342b] [&_svg]:[transition:translate_.25s_ease]
          [.celebration-listing:hover_&]:[background-position:100%_0]
          [.celebration-listing:hover_&]:[box-shadow:inset_0_1px_#fff2d54d,_0_6px_14px_#57342b40]
          [.celebration-listing:focus-visible_&]:[background-position:100%_0]
          [.celebration-listing:focus-visible_&]:[box-shadow:inset_0_1px_#fff2d54d,_0_6px_14px_#57342b40]
          [.celebration-listing:hover_&_svg]:[translate:2px_-2px]
          [.celebration-listing:focus-visible_&_svg]:[translate:2px_-2px] motion-reduce:transition-none
          motion-reduce:[&_svg]:transition-none motion-reduce:[.celebration-listing:hover_&_svg]:[translate:none]
          motion-reduce:[.celebration-listing:focus-visible_&_svg]:[translate:none]"
            >
              View details{" "}
              <span aria-hidden="true">
                <ArrowUpRight size={17} />
              </span>
            </Link>
          ) : (
            <BookLink
              eventId={event._id}
              className="celebration-listing-action flex w-full items-center justify-between gap-3 min-h-[48px] p-[6px_8px_6px_18px]
          [border:1px_solid_#8d583b] rounded-[999px] [background:linear-gradient(115deg,_#8b5235,_#57342b_70%)]
          [background-size:160%_100%] [box-shadow:inset_0_1px_#fff2d54d,_0_4px_10px_#57342b29] text-[#fffaf6]
          text-[.9rem] font-[650] [transition:background-position_.25s_ease,_box-shadow_.25s_ease] [&_>_span]:grid
          [&_>_span]:place-items-center [&_>_span]:w-[32px] [&_>_span]:h-[32px] [&_>_span]:rounded-[50%]
          [&_>_span]:[background:#f5dbaf] [&_>_span]:text-[#57342b] [&_svg]:[transition:translate_.25s_ease]
          [.celebration-listing:hover_&]:[background-position:100%_0]
          [.celebration-listing:hover_&]:[box-shadow:inset_0_1px_#fff2d54d,_0_6px_14px_#57342b40]
          [.celebration-listing:focus-visible_&]:[background-position:100%_0]
          [.celebration-listing:focus-visible_&]:[box-shadow:inset_0_1px_#fff2d54d,_0_6px_14px_#57342b40]
          [.celebration-listing:hover_&_svg]:[translate:2px_-2px]
          [.celebration-listing:focus-visible_&_svg]:[translate:2px_-2px] motion-reduce:transition-none
          motion-reduce:[&_svg]:transition-none motion-reduce:[.celebration-listing:hover_&_svg]:[translate:none]
          motion-reduce:[.celebration-listing:focus-visible_&_svg]:[translate:none]"
              aria-label={`Book now: ${event.title}`}
            >
              Book Now{" "}
              <span aria-hidden="true">
                <ArrowUpRight size={17} />
              </span>
            </BookLink>
          )}
        </div>
      </article>
    </div>
  );
}
