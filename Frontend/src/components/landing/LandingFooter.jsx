import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, Layers3, Mail, MapPin, Phone } from 'lucide-react';

const linkStyle = 'block py-1.5 text-xs text-[#e2d8ca] transition hover:text-[#e8c978]';
const copyrightYear = new Date().getFullYear();

export default function LandingFooter() {
  return (
    <footer className="bg-[#281f1b] text-[#f9f2e9]" id="footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.1fr] lg:gap-8 lg:py-14">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-serif text-lg font-semibold">
            <Layers3 size={21} className="text-[#d1a13b]" />
            <span>EventSphere</span>
          </Link>
          <p className="mt-4 max-w-xs text-xs leading-6 text-[#c9beb0]">
            A modern event and expo management platform designed to bring ideas,
            organizers, and communities together.
          </p>
          <p className="mb-2 mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e8c978]">
            Subscribe to our newsletter
          </p>
          <form
            action="mailto:hello@eventsphere.com"
            method="post"
            encType="text/plain"
            className="flex max-w-xs items-center rounded-full border border-white/15 bg-white/5 p-1"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Your email
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/50"
            />
            <button
              type="submit"
              aria-label="Subscribe by email"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-[#c6952d] text-white transition hover:bg-[#a97818]"
            >
              <ArrowUpRight size={15} />
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3a33c]">
            Quick links
          </h2>
          <Link className={linkStyle} to="/">
            Home
          </Link>
          <Link className={linkStyle} to="/#about">
            About us
          </Link>
          <Link className={linkStyle} to="/expos">
            Our expos
          </Link>
          <Link className={linkStyle} to="/event-listing">
            Events
          </Link>
          <Link className={linkStyle} to="/gallery">
            Gallery
          </Link>
          <Link className={linkStyle} to="/contact">
            Contact
          </Link>
        </div>

        <div>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3a33c]">
            Platform
          </h2>
          <Link className={linkStyle} to="/service">
            Event management
          </Link>
          <Link className={linkStyle} to="/signup?role=exhibitor">
            Exhibitor hub
          </Link>
          <Link className={linkStyle} to="/signup?role=attendee">
            Attendee portal
          </Link>
          <Link className={linkStyle} to="/login">
            Account sign in
          </Link>
        </div>

        <div>
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3a33c]">
            Contact us
          </h2>
          <a className="mb-3 flex items-start gap-3 text-xs text-[#e2d8ca] hover:text-[#e8c978]" href="tel:+923001234567">
            <Phone size={14} className="mt-0.5 shrink-0 text-[#d3a33c]" />
            <span>+92 300 1234567</span>
          </a>
          <a className="mb-3 flex items-start gap-3 text-xs text-[#e2d8ca] hover:text-[#e8c978]" href="mailto:hello@eventsphere.com">
            <Mail size={14} className="mt-0.5 shrink-0 text-[#d3a33c]" />
            <span>hello@eventsphere.com</span>
          </a>
          <p className="mb-3 flex items-start gap-3 text-xs text-[#e2d8ca]">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[#d3a33c]" />
            <span>Karachi, Pakistan</span>
          </p>
          <p className="flex items-start gap-3 text-xs text-[#e2d8ca]">
            <Clock3 size={14} className="mt-0.5 shrink-0 text-[#d3a33c]" />
            <span>Mon – Fri, 9 AM – 6 PM</span>
          </p>
          <Link
            to="/signup?role=attendee"
            className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#c6952d] px-4 text-[10px] font-semibold uppercase tracking-wider text-white transition hover:bg-[#a97818]"
          >
            Book now <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-5 text-[10px] text-[#b8ac9f] sm:px-8">
          <span>© {copyrightYear} EventSphere Management. All rights reserved.</span>
          <span className="flex gap-5">
            <Link to="/contact" className="hover:text-white">
              Privacy policy
            </Link>
            <Link to="/contact" className="hover:text-white">
              Terms &amp; conditions
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
