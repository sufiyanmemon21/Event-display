import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Clock3, Mail, MapPin, Phone } from "lucide-react";
import WebsiteMark from "./WebsiteMark";

const footerLinks = [
  {
    title: "Quick links",
    links: [
      ["Home", "/"],
      ["About us", "/#about"],
      ["Events", "/event-listing"],
      ["Expos", "/expos"],
      ["Gallery", "/gallery"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Platform",
    links: [
      ["Event dashboard", "/dashboard"],
      ["Event services", "/services"],
      ["Exhibitor hub", "/signup?role=exhibitor"],
      ["Attendee portal", "/signup?role=attendee"],
    ],
  },
];

const contacts = [
  {
    icon: Phone,
    label: "Call us",
    value: "+92 300 1234567",
    href: "tel:+923001234567",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "hello@eventsphere.com",
    href: "mailto:hello@eventsphere.com",
  },
  { icon: MapPin, label: "Location", value: "Karachi, Pakistan" },
  { icon: Clock3, label: "Office hours", value: "Mon–Fri, 9 AM–6 PM" },
];

const copyrightYear = new Date().getFullYear();

function requestNewsletter(event) {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email");
  const body = encodeURIComponent(
    `Please send EventSphere newsletter updates to ${email}.`,
  );
  window.location.href = `mailto:hello@eventsphere.com?subject=EventSphere%20newsletter&body=${body}`;
}

export default function LandingFooter() {
  return (
    <footer id="footer" className="celebration-footer border-t border-[#78594b] bg-[#352722] text-[#fff4e9]">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-8 py-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="min-w-0">
            <Link to="/" className="inline-flex items-center gap-2 font-serif text-2xl"><WebsiteMark /> EventSphere</Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#e2d1c6]">Discover memorable events, connect with exhibitors, and bring your next gathering to life.</p>
            <Link to="/#inquire" className="action-button mt-5">Plan your event <ArrowRight size={16} /></Link>
            <form onSubmit={requestNewsletter} className="mt-6 max-w-sm">
              <label htmlFor="footer-newsletter-email" className="text-sm font-semibold">Keep in touch</label>
              <div className="mt-2 flex gap-2">
                <input id="footer-newsletter-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required className="min-w-0 flex-1 rounded-lg border border-[#78594b] px-3 py-2 text-sm" />
                <button type="submit" aria-label="Open newsletter request email"><ArrowRight size={18} /></button>
              </div>
              <p className="mt-2 text-xs text-[#e2d1c6]">Opens an email draft to request updates.</p>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-[1fr_1fr_1.4fr]">
            {footerLinks.map(({ title, links }) => <nav key={title} aria-label={title}>
              <h2 className="mb-4 text-sm font-semibold text-[#edc99c]">{title}</h2>
              <ul className="space-y-3 text-sm text-[#e2d1c6]">{links.map(([label, route]) => <li key={route}><Link to={route} className="hover:text-white hover:underline underline-offset-4">{label}</Link></li>)}</ul>
            </nav>)}
            <section className="col-span-2 sm:col-span-1">
              <h2 className="mb-4 text-sm font-semibold text-[#edc99c]">Contact us</h2>
              <dl className="space-y-4 text-sm">{contacts.map(({ icon: Icon, label, value, href }) => <div key={label} className="flex items-start gap-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#edc99c]" aria-hidden="true" />
                <div className="min-w-0 [overflow-wrap:anywhere]"><dt className="text-xs text-[#cbb5a8]">{label}</dt><dd className="mt-1">{href ? <a href={href} className="hover:underline">{value}</a> : value}</dd></div>
              </div>)}</dl>
            </section>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#78594b] py-4 text-xs text-[#e2d1c6]">
          <p>© {copyrightYear} EventSphere Management. All rights reserved.</p>
          <button type="button" className="inline-flex min-h-9 items-center gap-2 hover:text-white" onClick={() => window.scrollTo({ top: 0 })}>Back to top <ArrowUp size={15} /></button>
        </div>
      </div>
    </footer>
  );
}
