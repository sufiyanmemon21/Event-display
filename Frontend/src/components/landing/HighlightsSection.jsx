import { Link } from 'react-router-dom';
import EventCard from './EventCard';

export default function HighlightsSection({ data }) {
  const events = data.items.slice(0, 3);
  return (
    <section id="events" className="bg-[#fbf4ee] px-5 py-14 sm:px-8 md:py-18">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
            Find your next experience
          </p>
          <h2 className="font-serif text-3xl font-semibold text-[#321b1f] sm:text-4xl">
            Our Events
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#756a64]">
            Discover experiences from the EventSphere community and find something
            worth looking forward to.
          </p>
        </div>
        {data.loading ? (
          <p role="status" className="py-12 text-center text-sm text-[#756a64]">
            Finding upcoming events…
          </p>
        ) : data.error ? (
          <p role="alert" className="py-12 text-center text-sm text-[#756a64]">
            {data.error}
          </p>
        ) : events.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#eadfd5] bg-white p-8 text-center text-sm text-[#756a64]">
            New events will appear here as organizers publish them.
          </p>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/event-listing"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c6952d] px-6 text-xs font-semibold text-white transition hover:bg-[#a97818]"
          >
            View all events
          </Link>
        </div>
      </div>
    </section>
  );
}
