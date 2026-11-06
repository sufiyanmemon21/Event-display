import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import ExpoCollection from '@/components/landing/ExpoCollection';
import EventCard from '@/components/landing/EventCard';
import { getEventImage } from '@/components/landing/eventImages';
import PublicPageShell from '@/components/landing/PublicPageShell';
import useExpos, { isExpo } from '@/hooks/useExpos';
import useAuth from '@/hooks/useAuth';

function Catalog({ events = false }) {
  const data = useExpos();
  const items = data.items.filter(events ? (item) => !isExpo(item) : isExpo);
  const title = events ? 'Events' : 'Expos';
  useEffect(() => {
    document.title = `Explore ${title} — EventSphere`;
  }, [title]);

  return (
    <PublicPageShell>
      <main className="min-h-[65vh] px-4 py-10 sm:px-7 sm:py-14">
        <ExpoCollection
          data={{ ...data, items }}
          kind={events ? 'events' : 'expos'}
          title={events ? 'Explore our events' : 'Explore our expos'}
          eyebrow={events ? 'WHAT’S HAPPENING' : 'DISCOVER YOUR NEXT CONNECTION'}
          description={
            events
              ? 'Browse the full calendar of experiences published by the EventSphere community.'
              : 'Explore the complete expo catalog and open any listing to find event details.'
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

export function ExpoDetailPage() {
  const user = useAuth();
  const { expoId } = useParams();
  const data = useExpos();
  const eventIndex = data.items.findIndex((item) => item._id === expoId);
  const event = eventIndex >= 0 ? data.items[eventIndex] : undefined;
  const backToEvents = event && !isExpo(event);

  useEffect(() => {
    document.title = event
      ? `${event.title} — EventSphere`
      : 'Event details — EventSphere';
  }, [event]);

  return (
    <PublicPageShell>
      <main className="min-h-[65vh] px-4 py-10 sm:px-7 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <Link
            to={backToEvents ? '/event-listing' : '/expos'}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#765b4e] hover:text-[#a97818]"
          >
            <ArrowLeft size={16} /> {backToEvents ? 'Back to events' : 'Back to expos'}
          </Link>
          {data.loading ? (
            <p role="status" className="rounded-2xl bg-white p-10 text-center text-[#756a64]">
              Loading event details…
            </p>
          ) : data.error ? (
            <div role="alert" className="rounded-2xl border border-[#eadfd5] bg-white p-8 text-center">
              <p className="text-sm text-[#756a64]">{data.error}</p>
              <button
                type="button"
                onClick={data.retry}
                className="mt-4 rounded-full bg-[#c6952d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a97818]"
              >
                Try again
              </button>
            </div>
          ) : !event ? (
            <div className="rounded-2xl border border-[#eadfd5] bg-white p-10 text-center">
              <h1 className="font-serif text-2xl font-semibold text-[#321b1f]">
                Event not found
              </h1>
              <p className="mt-2 text-sm text-[#756a64]">
                This event may have been removed or its link may have changed.
              </p>
              <Link
                to="/expos"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#c6952d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a97818]"
              >
                Explore expos <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : (
            <article className="overflow-hidden rounded-[1.75rem] border border-[#eadfd5] bg-white shadow-[0_14px_38px_rgba(54,27,25,0.09)]">
              <img
                src={getEventImage(event, eventIndex)}
                alt=""
                className="max-h-[460px] min-h-64 w-full object-cover"
              />
              <div className="p-6 sm:p-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#a97d28]">
                  {event.category || 'Event'}
                </p>
                <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#321b1f] sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#756a64]">
                  {event.description || 'More details will be shared by the organizer.'}
                </p>
                <div className="mt-6 grid gap-4 rounded-2xl bg-[#fbf4ee] p-5 text-sm text-[#594842] sm:grid-cols-2">
                  <p className="flex items-center gap-3">
                    <CalendarDays size={18} className="shrink-0 text-[#bd8b2e]" />
                    {event.date
                      ? new Date(event.date).toLocaleDateString(undefined, {
                          dateStyle: 'long',
                        })
                      : 'Date to be announced'}
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin size={18} className="shrink-0 text-[#bd8b2e]" />
                    {event.location || 'Location to be announced'}
                  </p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  {(!user || user.role === 'attendee') && <Link
                    to={user ? `/profile?event=${event._id}` : '/login'}
                    state={user ? undefined : { from: `/profile?event=${event._id}` }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c6952d] px-6 text-sm font-semibold text-white transition hover:bg-[#a97818]"
                  >
                    {user ? 'Book this event' : 'Log in to book'} <ArrowUpRight size={16} />
                  </Link>}
                  <Link
                    to="/event-listing"
                    className="inline-flex min-h-11 items-center rounded-full border border-[#d9c7ad] px-6 text-sm font-semibold text-[#4a292a] transition hover:bg-[#fbf4ee]"
                  >
                    More events
                  </Link>
                </div>
              </div>
            </article>
          )}
          {!data.loading && !data.error && data.items.length > 1 && (
            <section className="mt-14">
              <h2 className="mb-5 font-serif text-2xl font-semibold text-[#321b1f]">
                You may also like
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {data.items
                  .filter((item) => item._id !== expoId)
                  .slice(0, 2)
                  .map((item, index) => (
                    <EventCard key={item._id} event={item} index={index} />
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
