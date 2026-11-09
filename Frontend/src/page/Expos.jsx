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
      className="mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-xl border border-[var(--public-line)]
          bg-white shadow-[0_14px_38px_rgba(54,27,25,0.09)] [.workspace-form-body_fieldset_>_p&]:py-[14px]"
    >
      <img
        src={getEventImage(event, eventIndex)}
        alt=""
        className="h-44 w-full shrink-0 object-cover"
      />
      <div className="flex flex-1 flex-col break-words p-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[var(--public-teal)]">
          {event.category || (backToEvents ? "Event" : "Expo")}
        </p>
        <Heading className="mt-2 font-serif text-3xl font-semibold leading-tight text-[var(--public-ink)] sm:text-4xl">
          {event.title}
        </Heading>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--public-copy)]">
          {event.description || "More details will be shared by the organizer."}
        </p>
        <div className="mt-6 grid gap-4 rounded-2xl bg-[var(--public-wash)] p-5 text-sm text-[var(--public-copy)] sm:grid-cols-2">
          <p className="flex items-center gap-3">
            <CalendarDays
              size={18}
              className="shrink-0 text-[var(--public-teal)]"
            />
            {event.date
              ? new Date(event.date).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })
              : "Date to be announced"}
          </p>
          <p className="flex items-center gap-3">
            <MapPin size={18} className="shrink-0 text-[var(--public-teal)]" />
            {event.location || "Location to be announced"}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-7">
          {isPastEvent(event.date) ? (
            <p className="self-center text-sm font-medium text-[var(--public-copy)]">
              Bookings closed · Event has passed
            </p>
          ) : (
            (!user || user.role === "attendee") && (
              <BookLink
                eventId={event._id}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--public-teal)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--public-teal-dark)]"
              >
                {user ? "Book this event" : "Log in to book"}{" "}
                <ArrowUpRight size={16} />
              </BookLink>
            )
          )}
          <Link
            to={featured ? catalogPath : `/expos/${event._id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--public-line)] px-6 text-sm font-semibold text-[#4a292a] transition hover:bg-[#fbf4ee]"
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
        <div className="mx-auto max-w-5xl">
          <Link
            to={catalogPath}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--public-copy)] hover:text-[#a97818]"
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
                className="mt-4 rounded-full bg-[var(--public-teal)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--public-teal-dark)]"
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
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--public-teal)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--public-teal-dark)]"
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
            <section className="mt-14 text-center">
              <h2 className="mb-5 font-serif text-2xl font-semibold text-[var(--public-ink)]">
                You may also like
              </h2>
              <div className="mx-auto flex max-w-[49.25rem] flex-wrap justify-center gap-5">
                {related.map((item, index) => (
                  <div
                    key={item._id}
                    className="w-full max-w-sm sm:w-[calc(50%-0.625rem)]"
                  >
                    <ListingDetailCard
                      event={item}
                      eventIndex={index}
                      user={user}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
