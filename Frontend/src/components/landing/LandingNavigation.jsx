import { useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Flower2, Menu, X } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { clearAuth } from '@/api/api';

const links = [
  ['Home', '/'],
  ['About', '/#about'],
  ['Events', '/#catalog-events'],
  ['Expos', '/#catalog-expos'],
  ['Gallery', '/gallery'],
  ['Contact', '/contact'],
];

export default function LandingNavigation() {
  const menuId = useId();
  const menuButton = useRef(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const user = useAuth();
  const { pathname, hash } = useLocation();

  function closeMenu() {
    setOpen(false);
  }

  function signOut() {
    try {
      clearAuth();
      closeMenu();
      setError('');
    } catch {
      setError('Unable to sign out. Please try again.');
    }
  }

  function isActive(href) {
    if (href === '/') return pathname === '/' && !hash;
    if (href.startsWith('/#')) return pathname === '/' && hash === href.slice(1);
    return pathname === href || (href === '/gallery' && pathname === '/event-gallery');
  }

  const navigation = links.map(([label, href]) => (
    <Link key={href} to={href} aria-current={isActive(href) ? (href.startsWith('/#') ? 'location' : 'page') : undefined} onClick={closeMenu}>{label}</Link>
  ));
  const actions = user ? (
    <>
      <button type="button" onClick={signOut}>Log out</button>
      <Link to="/dashboard" className="celebration-nav-action" onClick={closeMenu}>Dashboard</Link>
    </>
  ) : (
    <>
      <Link to="/login" onClick={closeMenu}>Log in</Link>
      <Link to="/signup" className="celebration-nav-action" onClick={closeMenu}>Sign up <ArrowUpRight size={13} aria-hidden="true" className="inline" /></Link>
    </>
  );

  return (
    <header className="celebration-nav" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        closeMenu();
        menuButton.current?.focus();
      }
    }}>
      <div className="celebration-nav-bar">
        <Link className="celebration-brand" to="/" onClick={closeMenu} aria-label="EventSphere home">
          <Flower2 size={24} strokeWidth={1.5} aria-hidden="true" /> EventSphere
        </Link>
        <nav aria-label="Main navigation" className="celebration-nav-links">{navigation}</nav>
        <div className="celebration-nav-actions">{actions}</div>
        <button type="button" className="celebration-nav-toggle" ref={menuButton} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && <nav id={menuId} aria-label="Mobile navigation" className="celebration-mobile-nav">{navigation}{actions}</nav>}
      {error && <p className="celebration-nav-error" role="alert">{error}</p>}
    </header>
  );
}
