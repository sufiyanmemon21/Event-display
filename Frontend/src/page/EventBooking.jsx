import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, UserRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '@/api/api';
import EllipsisLoader from '@/components/EllipsisLoader';
import PublicPageShell from '@/components/landing/PublicPageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import WorkspaceSelect from '@/components/workspace-select';
import useAuth from '@/hooks/useAuth';
import useExpos, { isExpo } from '@/hooks/useExpos';
import { isPastEvent } from '@/lib/eventDates';

export default function EventBooking() {
  const [params] = useSearchParams();
  const initialEventId = params.get('event') || '';
  return <BookingForm key={initialEventId} initialEventId={initialEventId} />;
}

function BookingForm({ initialEventId }) {
  const user = useAuth();
  const [eventId, setEventId] = useState(initialEventId);
  const catalog = useExpos();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const available = catalog.items.filter(item => !isPastEvent(item.date));
  const selected = available.find(item => item._id === eventId);
  const alreadyBooked = bookings.some(item => (item.event?._id || item.event) === eventId);
  const busy = catalog.loading || loadingBookings || saving;

  useEffect(() => {
    document.title = 'Book your event — EventSphere';
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    API.get('/attendees/all', { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) {
        setBookings(data.attendees);
        setBookingError('');
      }
    }).catch(failure => {
      if (!controller.signal.aborted) setBookingError(failure.response?.data?.msg || 'Unable to check your bookings.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingBookings(false);
    });
    return () => controller.abort();
  }, [revision]);

  function refreshBookings() {
    setLoadingBookings(true);
    setRevision(value => value + 1);
  }

  async function submit(event) {
    event.preventDefault();
    if (user?.role !== 'attendee' || busy || bookingError || !selected || alreadyBooked || isPastEvent(selected.date)) return;
    const fields = new FormData(event.currentTarget);
    const guestCount = Number(fields.get('guestCount'));
    if (!Number.isSafeInteger(guestCount) || guestCount < 1) {
      setError('Enter a positive whole number of guests.');
      return;
    }
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const { data } = await API.post('/attendees/register', {
        event: selected._id,
        phone: fields.get('phone').trim(),
        guestCount,
        details: fields.get('details').trim()
      });
      setBookings(previous => [...previous, data.registration]);
      setNotice(data.msg);
      refreshBookings();
    } catch (failure) {
      setError(failure.response?.data?.msg || 'Unable to request a booking. Check My bookings before trying again.');
      if (failure.response?.status === 409) refreshBookings();
    } finally {
      setSaving(false);
    }
  }

  return <PublicPageShell>
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-8">
      <header className="mb-8 space-y-3 text-center sm:mb-11">
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#87584d]">Event booking</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">Book Your <span className="text-[#956811]">Event</span></h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#69534b] sm:text-base">Choose a scheduled event or expo. The organizer will review your booking request.</p>
      </header>
      <section className="rounded-3xl border border-[#e2c9bd] bg-[#fffcf8] p-4 shadow-[0_16px_40px_#52301e16] sm:p-8" aria-labelledby="booking-title">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f7ead1] text-[#956811]"><ClipboardList size={22} aria-hidden="true" /></span>
          <div><h2 id="booking-title" className="font-serif text-2xl font-semibold">Event Booking Form</h2><p className="text-sm text-[#69534b]">Fill in your details below.</p></div>
        </div>
        {notice && <div role="status" className="mb-5 rounded-xl border border-[#b7c5ab] bg-[#f2f7ed] p-4 text-sm text-[#34472f]">{notice} <Link className="font-semibold underline" to="/profile">View My bookings</Link></div>}
        {(catalog.error || bookingError) && <div className="mb-5 flex flex-wrap items-center gap-3">
          <p role="alert" className="text-sm text-red-800">{catalog.error ? 'Unable to load bookable events.' : bookingError}</p>
          <Button type="button" variant="outline" onClick={catalog.error ? catalog.retry : refreshBookings}>Try again</Button>
        </div>}
        {busy && !saving && <EllipsisLoader label="Loading booking options" />}
        {!catalog.loading && !catalog.error && (available.length === 0 || (eventId && !selected)) && <p className="mb-4 text-sm text-[#69534b]">{available.length === 0 ? 'No bookable events are available right now.' : 'This listing is unavailable for booking. Choose another event.'}</p>}
        {alreadyBooked && !notice && <p className="mb-4 text-sm text-[#69534b]">You already have a booking for this listing. <Link className="underline" to="/profile">View My bookings</Link></p>}
        <form onSubmit={submit} className="space-y-6">
          <fieldset disabled={busy} className="min-w-0 space-y-3">
            <legend className="mb-3 flex items-center gap-2 font-semibold"><CalendarDays size={18} aria-hidden="true" className="text-[#956811]" /> Event information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2 text-sm font-medium">
                <label htmlFor="booking-event">Select Event</label>
                <WorkspaceSelect id="booking-event" value={selected?._id || ''} disabled={busy || !available.length} onChange={event => {
                  setEventId(event.target.value);
                  setError('');
                  setNotice('');
                }}>
                  <option value="">Select an event</option>
                  {available.map(item => <option key={item._id} value={item._id}>{item.title}{isExpo(item) ? ' (Expo)' : ''}</option>)}
                </WorkspaceSelect>
              </div>
              <label className="grid min-w-0 gap-2 text-sm font-medium">Event Date
                <Input type="date" readOnly value={selected?.date?.slice(0, 10) || ''} />
              </label>
            </div>
          </fieldset>
          <fieldset disabled={busy} className="min-w-0">
            <legend className="mb-3 flex items-center gap-2 font-semibold"><UserRound size={18} aria-hidden="true" className="text-[#956811]" /> Contact information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid min-w-0 gap-2 text-sm font-medium">Full Name<Input autoComplete="name" readOnly value={user?.name || ''} /></label>
              <label className="grid min-w-0 gap-2 text-sm font-medium">Email<Input type="email" autoComplete="email" readOnly value={user?.email || ''} /></label>
              <label className="grid min-w-0 gap-2 text-sm font-medium">Phone Number<Input name="phone" type="tel" autoComplete="tel" defaultValue={user?.phone || ''} minLength={5} maxLength={32} required /></label>
              <label className="grid min-w-0 gap-2 text-sm font-medium">Number of Guests<Input name="guestCount" type="number" min={1} step={1} defaultValue={1} required /></label>
              <label className="grid min-w-0 gap-2 text-sm font-medium sm:col-span-2">Additional Details<Textarea name="details" rows={4} maxLength={2000} placeholder="Anything the organizer should know?" /></label>
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2c9bd] pt-4">
            <p className="text-sm text-[#69534b]">Track the organizer’s decision in My bookings.</p>
            <Button type="submit" className="bg-[#87584d] text-white hover:bg-[#694239]" disabled={busy || !selected || alreadyBooked || Boolean(bookingError)}>
              {saving && <EllipsisLoader scope="inline" label="Submitting booking" />} Submit Booking
            </Button>
          </div>
        </form>
      </section>
      <Link to="/" className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm font-semibold text-[#87584d] hover:underline"><ArrowLeft size={16} /> Back to Home</Link>
    </main>
  </PublicPageShell>;
}
