import BookLink from "@/components/landing/BookLink";
import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import ExpoCollection from "@/components/landing/ExpoCollection";

import { getEventImage } from "@/components/landing/eventImages";
import PublicPageShell from "@/components/landing/PublicPageShell";
import useExpos, { isExpo } from "@/hooks/useExpos";
import useAuth from "@/hooks/useAuth";
import { isPastEvent } from "@/lib/eventDates";

function Catalog({ events = false }) {
  const data = useExpos();
  const items = data.items.filter(events ? (item) => !isExpo(item) : isExpo);
  const title = events ? "Events" : "Expos";
  useEffect(() => {
    document.title = `Explore ${title} — EventSphere`;
  }, [title]);

  return (
    <PublicPageShell>
      <main className="min-h-[65vh] px-4 py-10 sm:px-7 sm:py-14">
        <ExpoCollection
          data={{ ...data, items }}
          kind={events ? "events" : "expos"}
          title={events ? "Explore our events" : "Explore our expos"}
          eyebrow={
            events ? "WHAT’S HAPPENING" : "DISCOVER YOUR NEXT CONNECTION"
          }
          description={
            events
              ? "Browse the full calendar of experiences published by the EventSphere community."
              : "Explore the complete expo catalog and open any listing to find event details."
          }
        />
      </main>
    </PublicPageShell>
  );
}

export default function ExposPage() {
  return <Catalog />;
}

export function EventsPage() {
  return <Catalog events />;
}

