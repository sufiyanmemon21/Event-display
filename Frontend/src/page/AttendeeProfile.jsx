import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Download, QrCode } from 'lucide-react';
import PublicPageShell from '@/components/landing/PublicPageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import API, { clearAuth } from '@/api/api';
import useAuth from '@/hooks/useAuth';
import useLiveRefresh from '@/hooks/useLiveRefresh';
import { isPastEvent } from '@/lib/eventDates';

const statuses = ['Pending', 'Confirmed', 'Rejected', 'Cancelled'];
const tickets = ['Standard', 'VIP', 'Regular'];
const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });

function BookingCard({ booking }) {
  const [qr, setQr] = useState('');
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const status = booking.status || 'Confirmed';
  const event = booking.event;

  useEffect(() => () => {
    if (qr) URL.revokeObjectURL(qr);
  }, [qr]);

  async function getPass(format) {
    setWorking(format);
    setError('');
    try {
      const response = await API.get(`/attendees/${booking._id}/pass`, {
        params: { format },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      if (format === 'qr') {
        setQr(url);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `eventsphere-pass-${booking._id}.pdf`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setError('The pass could not be issued. Refresh the booking status and try again.');
    } finally {
      setWorking('');
    }
  }

  return (
    <article className="grid min-w-0 content-start gap-4 rounded-xl border border-[#e2c9bd] bg-[#fffaf6] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#87584d]">{booking.ticketType} ticket</p>
          <h3 className="mt-1 break-words font-serif text-2xl">{event?.title || 'Event unavailable'}</h3>
        </div>
        <Badge variant={status === 'Confirmed' ? 'default' : 'outline'}>{status}</Badge>
      </div>
      {event && (
        <div className="grid gap-1 text-sm text-[#756a64]">
          {event.date && <p className="flex items-center gap-2"><CalendarDays size={16} /> {dateFormat.format(new Date(event.date))}</p>}
          <p>{event.location}</p>
        </div>
      )}
      <p className="break-all text-xs text-[#756a64]">Reference {booking._id}</p>
      {status === 'Pending' && <p className="text-sm text-[#756a64]">Waiting for the organizer to confirm your booking.</p>}
      {status === 'Confirmed' && event && (
        <div className="grid gap-3 border-t border-[#e2c9bd] pt-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={Boolean(working)} onClick={() => getPass('qr')}><QrCode size={16} /> {working === 'qr' ? 'Generating…' : 'Show QR code'}</Button>
            <Button className="bg-[#87584d] text-white hover:bg-[#694239]" disabled={Boolean(working)} onClick={() => getPass('pdf')}><Download size={16} /> {working === 'pdf' ? 'Preparing…' : 'Download pass'}</Button>
          </div>
          {qr && <div className="flex flex-wrap items-end gap-3">
            <img className="size-36 rounded-md border bg-white" src={qr} alt={`Entry QR code for ${event.title}`} />
            <a className="text-sm font-semibold underline" href={qr} download={`eventsphere-qr-${booking._id}.png`}>Download QR code</a>
          </div>}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    </article>
  );
}

export default function AttendeeProfile() {
  const user = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const eventId = params.get('event');
  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('All');
  const [ticket, setTicket] = useState('Standard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eventError, setEventError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);

  useLiveRefresh(() => setRefresh(value => value + 1));
  useEffect(() => {
    document.title = 'My profile — EventSphere';
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const { data } = await API.get('/attendees/all', { signal: controller.signal });
        if (controller.signal.aborted) return;
        setBookings(data.attendees);
        setError('');
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.response?.data?.msg || 'Unable to load your bookings.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    if (!eventId) return;
    const controller = new AbortController();
    API.get(`/events/${encodeURIComponent(eventId)}`, { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setEvent(data.event);
        setEventError('');
      })
      .catch(() => {
        if (!controller.signal.aborted) setEventError('This event could not be loaded.');
      });
    return () => controller.abort();
  }, [eventId]);

  async function requestBooking(e) {
    e.preventDefault();
    if (saving || !eventId) return;
    if (isPastEvent(event?.date)) {
      setEventError('Bookings are closed for past events.');
      return;
    }
    setSaving(true);
    setEventError('');
    try {
      const { data } = await API.post('/attendees/register', { event: eventId, ticketType: ticket });
      setNotice(data.msg);
      setStatus('All');
      setParams({}, { replace: true });
      setRefresh(value => value + 1);
    } catch (failure) {
      setEventError(failure.response?.data?.msg || 'Unable to request a booking.');
    } finally {
      setSaving(false);
    }
  }

  const alreadyBooked = bookings.find(item => item.event?._id === eventId);
  const visible = status === 'All' ? bookings : bookings.filter(item => (item.status || 'Confirmed') === status);

  return (
    <PublicPageShell>
      <main className="mx-auto min-h-[65vh] max-w-6xl space-y-7 px-4 pb-14 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e2c9bd] pb-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-[#87584d]">Attendee profile</p>
            <h1 className="break-words font-serif text-4xl sm:text-5xl">{user?.name || 'My profile'}</h1>
            <p className="mt-2 break-all text-sm text-[#756a64]">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={() => { clearAuth(); navigate('/', { replace: true }); }}>Sign out</Button>
        </header>

        {notice && <p role="status" className="rounded-lg border border-[#e2c9bd] bg-[#fffaf6] p-4">{notice}</p>}
        {eventId && (
          <section className="max-w-2xl space-y-4 rounded-xl border border-[#e2c9bd] bg-[#fffaf6] p-5">
            <h2 className="font-serif text-2xl">Request a booking</h2>
            {eventError && <p role="alert" className="text-sm text-red-800">{eventError}</p>}
            {event?._id === eventId && (
              <>
                <p className="font-medium">{event.title}</p>
                {alreadyBooked ? <p className="text-sm text-[#756a64]">You already have a booking for this event.</p> : isPastEvent(event.date) ? (
                  <p className="text-sm text-[#756a64]">Bookings are closed for past events.</p>
                ) : (
                  <form onSubmit={requestBooking} className="flex flex-wrap items-end gap-3">
                    <label className="grid gap-1 text-sm font-medium">Ticket type
                      <select value={ticket} onChange={e => setTicket(e.target.value)} className="min-h-10 rounded-md border border-[#e2c9bd] bg-white px-3">
                        {tickets.map(type => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                    <Button className="bg-[#87584d] text-white hover:bg-[#694239]" disabled={saving || loading}>{saving ? 'Requesting…' : 'Request booking'}</Button>
                  </form>
                )}
              </>
            )}
          </section>
        )}

        <section aria-labelledby="my-bookings">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 id="my-bookings" className="font-serif text-3xl">My bookings</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">Status
                <select value={status} onChange={e => setStatus(e.target.value)} className="min-h-10 rounded-md border border-[#e2c9bd] bg-[#fffaf6] px-3">
                  {['All', ...statuses].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
              <Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Refresh</Button>
            </div>
          </div>
          {error && <p role="alert" className="mb-3 text-sm text-red-800">{error}</p>}
          {loading ? <EllipsisLoader label="Loading your bookings" /> : visible.length ? (
            <div className="grid gap-4 md:grid-cols-2">{visible.map(item => <BookingCard key={item._id} booking={item} />)}</div>
          ) : !error && <div className="rounded-xl border border-[#e2c9bd] bg-[#fffaf6] p-6">
            <p>{status === 'All' ? 'You don’t have any bookings yet.' : `No ${status.toLowerCase()} bookings.`}</p>
            <Link to="/#catalog-events" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline">Explore events <ArrowUpRight size={15} /></Link>
          </div>}
        </section>
      </main>
    </PublicPageShell>
  );
}
