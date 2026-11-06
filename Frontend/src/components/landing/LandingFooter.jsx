import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import WebsiteMark from './WebsiteMark';
import './catalog-finishes.css';

const footerLinks = [
  { title: 'Quick links', links: [['Home', '/'], ['About us', '/#about'], ['Events', '/event-listing'], ['Expos', '/expos'], ['Gallery', '/gallery'], ['Contact', '/contact']] },
  { title: 'Platform', links: [['Event dashboard', '/dashboard'], ['Event services', '/services'], ['Exhibitor hub', '/signup?role=exhibitor'], ['Attendee portal', '/signup?role=attendee']] },
];

const contacts = [
  { icon: Phone, label: 'Call us', value: '+92 300 1234567', href: 'tel:+923001234567' },
  { icon: Mail, label: 'Email us', value: 'hello@eventsphere.com', href: 'mailto:hello@eventsphere.com' },
  { icon: MapPin, label: 'Location', value: 'Karachi, Pakistan' },
  { icon: Clock3, label: 'Office hours', value: 'Mon–Fri, 9 AM–6 PM' },
];

const copyrightYear = new Date().getFullYear();

function requestNewsletter(event) {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get('email');
  const body = encodeURIComponent(`Please send EventSphere newsletter updates to ${email}.`);
  window.location.href = `mailto:hello@eventsphere.com?subject=EventSphere%20newsletter&body=${body}`;
}

export default function LandingFooter() {
  return (
    <footer className="celebration-footer" id="footer">
      <div className="celebration-footer-inner">
        <div className="celebration-footer-masthead">
          <div className="min-w-0">
            <Link to="/" className="celebration-footer-brand"><WebsiteMark /> EventSphere</Link>
            <p className="celebration-footer-copy">Discover memorable events, connect with exhibitors, and bring your next gathering to life.</p>
          </div>
          <form className="celebration-footer-newsletter" onSubmit={requestNewsletter}>
            <label htmlFor="footer-newsletter-email">Keep in touch</label>
            <div className="celebration-footer-email">
              <input id="footer-newsletter-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required />
              <button type="submit" aria-label="Open newsletter request email"><ArrowRight size={19} /></button>
            </div>
            <p>Opens an email draft to request updates.</p>
          </form>
        </div>
        <div className="celebration-footer-directory">
          {footerLinks.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2>{title}</h2>
              {links.map(([label, route]) => <Link key={route} to={route}>{label}</Link>)}
            </nav>
          ))}
          <div className="celebration-footer-contact">
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
            <Link className="celebration-footer-cta" to="/#inquire">Plan your event <ArrowRight size={17} /></Link>
          </div>
        </div>
        <div className="celebration-footer-base">
          <p>© {copyrightYear} EventSphere Management. All rights reserved.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0 })}>Back to top <ArrowUp size={16} /></button>
        </div>
      </div>
    </footer>
  );
}
