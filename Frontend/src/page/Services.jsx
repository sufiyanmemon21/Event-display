import { useEffect } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, UsersRound, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicPageShell from '@/components/landing/PublicPageShell';
import planningImage from '@/assets/last.avif';
import eventImage from '@/assets/Event.jpg';

const services = [
  [CalendarDays, 'Event planning', 'Keep event dates, details, and schedules organized in one connected workspace.'],
  [Building2, 'Expo management', 'Publish exhibitions and help exhibitors and attendees discover the right opportunities.'],
  [UsersRound, 'Attendee coordination', 'Bring organizers, exhibitors, and attendees together around shared experiences.'],
  [BarChart3, 'Event insights', 'Use event information and attendance tools to make planning decisions with confidence.'],
];

export default function Services() {
  useEffect(() => {
    document.title = 'Event Management Services — EventSphere';
  }, []);

  return (
    <PublicPageShell>
      <main>
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
                What we offer
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.08] text-[#321b1f] sm:text-5xl">
                Everything you need <span className="text-[#bd8b2e]">to manage events</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#756a64]">
                Plan and manage events, publish exhibitions, and help every participant
                find their place in one connected platform.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Easy management', 'Real-time updates', 'Smart insights'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[#eadfd5] bg-[#fbf4ee] px-4 py-2 text-xs font-medium text-[#765b4e]"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <Link
                to="/event-listing"
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c6952d] px-6 text-sm font-semibold text-white transition hover:bg-[#a97818]"
              >
                Explore events <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-[1.75rem] border border-[#eadfd5] bg-white p-2 shadow-[0_18px_40px_rgba(54,27,25,0.1)]">
                <img
                  src={eventImage}
                  alt="A conference and event space prepared for attendees"
                  className="aspect-[1.4] w-full rounded-[1.25rem] object-cover"
                />
                <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
                  {services.map(([Icon, title]) => (
                    <div key={title} className="rounded-xl bg-[#fbf4ee] p-3 text-center">
                      <Icon size={18} className="mx-auto mb-2 text-[#bd8b2e]" />
                      <span className="text-[10px] font-medium leading-4 text-[#594842]">
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <img
                src={planningImage}
                alt=""
                aria-hidden="true"
                className="absolute -bottom-5 -left-5 -z-10 h-24 w-28 rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>
        <section className="bg-[#fbf4ee] px-5 py-14 sm:px-8 md:py-18">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 text-center">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
                EventSphere tools
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#321b1f] sm:text-4xl">
                A thoughtful way to bring it all together
              </h2>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(([Icon, title, description]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-[#eadfd5] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 grid size-11 place-items-center rounded-xl bg-[#fbf0d9] text-[#a97818]">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#321b1f]">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[#756a64]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="px-5 py-12 text-center sm:px-8">
          <h2 className="font-serif text-3xl font-semibold text-[#321b1f]">
            Ready to plan your next event?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#756a64]">
            Find an upcoming experience or create an EventSphere account to get started.
          </p>
          <Link
            to="/signup?role=attendee"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c6952d] px-6 text-sm font-semibold text-white transition hover:bg-[#a97818]"
          >
            Get started <ArrowUpRight size={16} />
          </Link>
        </section>
      </main>
    </PublicPageShell>
  );
}
