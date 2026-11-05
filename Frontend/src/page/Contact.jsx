import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import PublicPageShell from '@/components/landing/PublicPageShell';

const details = [
  [Mail, 'Email', 'hello@eventsphere.com', 'mailto:hello@eventsphere.com'],
  [Phone, 'Phone', '+92 300 1234567', 'tel:+923001234567'],
  [MapPin, 'Location', 'Karachi, Pakistan', 'https://www.openstreetmap.org/?mlat=24.8607&mlon=67.0011#map=12/24.8607/67.0011'],
  [Clock3, 'Working hours', 'Mon – Fri, 9 AM – 6 PM', null],
];

function openEmail(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const subject = encodeURIComponent(values.subject);
  const body = encodeURIComponent(
    `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone || 'Not provided'}\n\n${values.message}`,
  );
  window.location.href = `mailto:hello@eventsphere.com?subject=${subject}&body=${body}`;
}

export default function Contact() {
  const loggedIn = Boolean(localStorage.getItem('token'));
  const role = localStorage.getItem('userRole');
  const canMessage =
    !loggedIn || ['organizer', 'attendee', 'exhibitor'].includes(role);

  useEffect(() => {
    document.title = 'Contact EventSphere';
  }, []);

  return (
    <PublicPageShell>
      <main className="px-4 pb-14 pt-10 sm:px-7 sm:pb-16 sm:pt-14">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
            Get in touch
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#321b1f] sm:text-4xl">
            Let’s talk about your <span className="text-[#bd8b2e]">event</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#756a64]">
            Have a question or event idea? Send us a message and our team will get back to you.
          </p>
        </header>

        <section
          aria-label="Contact details"
          className="mx-auto mb-8 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {details.map(([Icon, title, value, href]) => {
            const content = (
              <>
                <span className="mb-3 grid size-10 place-items-center rounded-xl bg-[#fbf0d9] text-[#a97818]">
                  <Icon size={18} />
                </span>
                <span className="block font-serif text-base font-semibold text-[#321b1f]">
                  {title}
                </span>
                <span className="mt-1 block text-xs text-[#756a64]">{value}</span>
              </>
            );
            return href ? (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="rounded-2xl border border-[#eadfd5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                {content}
              </a>
            ) : (
              <div
                key={title}
                className="rounded-2xl border border-[#eadfd5] bg-white p-4 shadow-sm sm:p-5"
              >
                {content}
              </div>
            );
          })}
        </section>

        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[#eadfd5] bg-white p-5 shadow-[0_12px_30px_rgba(54,27,25,0.08)] sm:p-7">
            <div className="mb-5">
              <span className="mb-3 grid size-10 place-items-center rounded-xl bg-[#fbf0d9] text-[#a97818]">
                <MessageCircle size={19} />
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#321b1f]">
                Send us a message
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#756a64]">
                Fill out the form to open a message in your email app.
              </p>
            </div>
            <form onSubmit={openEmail} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium text-[#594842]">
                  Full name
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="h-10 rounded-lg border border-[#eadfd5] bg-[#fffdfb] px-3 text-sm outline-none transition focus:border-[#c6952d] focus:ring-2 focus:ring-[#c6952d]/15"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-[#594842]">
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Your email"
                    className="h-10 rounded-lg border border-[#eadfd5] bg-[#fffdfb] px-3 text-sm outline-none transition focus:border-[#c6952d] focus:ring-2 focus:ring-[#c6952d]/15"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium text-[#594842]">
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your phone (optional)"
                    className="h-10 rounded-lg border border-[#eadfd5] bg-[#fffdfb] px-3 text-sm outline-none transition focus:border-[#c6952d] focus:ring-2 focus:ring-[#c6952d]/15"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-[#594842]">
                  Subject
                  <input
                    name="subject"
                    required
                    placeholder="What is this about?"
                    className="h-10 rounded-lg border border-[#eadfd5] bg-[#fffdfb] px-3 text-sm outline-none transition focus:border-[#c6952d] focus:ring-2 focus:ring-[#c6952d]/15"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-medium text-[#594842]">
                Message
                <textarea
                  name="message"
                  required
                  minLength={5}
                  rows={5}
                  placeholder="Write your message..."
                  className="resize-y rounded-lg border border-[#eadfd5] bg-[#fffdfb] px-3 py-2.5 text-sm outline-none transition focus:border-[#c6952d] focus:ring-2 focus:ring-[#c6952d]/15"
                />
              </label>
              <button
                type="submit"
                className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#c6952d] px-5 text-sm font-semibold text-white transition hover:bg-[#a97818]"
              >
                Send message <Send size={15} />
              </button>
            </form>
            <div className="mt-5 border-t border-[#f0e8df] pt-4 text-xs text-[#756a64]">
              Need account support?{' '}
              <Link
                to={loggedIn ? '/feedback' : '/dashboard/login'}
                state={loggedIn ? undefined : { from: '/feedback' }}
                className="font-semibold text-[#8f661c] underline underline-offset-2"
              >
                {loggedIn ? 'Open feedback' : 'Sign in to contact support'}
              </Link>
              {canMessage && (
                <>
                  {' '}or{' '}
                  <Link
                    to={loggedIn ? '/messages' : '/dashboard/login'}
                    state={loggedIn ? undefined : { from: '/messages' }}
                    className="font-semibold text-[#8f661c] underline underline-offset-2"
                  >
                    {loggedIn ? 'open messages' : 'sign in to message an organizer'}
                  </Link>
                  .
                </>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfd5] bg-white shadow-[0_12px_30px_rgba(54,27,25,0.08)]">
            <div className="p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a97d28]">
                Find us
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#321b1f]">
                Our location
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#756a64]">
                Visit us in Karachi, Pakistan, or contact us online for more information.
              </p>
            </div>
            <iframe
              title="Map of Karachi, Pakistan"
              src="https://www.openstreetmap.org/export/embed.html?bbox=66.92%2C24.80%2C67.08%2C24.92&layer=mapnik&marker=24.8607%2C67.0011"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0 sm:h-80"
            />
            <a
              href="https://www.openstreetmap.org/?mlat=24.8607&mlon=67.0011#map=12/24.8607/67.0011"
              target="_blank"
              rel="noreferrer"
              className="block px-5 py-3 text-xs font-semibold text-[#8f661c] hover:underline sm:px-7"
            >
              Open in maps
            </a>
          </section>
        </div>

        <section className="mx-auto mt-8 max-w-6xl rounded-[1.5rem] bg-[#c6952d] px-5 py-8 text-center text-white shadow-[0_12px_28px_rgba(54,27,25,0.14)] sm:px-8">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Ready to plan your event?
          </h2>
          <p className="mt-2 text-xs text-white/85">
            Tell us about your event and turn your idea into a memorable experience.
          </p>
          <Link
            to="/signup?role=attendee"
            className="mt-5 inline-flex min-h-10 items-center rounded-full bg-white px-5 text-xs font-semibold text-[#6d4a0f] transition hover:bg-[#fff7e8]"
          >
            Book your event
          </Link>
        </section>
      </main>
    </PublicPageShell>
  );
}
