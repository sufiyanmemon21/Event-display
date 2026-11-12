import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Ticket, UserRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import API from "@/api/api";
import EllipsisLoader from "@/components/EllipsisLoader";
import PublicPageShell from "@/components/landing/PublicPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WorkspaceSelect from "@/components/workspace-select";
import { getEventImage } from "@/components/landing/eventImages";
import useAuth from "@/hooks/useAuth";
import useExpos, { isExpo } from "@/hooks/useExpos";
import { isPastEvent } from "@/lib/eventDates";

export default function ExpoBooking() {
  const [params] = useSearchParams();
  const initialExpoId = params.get("expo") || "";
  return <ExpoBookingForm key={initialExpoId} initialExpoId={initialExpoId} />;
}

function ExpoBookingForm({ initialExpoId }) {
  const user = useAuth();
  const catalog = useExpos();
  const [expoId, setExpoId] = useState(initialExpoId);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [revision, setRevision] = useState(0);
  const [includeFriends, setIncludeFriends] = useState(false);
  const [friendCount, setFriendCount] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const available = catalog.items.filter(
    (item) => isExpo(item) && !isPastEvent(item.date),
  );
  const selected = available.find((item) => item._id === expoId);
  const alreadyBooked = bookings.some(
    (item) => (item.event?._id || item.event) === expoId,
  );
  const busy = catalog.loading || bookingsLoading || saving;

  useEffect(() => {
    document.title = "Request an expo ticket — EventSphere";
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    API.get("/attendees/all", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setBookings(data.attendees);
        setBookingsError("");
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setBookingsError(
            failure.response?.data?.msg ||
              "Unable to check your ticket requests.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookingsLoading(false);
      });
    return () => controller.abort();
  }, [revision]);

  function refreshBookings() {
    setBookingsLoading(true);
    setRevision((value) => value + 1);
  }

  async function submit(event) {
    event.preventDefault();
    if (
      user?.role !== "attendee" ||
      busy ||
      bookingsError ||
      !selected ||
      alreadyBooked ||
      isPastEvent(selected.date)
    )
      return;

    const guests = includeFriends ? Number(friendCount) : 1;
    if (!Number.isSafeInteger(guests) || guests < 1) {
      setError("Enter a positive whole number of tickets.");
      return;
    }

    const fields = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await API.post("/attendees/register", {
        event: selected._id,
        ticketType: "Standard",
        phone: fields.get("phone").trim(),
        guestCount: guests,
      });
      setBookings((previous) => [...previous, data.registration]);
      setNotice(data.msg);
      refreshBookings();
    } catch (failure) {
      setError(
        failure.response?.data?.msg ||
          "Unable to request an expo ticket. Check My bookings before trying again.",
      );
      if (failure.response?.status === 409) refreshBookings();
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicPageShell>
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-8">
        <header className="mb-8 space-y-3 text-center sm:mb-11">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#f7ead1] text-[#956811]">
            <Ticket size={22} aria-hidden="true" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#87584d]">
            Expo tickets
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Request Your <span className="text-[#956811]">Expo Ticket</span>
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#69534b] sm:text-base">
            Choose an expo and request your ticket. The admin team will review
            your request.
          </p>
        </header>

        <section
          className="rounded-3xl border border-[#e2c9bd] bg-[#fffcf8] p-4 shadow-[0_16px_40px_#52301e16] sm:p-8"
          aria-labelledby="expo-booking-title"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f7ead1] text-[#956811]">
              <Ticket size={22} aria-hidden="true" />
            </span>
            <div>
              <h2
                id="expo-booking-title"
                className="font-serif text-2xl font-semibold"
              >
                Ticket Request Form
              </h2>
              <p className="text-sm text-[#69534b]">
                Your account details are used for this request.
              </p>
            </div>
          </div>

          {notice && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-[#b7c5ab] bg-[#f2f7ed] p-4 text-sm text-[#34472f]"
            >
              {notice}{" "}
              <Link className="font-semibold underline" to="/profile">
                View My bookings
              </Link>
            </div>
          )}

          {(catalog.error || bookingsError) && (
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <p role="alert" className="text-sm text-red-800">
                {catalog.error
                  ? "Unable to load expos."
                  : bookingsError}
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
            <EllipsisLoader label="Loading expo ticket options" />
          )}

          {alreadyBooked && !notice && (
            <p className="mb-4 text-sm text-[#69534b]">
              You already have a ticket request for this expo.{" "}
              <Link className="underline" to="/profile">
                View My bookings
              </Link>
            </p>
          )}

          <form onSubmit={submit} className="space-y-6">
            <fieldset disabled={busy} className="min-w-0 space-y-4">
              <legend className="mb-3 flex items-center gap-2 font-semibold">
                <Ticket
                  size={18}
                  aria-hidden="true"
                  className="text-[#956811]"
                />{" "}
                Select Expo
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid min-w-0 gap-2 text-sm font-medium">
                  Expo
                  <WorkspaceSelect
                    value={selected?._id || ""}
                    disabled={busy || !available.length}
                    onChange={(change) => {
                      setExpoId(change.target.value);
                      setError("");
                      setNotice("");
                    }}
                  >
                    <option value="">Choose an expo</option>
                    {available.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title}
                      </option>
                    ))}
                  </WorkspaceSelect>
                </label>
                {selected && (
                  <div className="flex items-center gap-2 text-sm text-[#69534b]">
                    <CalendarDays
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-[#956811]"
                    />
                    {selected.date
                      ? new Date(selected.date).toLocaleDateString("en-GB", {
                          dateStyle: "long",
                          timeZone: "UTC",
                        })
                      : "Date to be announced"}
                  </div>
                )}
              </div>
              {selected && (
                <div className="grid gap-4 rounded-2xl bg-[#fbf7f0] p-4 text-sm text-[#69534b] sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] sm:items-center">
                  <img
                    src={getEventImage(selected, catalog.items.indexOf(selected))}
                    alt={`${selected.title} cover image`}
                    className="block aspect-video w-full rounded-xl object-cover"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.description && (
                      <p className="sm:col-span-2">{selected.description}</p>
                    )}
                    <p className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-[#956811]"
                      />
                      <span>
                        <span className="block text-xs text-[#87584d]">
                          When
                        </span>
                        {selected.date
                          ? new Date(selected.date).toLocaleDateString(
                              "en-GB",
                              { dateStyle: "long", timeZone: "UTC" },
                            )
                          : "To be announced"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-[#956811]"
                      />
                      <span>
                        <span className="block text-xs text-[#87584d]">
                          Location
                        </span>
                        {selected.location || "To be announced"}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset disabled={busy} className="min-w-0 space-y-4">
              <legend className="mb-3 flex items-center gap-2 font-semibold">
                <UserRound
                  size={18}
                  aria-hidden="true"
                  className="text-[#956811]"
                />{" "}
                Contact information
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid min-w-0 gap-2 text-sm font-medium">
                  Full Name
                  <Input autoComplete="name" readOnly value={user?.name || ""} />
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-medium">
                  Email Address
                  <Input
                    type="email"
                    autoComplete="email"
                    readOnly
                    value={user?.email || ""}
                  />
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-medium sm:col-span-2">
                  Phone Number
                  <Input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={user?.phone || ""}
                    minLength={5}
                    maxLength={32}
                    required
                  />
                </label>
              </div>
            </fieldset>

            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[#e2c9bd] px-4 text-sm">
              <input
                type="checkbox"
                checked={includeFriends}
                onChange={(change) => setIncludeFriends(change.target.checked)}
                disabled={busy}
                className="size-4 accent-[#956811]"
              />
              Also book tickets for friends
            </label>

            {includeFriends && (
              <label className="grid max-w-xs gap-2 text-sm font-medium">
                Number of tickets
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={friendCount}
                  onChange={(change) => setFriendCount(change.target.value)}
                  disabled={busy}
                  required
                />
              </label>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-800">
                {error}
              </p>
            )}

            <div className="border-t border-[#e2c9bd] pt-4">
              <Button
                type="submit"
                className="min-h-11 w-full bg-[#956811] text-white hover:bg-[#7a530c]"
                disabled={
                  busy ||
                  !selected ||
                  alreadyBooked ||
                  Boolean(bookingsError)
                }
              >
                {saving ? (
                  <EllipsisLoader scope="inline" label="Requesting ticket" />
                ) : (
                  "Request Ticket"
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-[#69534b]">
                Your ticket request will be reviewed by the admin team.
              </p>
            </div>
          </form>
        </section>

        <Link
          to="/expos"
          className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm font-semibold text-[#87584d] hover:underline"
        >
          <ArrowLeft size={16} /> Back to expos
        </Link>
      </main>
    </PublicPageShell>
  );
}
