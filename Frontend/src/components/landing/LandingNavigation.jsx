import BookLink from "@/components/landing/BookLink";
import EllipseLoader from "@/components/EllipseLoader";
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, Menu, MessageSquareText, X } from 'lucide-react';
import { Popover } from 'radix-ui';
import WebsiteMark from './WebsiteMark';
import useAuth from '@/hooks/useAuth';
import API, { clearAuth } from '@/api/api';

const notificationDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function NotificationBell({ items, unread, loading, error, saving, onRefresh, onReadAll }) {
  return <Popover.Root onOpenChange={open => { if (open) onRefresh(); }}>
    <Popover.Trigger type="button" className="attendee-nav-icon attendee-notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
      <Bell size={19} aria-hidden="true" />{unread > 0 && <span aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content align="end" sideOffset={10} collisionPadding={12} aria-label="Notifications" className="z-[60] flex max-h-[min(32rem,var(--radix-popover-content-available-height))] w-[min(29rem,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[#e2c9bd] bg-[#fffaf6] text-[#362824] shadow-[0_12px_35px_#3f281d26]">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e2c9bd] bg-[#fffdf9] px-4 py-3">
          <h2 className="font-serif text-xl font-semibold">Notifications</h2>
          <button type="button" disabled={!unread || saving} onClick={onReadAll} className="min-h-8 text-sm font-semibold text-[#87584d] hover:underline disabled:opacity-50">
            {saving ? 'Marking as read…' : 'Mark all as read'}
          </button>
        </div>
        {error && <p role="alert" className="border-b border-[#e2c9bd] px-4 py-3 text-sm text-red-800">{error}</p>}
        {items.length ? <ul className="min-h-0 divide-y divide-[#eadbd1] overflow-y-auto overscroll-contain">
          {items.map(item => <li key={item._id} className={`flex items-start gap-3 px-4 py-3 ${item.read ? 'bg-[#fffdf9]' : 'bg-[#faf0e4]'}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f2e3d3] text-[#87584d]"><Bell size={16} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className={`break-words text-sm leading-relaxed ${item.read ? '' : 'font-semibold'}`}>{item.message}</p>
              {item.createdAt && <time dateTime={item.createdAt} className="mt-1 block text-xs text-[#69534b]">{notificationDate.format(new Date(item.createdAt))}</time>}
            </div>
          </li>)}
        </ul> : !error && (loading ? <EllipseLoader label="Loading notifications" /> : <p className="px-4 py-6 text-sm text-[#69534b]">You have no notifications yet.</p>)}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}

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
  const { pathname, search, hash } = useLocation();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [notificationRefresh, setNotificationRefresh] = useState(0);
  const isAttendee = user?.role === 'attendee';
  const accountId = user?._id;

  useEffect(() => {
    if (!isAttendee || !accountId) return;
    const controller = new AbortController();
    API.get('/notifications/mine', { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setUnread(data.unreadCount || 0);
      setNotifications(data.notifications || []);
      setNotificationError('');
    }).catch(() => {
      if (!controller.signal.aborted) setNotificationError('Unable to load notifications. Close and reopen the panel to try again.');
    }).finally(() => {
      if (!controller.signal.aborted) setNotificationLoading(false);
    });
    return () => controller.abort();
  }, [accountId, isAttendee, pathname, notificationRefresh]);

  async function markNotificationsRead() {
    if (markingRead || !unread) return;
    setMarkingRead(true);
    try {
      await API.patch('/notifications/read-all');
      setNotifications(items => items.map(item => ({ ...item, read: true })));
      setUnread(0);
      setNotificationError('');
      setNotificationRefresh(value => value + 1);
    } catch {
      setNotificationError('Unable to mark notifications as read. Try again.');
    } finally {
      setMarkingRead(false);
    }
  }

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
  const actions = isAttendee ? (
    <>
      <BookLink onClick={closeMenu}>Book Now</BookLink>
      <Link to="/messages" className="attendee-nav-icon" aria-label="Messages" title="Messages" aria-current={pathname === "/messages" ? "page" : undefined} state={pathname === "/messages" ? undefined : { from: pathname + search + hash }} onClick={closeMenu}><MessageSquareText size={19} aria-hidden="true" /></Link>
      <Link to="/profile" className="celebration-nav-action" aria-current={pathname === '/profile' ? 'page' : undefined} onClick={closeMenu}>Profile</Link>
      <button type="button" onClick={signOut}>Log out</button>
      <NotificationBell items={notifications} unread={unread} loading={notificationLoading} error={notificationError} saving={markingRead} onRefresh={() => {
        setNotificationLoading(true);
        setNotificationRefresh(value => value + 1);
      }} onReadAll={markNotificationsRead} />
    </>
  ) : user ? (
    <>
      <button type="button" onClick={signOut}>Log out</button>
      <Link to="/dashboard" className="celebration-nav-action" onClick={closeMenu}>Dashboard</Link>
    </>
  ) : (
    <>
      <BookLink onClick={closeMenu}>Book Now</BookLink>
      <Link to="/login" onClick={closeMenu}>Log in</Link>
      <Link to="/signup" className="celebration-nav-action" onClick={closeMenu}>Sign up <ArrowUpRight size={13} aria-hidden="true" className="inline" /></Link>
    </>
  );

  return (<>
    <header className={isAttendee ? 'celebration-nav celebration-nav-attendee' : 'celebration-nav'} onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        closeMenu();
        menuButton.current?.focus();
      }
    }}>
      <div className="celebration-nav-bar">
        <Link className="celebration-brand" to="/" onClick={closeMenu} aria-label="EventSphere home">
          <WebsiteMark /> EventSphere
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
  </>);
}
