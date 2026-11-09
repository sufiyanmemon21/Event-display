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
    <footer
      className="celebration-footer [.public-theme_footer&]:[background-color:#31231f]!
          [.public-theme_footer&]:[border-top:1px_solid_#a9795b] [.public-theme_footer&]:text-[var(--footer-cream)]
          [&_h2]:text-[var(--footer-gold)] [&_h2]:uppercase [&_h2]:tracking-[.12em] [&_h2]:text-[.77rem]
          [&_h2]:font-[650] [&_h2]:mb-2 [&_a:hover]:underline [&_a:hover]:underline-offset-[4px]
          [&_button:hover]:underline [&_button:hover]:underline-offset-[4px]
          [&_a:focus-visible]:[outline:2px_solid_var(--footer-gold)] [&_a:focus-visible]:outline-offset-[3px]
          [&_button:focus-visible]:[outline:2px_solid_var(--footer-gold)] [&_button:focus-visible]:outline-offset-[3px]
          [&_input:focus-visible]:[outline:2px_solid_var(--footer-gold)] [&_input:focus-visible]:outline-offset-[3px]"
      id="footer"
    >
      <div className="celebration-footer-inner w-[min(1200px,_calc(100%_-_64px))] mx-auto max-[720px]:w-[calc(100%_-_40px)]">
        <div
          className="celebration-footer-masthead grid [grid-template-columns:minmax(0,_1.3fr)_minmax(0,_.7fr)] items-center
          gap-[clamp(20px,_6vw,_80px)] py-[clamp(28px,_4vw,_56px)] [border-bottom:1px_solid_var(--footer-line)]
          max-[720px]:[grid-template-columns:minmax(0,_1fr)]"
        >
          <div className="min-w-0">
            <Link
              to="/"
              className="celebration-footer-brand inline-flex flex-wrap items-center gap-3
          [font:clamp(1.9rem,_3.6vw,_3.35rem)/1.05_Georgia,_serif] tracking-[-.035em] text-[var(--footer-cream)]
          [&_svg]:text-[var(--footer-gold)]"
            >
              <WebsiteMark /> EventSphere
            </Link>
            <p className="celebration-footer-copy mt-3 max-w-[43ch] leading-[1.65] text-[var(--footer-copy)]">
              Discover memorable events, connect with exhibitors, and bring your
              next gathering to life.
            </p>
          </div>
          <form
            className="celebration-footer-newsletter [&_label]:text-[var(--footer-gold)] [&_label]:uppercase
          [&_label]:tracking-[.12em] [&_label]:text-[.77rem] [&_label]:font-[650] grid
          [grid-template-columns:minmax(0,_1fr)] min-w-0 gap-[9px] p-[clamp(14px,_2vw,_22px)]
          [border:1px_solid_var(--footer-line)] rounded-[12px] [background:#fff5eb08] [&_p]:text-[.76rem]
          [&_p]:text-[var(--footer-copy)]"
            onSubmit={requestNewsletter}
          >
            <label htmlFor="footer-newsletter-email">Keep in touch</label>
            <div
              className="celebration-footer-email flex gap-[6px] p-1 [border:1px_solid_var(--footer-line)] rounded-lg
          [background:#231814] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:px-3 [&_input]:rounded-[99px]
          [&_input]:text-[var(--footer-cream)] [&_input::placeholder]:text-[#cfbdb0] [&_button]:grid
          [&_button]:place-items-center [&_button]:flex-none [&_button]:w-[44px] [&_button]:h-[44px]
          [&_button]:rounded-[5px] [&_button]:[background:var(--footer-gold)] [&_button]:text-[#35251c]"
            >
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                required
              />
              <button type="submit" aria-label="Open newsletter request email">
                <ArrowRight size={19} />
              </button>
            </div>
            <p>Opens an email draft to request updates.</p>
          </form>
        </div>
        <div
          className="celebration-footer-directory grid [grid-template-columns:1fr_1fr_1.15fr] py-[clamp(26px,_4vw,_54px)]
          text-[var(--footer-copy)] text-[.94rem] [&_>_*]:min-w-0 [&_>_:not(:last-child)]:pe-[clamp(16px,_2.8vw,_42px)]
          [&_>_:not(:first-child)]:ps-[clamp(16px,_2.8vw,_42px)]
          [&_>_:not(:first-child)]:[border-inline-start:1px_solid_var(--footer-line)] [&_nav]:grid [&_nav]:content-start
          [&_nav]:justify-items-start [&_nav]:gap-[11px] [&_nav]:[overflow-wrap:anywhere] max-[720px]:grid-cols-2
          max-[720px]:gap-[24px_18px] max-[720px]:[&_>_:nth-child(n)]:px-0
          max-[720px]:[&_>_:nth-child(n)]:[border-inline:0]"
        >
          {footerLinks.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2>{title}</h2>
              {links.map(([label, route]) => (
                <Link key={route} to={route}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
          <div
            className="celebration-footer-contact grid content-start justify-items-start gap-[11px] [overflow-wrap:anywhere]
          [&_dl]:grid [&_dl]:gap-[13px] [&_dl_div]:grid [&_dl_div]:[grid-template-columns:19px_minmax(0,_1fr)]
          [&_dl_div]:gap-x-[11px] [&_dl_svg]:row-span-2 [&_dl_svg]:self-center [&_dl_svg]:text-[var(--footer-gold)]
          [&_dt]:text-[.7rem] [&_dt]:uppercase [&_dt]:tracking-[.08em] [&_dd]:text-[var(--footer-cream)]
          max-[720px]:[.celebration-footer-directory_>_&]:col-span-full
          max-[720px]:[.celebration-footer-directory_>_&]:pt-5
          max-[720px]:[.celebration-footer-directory_>_&]:[border-top:1px_solid_var(--footer-line)]"
          >
            <h2>Contact us</h2>
            <dl>
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <div key={label}>
                  <Icon size={19} aria-hidden="true" />
                  <dt>{label}</dt>
                  <dd>{href ? <a href={href}>{value}</a> : value}</dd>
                </div>
              ))}
            </dl>
            <Link
              className="celebration-footer-cta inline-flex items-center gap-3 min-h-[44px] mt-[7px] p-[9px_16px] rounded-[99px] [background:var(--footer-gold)] text-[#35251c] text-[.84rem] font-[650]"
              to="/#inquire"
            >
              Plan your event <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div
          className="celebration-footer-base flex flex-wrap items-center justify-between gap-2 py-[19px]
          [border-top:1px_solid_var(--footer-line)] text-[var(--footer-copy)] text-[.8rem] [&_button]:inline-flex
          [&_button]:items-center [&_button]:gap-2 [&_button]:min-h-[44px] [&_svg]:text-[var(--footer-gold)]"
        >
          <p>© {copyrightYear} EventSphere Management. All rights reserved.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0 })}>
            Back to top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