function ListingDetailCard({ event, eventIndex, user, featured = false }) {
  const backToEvents = !isExpo(event);
  const catalogPath = backToEvents ? "/event-listing" : "/expos";
  const Heading = featured ? "h1" : "h3";
  return (
    <article
      className={
        featured
          ? "grid min-w-0 items-center overflow-hidden rounded-2xl border border-[var(--public-line)] bg-[#fffdfa] shadow-[0_16px_40px_rgba(54,27,25,0.1)] md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
          : "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--public-line)] bg-white shadow-[0_10px_28px_rgba(54,27,25,0.08)] transition-shadow hover:shadow-[0_16px_38px_rgba(54,27,25,0.14)]"
      }
    >
      <img
        src={getEventImage(event, eventIndex)}
        alt={`${event.title} cover image`}
        className="block aspect-video w-full object-cover"
      />
      <div
        className={
          featured
            ? "min-w-0 break-words p-5 text-left sm:p-7"
            : "flex min-w-0 flex-1 flex-col break-words p-5 text-left sm:p-6"
        }
      >
        <p className="text-xs font-bold uppercase tracking-[0.23em] text-[#75483d]">
          {event.category || (backToEvents ? "Event" : "Expo")}
        </p>
        <Heading
          className={
            featured
              ? "mt-2 font-serif text-3xl font-semibold leading-tight text-[var(--public-ink)] sm:text-4xl"
              : "mt-2 line-clamp-2 font-serif text-2xl font-semibold leading-tight text-[var(--public-ink)]"
          }
        >
          {event.title}
        </Heading>
        <p
          className={
            featured
              ? "mt-4 text-sm leading-7 text-[#59443d] sm:text-base"
              : "mt-3 line-clamp-3 text-sm leading-6 text-[#59443d]"
          }
        >
          {event.description || "More details will be shared by the organizer."}
        </p>
        <div
          className={
            featured
              ? "mt-5 grid gap-3 rounded-xl border border-[#ead9ce] bg-[#fbf4ed] p-4 text-sm text-[#493930] sm:grid-cols-2"
              : "mt-4 grid gap-3 rounded-xl border border-[#ead9ce] bg-[#fbf4ed] p-3 text-sm text-[#493930] min-[420px]:grid-cols-2"
          }
        >
          {isExpo(event) && (
            <p className="flex items-center gap-3">
              <CalendarDays
                size={19}
                aria-hidden="true"
                className="shrink-0 text-[#80570e]"
              />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#59443d]">
                  Date
                </span>
                {event.date
                  ? new Date(event.date).toLocaleDateString("en-GB", {
                      dateStyle: "long",
                      timeZone: "UTC",
                    })
                  : "To be announced"}
              </span>
            </p>
          )}
          <p className="flex items-center gap-3">
            <MapPin
              size={19}
              aria-hidden="true"
              className="shrink-0 text-[#80570e]"
            />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[#59443d]">
                Location
              </span>
              {event.location || "To be announced"}
            </span>
          </p>
          {!isExpo(event) && (
            <p className="font-semibold text-[#694239] sm:col-span-2">
              Booking requests are open anytime.
            </p>
          )}
        </div>
        <div
          className={
            featured
              ? "flex flex-col gap-3 pt-5 sm:flex-row"
              : "mt-auto flex flex-col gap-3 pt-5 sm:flex-row"
          }
        >
          {isExpo(event) && isPastEvent(event.date) ? (
            <p className="flex min-h-12 items-center text-sm font-semibold text-[#513d34]">
              Bookings closed · This expo has passed
            </p>
          ) : (
            (!user || user.role === "attendee") && (
              <BookLink
                eventId={event._id}
                expo={isExpo(event)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#70483d] px-4 text-sm font-bold text-white shadow-[0_4px_10px_#51342b24] transition hover:bg-[#59382f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
              >
                {user ? "Book this event" : "Log in to book"}{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </BookLink>
            )
          )}
          <Link
            to={featured ? catalogPath : `/expos/${event._id}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#b99479] bg-white px-4 text-sm font-semibold text-[#49352d] transition hover:bg-[#f8eee5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
          >
            {featured
              ? backToEvents
                ? "Browse events"
                : "Browse expos"
              : "View details"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ExpoDetailPage() {
  const user = useAuth();
  const { expoId } = useParams();
  const data = useExpos();
  const eventIndex = data.items.findIndex((item) => item._id === expoId);
  const event = eventIndex >= 0 ? data.items[eventIndex] : undefined;
  const backToEvents = event && !isExpo(event);
  const catalogPath = backToEvents ? "/event-listing" : "/expos";
  const related = event
    ? data.items.filter(
        (item) => item._id !== expoId && isExpo(item) === isExpo(event),
      )
    : [];

  useEffect(() => {
    document.title = event
      ? `${event.title} — EventSphere`
      : "Event details — EventSphere";
  }, [event]);

  return (
    <PublicPageShell>
      <main className="min-h-[65vh] px-4 py-10 sm:px-7 sm:py-14">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            to={catalogPath}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#513d34] hover:text-[#80570e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
          >
            <ArrowLeft size={16} />{" "}
            {backToEvents ? "Back to events" : "Back to expos"}
          </Link>
          {data.loading ? (
            <EllipsisLoader scope="page" label="Loading event details" />
          ) : data.error ? (
            <div
              role="alert"
              className="rounded-2xl border border-[var(--public-line)] bg-white p-8 text-center"
            >
              <p className="text-sm text-[var(--public-copy)]">{data.error}</p>
              <button
                type="button"
                onClick={data.retry}
                className="mt-4 min-h-11 rounded-xl bg-[#70483d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#59382f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
              >
                Try again
              </button>
            </div>
          ) : !event ? (
            <div className="rounded-2xl border border-[var(--public-line)] bg-white p-10 text-center">
              <h1 className="font-serif text-2xl font-semibold text-[var(--public-ink)]">
                Event not found
              </h1>
              <p className="mt-2 text-sm text-[var(--public-copy)]">
                This event may have been removed or its link may have changed.
              </p>
              <Link
                to="/expos"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#70483d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#59382f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
              >
                Explore expos <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : (
            <ListingDetailCard
              event={event}
              eventIndex={eventIndex}
              user={user}
              featured
            />
          )}
          {!data.loading && !data.error && related.length > 0 && (
            <section className="mt-12 border-t border-[var(--public-line)] pt-9">
              <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#75483d]">
                  Keep exploring
                </p>
                <h2 className="font-serif text-2xl font-semibold text-[var(--public-ink)] sm:text-3xl">
                  You may also like
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item, index) => (
                  <ListingDetailCard
                    key={item._id}
                    event={item}
                    eventIndex={index}
                    user={user}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
