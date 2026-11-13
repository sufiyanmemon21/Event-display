import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import API from "@/api/api";
import EllipsisLoader from "@/components/EllipsisLoader";
import PublicPageShell from "@/components/landing/PublicPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import useAuth from "@/hooks/useAuth";
import useExpos, { isExpo } from "@/hooks/useExpos";
import { getEventImage } from "@/components/landing/eventImages";

export default function EventBooking() {
  const [params] = useSearchParams();
  const initialEventId = params.get("event") || "";
  return <BookingForm key={initialEventId} initialEventId={initialEventId} />;
}

function BookingForm({ initialEventId }) {
  const user = useAuth();
  const [eventId, setEventId] = useState(initialEventId);
  const catalog = useExpos();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const available = catalog.items.filter((item) => !isExpo(item));
  const selected = available.find((item) => item._id === eventId);
  const alreadyBooked = bookings.some(
    (item) => (item.event?._id || item.event) === eventId,
  );
  const busy = catalog.loading || loadingBookings || saving;

  useEffect(() => {
    document.title = "Book your event — EventSphere";
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    API.get("/attendees/all", { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setBookings(data.attendees);
          setBookingError("");
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setBookingError(
            failure.response?.data?.msg || "Unable to check your bookings.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingBookings(false);
      });
    return () => controller.abort();
  }, [revision]);

  function refreshBookings() {
    setLoadingBookings(true);
    setRevision((value) => value + 1);
  }

  async function submit(event) {
    event.preventDefault();
    if (
      user?.role !== "attendee" ||
      busy ||
      bookingError ||
      alreadyBooked
    )
      return;
    const fields = new FormData(event.currentTarget);
    const phone = String(fields.get("phone") || "").trim();
    const guestCount = Number(fields.get("guestCount"));
    const nextFieldErrors = {};
    if (!selected) nextFieldErrors.event = "Choose an available event to continue.";
    if (!user?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      nextFieldErrors.email = "Your account email address is invalid.";
    if (!/^[+0-9(). -]{5,32}$/.test(phone) || !/\d/.test(phone))
      nextFieldErrors.phone = "Enter a valid phone number.";
    if (!Number.isSafeInteger(guestCount) || guestCount < 1)
      nextFieldErrors.guestCount = "Enter a whole number of guests (at least 1).";
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length) {
      setError("Please check the highlighted fields and try again.");
      return;
    }
    if (!selected) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const { data } = await API.post("/attendees/register", {
        event: selected._id,
        phone,
        guestCount,
        details: String(fields.get("details") || "").trim(),
      });
      setBookings((previous) => [...previous, data.registration]);
      setNotice(data.msg);
      setFieldErrors({});
      refreshBookings();
    } catch (failure) {
      setError(
        failure.response?.data?.msg ||
          "Unable to request a booking. Check My bookings before trying again.",
      );
      if (failure.response?.status === 409) refreshBookings();
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicPageShell>
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-8">
        <header className="mx-auto mb-8 max-w-2xl space-y-3 text-center sm:mb-10">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#ead8b4] bg-[#fbf0d7] text-[#80570e]">
            <CalendarDays size={23} aria-hidden="true" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[.24em] text-[#75483d]">
            Event booking
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#362824] sm:text-5xl">
            Book Your <span className="text-[#956811]">Event</span>
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#59443d] sm:text-base">
            Choose an experience, share a few details, and the event host will
            follow up on your request.
          </p>
        </header>
        <section
          className="overflow-hidden rounded-[1.5rem] border border-[#e3cbbb] bg-[#fffdfa] shadow-[0_20px_60px_#52301e17]"
          aria-labelledby="booking-title"
        >
          <div className="flex items-center gap-4 border-b border-[#ead9ce] bg-[#fffaf4] px-5 py-5 sm:px-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f5e6c8] text-[#80570e]">
              <ClipboardList size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="booking-title"
                className="font-serif text-xl font-semibold text-[#362824] sm:text-2xl"
              >
                Event Booking Form
              </h2>
              <p className="mt-1 text-sm text-[#59443d]">
                Your details are shared with the event host for review.
              </p>
            </div>
          </div>
          {notice && (
            <div
              role="status"
              className="mx-5 mt-5 rounded-xl border border-[#829872] bg-[#f1f6ed] p-4 text-sm text-[#263d20] sm:mx-8"
              aria-live="polite"
            >
              {notice}{" "}
              <Link className="font-semibold underline" to="/profile">
                View My bookings
              </Link>
            </div>
          )}
          {(catalog.error || bookingError) && (
            <div className="mx-5 mt-5 flex flex-wrap items-center gap-3 sm:mx-8">
              <p role="alert" className="text-sm font-medium text-[#8b2525]">
                {catalog.error
                  ? "Unable to load bookable events."
                  : bookingError}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={catalog.error ? catalog.retry : refreshBookings}
              >
                Try again
              </Button>
            </div>
          )}
          {busy && !saving && (
            <div className="px-5 pt-5 sm:px-8">
              <EllipsisLoader label="Loading booking options" />
            </div>
          )}
          {!catalog.loading &&
            !catalog.error &&
            (available.length === 0 || (eventId && !selected)) && (
              <p className="mx-5 mt-5 rounded-lg bg-[#f8f1e7] p-3 text-sm text-[#513d34] sm:mx-8">
                {available.length === 0
                  ? "No bookable events are available right now."
                  : "This listing is unavailable for booking. Choose another event."}
              </p>
            )}
          {alreadyBooked && !notice && (
            <p className="mx-5 mt-5 rounded-lg bg-[#f8f1e7] p-3 text-sm text-[#513d34] sm:mx-8">
              You already have a booking for this listing.{" "}
              <Link className="underline" to="/profile">
                View My bookings
              </Link>
            </p>
          )}
          <form
            noValidate
            onSubmit={submit}
            className="space-y-0"
            aria-describedby={error ? "booking-error" : undefined}
            aria-busy={saving}
          >
            <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
            <fieldset disabled={busy} className="min-w-0">
              <legend className="mb-4 flex items-center gap-2 font-semibold text-[#362824]">
                <ClipboardList
                  size={18}
                  aria-hidden="true"
                  className="text-[#80570e]"
                />{" "}
                <span>01</span> Choose an event
              </legend>
              <div className="grid gap-2 text-sm font-medium">
                  <label htmlFor="booking-event">Event listing</label>
                  <WorkspaceSelect
                    id="booking-event"
                    value={selected?._id || ""}
                    required
                    aria-required="true"
                    disabled={busy || !available.length}
                    aria-invalid={Boolean(fieldErrors.event)}
                    aria-describedby={
                      fieldErrors.event ? "booking-event-error" : undefined
                    }
                    onChange={(event) => {
                      setEventId(event.target.value);
                      setError("");
                      setNotice("");
                      setFieldErrors((previous) => ({
                        ...previous,
                        event: "",
                      }));
                    }}
                  >
                    <option value="">Choose an event</option>
                    {available.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title}
                      </option>
                    ))}
                  </WorkspaceSelect>
              </div>
              {fieldErrors.event && (
                <p id="booking-event-error" className="mt-2 text-sm font-medium text-[#9b2727]" role="alert">
                  {fieldErrors.event}
                </p>
              )}
              {selected && (
                <div className="mt-4 flex min-w-0 items-center gap-4 rounded-2xl border border-[#ead9ce] bg-[#fffaf4] p-3 sm:p-4">
                  <ImageWithSkeleton
                    src={getEventImage(selected)}
                    alt=""
                    className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="font-serif text-lg font-semibold text-[#80570e]">
                      {selected.title}
                    </p>
                    <p className="text-sm text-[#513d34]">
                      {selected.category || "Event"}
                      {selected.organizer?.name
                        ? ` · Hosted by ${selected.organizer.name}`
                        : ""}
                    </p>
                    {selected.description && (
                      <p className="line-clamp-2 text-xs text-[#59443d]">
                        {selected.description}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-[#59443d]">
                      <MapPin
                        size={14}
                        aria-hidden="true"
                        className="shrink-0 text-[#80570e]"
                      />
                      {selected.location || "Location to be announced"}
                    </p>
                  </div>
                </div>
              )}
            </fieldset>
            <fieldset disabled={busy} className="min-w-0 border-t border-[#eee2d8] pt-6">
              <legend className="mb-4 flex items-center gap-2 font-semibold text-[#362824]">
                <UserRound
                  size={18}
                  aria-hidden="true"
                  className="text-[#80570e]"
                />{" "}
                <span>02</span> Contact information
              </legend>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label htmlFor="booking-name" className="grid min-w-0 gap-2 text-sm font-semibold text-[#47362f]">
                  <span className="flex items-center gap-2">
                    <UserRound size={15} aria-hidden="true" className="text-[#80570e]" />
                    Full Name
                  </span>
                  <Input
                    id="booking-name"
                    autoComplete="name"
                    readOnly
                    value={user?.name || ""}
                    className="h-11 border-[#dcc6b7] bg-[#faf5ef] text-[#493930] read-only:cursor-default focus-visible:border-[#80570e] focus-visible:ring-[#80570e]/20"
                  />
                </label>
                <label htmlFor="booking-email" className="grid min-w-0 gap-2 text-sm font-semibold text-[#47362f]">
                  <span className="flex items-center gap-2">
                    <Mail size={15} aria-hidden="true" className="text-[#80570e]" />
                    Email
                  </span>
                  <Input
                    id="booking-email"
                    type="email"
                    autoComplete="email"
                    readOnly
                    value={user?.email || ""}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "booking-email-error" : undefined
                    }
                    className="h-11 border-[#dcc6b7] bg-[#faf5ef] text-[#493930] read-only:cursor-default aria-invalid:border-[#9b2727] focus-visible:border-[#80570e] focus-visible:ring-[#80570e]/20"
                  />
                  {fieldErrors.email && (
                    <span id="booking-email-error" className="text-sm font-medium text-[#9b2727]" role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </label>
                <label htmlFor="booking-phone" className="grid min-w-0 gap-2 text-sm font-semibold text-[#47362f]">
                  <span className="flex items-center gap-2">
                    <Phone size={15} aria-hidden="true" className="text-[#80570e]" />
                    Phone Number <span className="text-[#80570e]">*</span>
                  </span>
                  <Input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={user?.phone || ""}
                    inputMode="tel"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={
                      fieldErrors.phone ? "booking-phone-error" : undefined
                    }
                    className="h-11 border-[#dcc6b7] bg-white aria-invalid:border-[#9b2727] focus-visible:border-[#80570e] focus-visible:ring-[#80570e]/20"
                    onChange={() => {
                      setFieldErrors((previous) => ({
                        ...previous,
                        phone: "",
                      }));
                      setError("");
                    }}
                  />
                  {fieldErrors.phone && (
                    <span id="booking-phone-error" className="text-sm font-medium text-[#9b2727]" role="alert">
                      {fieldErrors.phone}
                    </span>
                  )}
                </label>
                <label htmlFor="booking-guests" className="grid min-w-0 gap-2 text-sm font-semibold text-[#47362f]">
                  <span className="flex items-center gap-2">
                    <UsersRound size={15} aria-hidden="true" className="text-[#80570e]" />
                    Number of Guests <span className="text-[#80570e]">*</span>
                  </span>
                  <Input
                    id="booking-guests"
                    name="guestCount"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={1}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.guestCount)}
                    aria-describedby={
                      fieldErrors.guestCount
                        ? "booking-guests-error"
                        : undefined
                    }
                    className="h-11 border-[#dcc6b7] bg-white aria-invalid:border-[#9b2727] focus-visible:border-[#80570e] focus-visible:ring-[#80570e]/20"
                    onChange={() => {
                      setFieldErrors((previous) => ({
                        ...previous,
                        guestCount: "",
                      }));
                      setError("");
                    }}
                  />
                  {fieldErrors.guestCount && (
                    <span id="booking-guests-error" className="text-sm font-medium text-[#9b2727]" role="alert">
                      {fieldErrors.guestCount}
                    </span>
                  )}
                </label>
                <label htmlFor="booking-details" className="grid min-w-0 gap-2 text-sm font-semibold text-[#47362f] sm:col-span-2">
                  Additional Details <span className="font-normal text-[#59443d]">(optional)</span>
                  <Textarea
                    id="booking-details"
                    name="details"
                    rows={4}
                    maxLength={2000}
                    placeholder="Anything the organizer should know?"
                    className="min-h-28 resize-y border-[#dcc6b7] bg-white focus-visible:border-[#80570e] focus-visible:ring-[#80570e]/20"
                  />
                </label>
              </div>
            </fieldset>
            {error && (
              <p id="booking-error" role="alert" className="rounded-xl border border-[#c98282] bg-[#fff3f1] p-3 text-sm font-medium text-[#812525]">
                {error}
              </p>
            )}
            </div>
            <div className="flex flex-col gap-4 border-t border-[#ead9ce] bg-[#fffaf4] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-[#513d34]">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-[#80570e]" aria-hidden="true" />
                You can track the host’s decision in My bookings.
              </p>
              <Button
                type="submit"
                className="min-h-12 w-full rounded-xl bg-[#70483d] px-7 font-semibold text-white shadow-[0_5px_12px_#51342b2b] hover:bg-[#59382f] focus-visible:ring-2 focus-visible:ring-[#80570e] focus-visible:ring-offset-2 sm:w-auto"
                disabled={
                  busy ||
                  alreadyBooked ||
                  Boolean(bookingError) ||
                  Boolean(catalog.error)
                }
                aria-busy={saving}
              >
                {saving ? (
                  <EllipsisLoader scope="inline" label="Submitting booking" />
                ) : alreadyBooked ? (
                  "Already requested"
                ) : (
                  "Submit booking request"
                )}
              </Button>
            </div>
          </form>
        </section>
        <Link
          to="/"
          className="mx-auto mt-7 flex min-h-11 w-fit items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#59382f] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80570e]"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </main>
    </PublicPageShell>
  );
}
