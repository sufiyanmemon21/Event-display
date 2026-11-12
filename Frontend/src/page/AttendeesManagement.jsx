import PassScanner from "@/components/PassScanner";
import EllipsisLoader from "@/components/EllipsisLoader";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/workspace";
import { RecordBrowser } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useConfirmation } from "@/hooks/useConfirmation";
import { isExpo } from "@/hooks/useExpos";
import useAuth from "@/hooks/useAuth";
import { isPastEvent } from "@/lib/eventDates";
async function fetchRegistrationData(isAttendee, signal) {
  const [registrationResponse, eventResponse] = await Promise.all([
    API.get("/attendees/all", {
      signal,
    }),
    isAttendee
      ? API.get("/events/all", {
          signal,
        })
      : Promise.resolve(null),
  ]);
  return {
    attendees: registrationResponse.data.attendees,
    events: eventResponse?.data?.events || [],
  };
}
export default function AttendeesManagement() {
  const user = useAuth();
  const [eventFilter, setEventFilter] = useState("");
  const confirm = useConfirmation();
  const [formOpen, setFormOpen] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [ticketType, setTicketType] = useState("Standard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reviewing, setReviewing] = useState("");
  const role = localStorage.getItem("userRole");
  const isAttendee = role === "attendee";
  const isOrganizer = role === "organizer" || role === "admin" || role === "exhibitor";
  const canReview = (event) => event && (isExpo(event) ? role === "admin" : role === "exhibitor" && String(event.reviewExhibitor?._id || event.reviewExhibitor) === String(user?._id || user?.id));
  const canView = isAttendee || isOrganizer;
  useEffect(() => {
    if (!canView) return;
    const controller = new AbortController();
    async function loadInitialData() {
      try {
        const data = await fetchRegistrationData(isAttendee, controller.signal);
        if (controller.signal.aborted) return;
        setAttendees(data.attendees);
        setEvents(data.events);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error.response?.data?.msg || "Unable to load registrations.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadInitialData();
    return () => controller.abort();
  }, [canView, isAttendee]);
  async function refreshData() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchRegistrationData(isAttendee);
      setAttendees(data.attendees);
      setEvents(data.events);
    } catch (error) {
      setLoadError(
        error.response?.data?.msg || "Unable to load registrations.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleRegister(event) {
    event.preventDefault();
    if (saving || !eventId) return;
    const selectedEvent = events.find((item) => item._id === eventId);
    if (selectedEvent && isExpo(selectedEvent) && isPastEvent(selectedEvent.date)) {
      toast.error("Bookings are closed for past events.");
      return;
    }
    setSaving(true);
    try {
      const response = await API.post("/attendees/register", {
        event: eventId,
        ticketType,
      });
      toast.success(response.data.msg);
      setEventId("");
      setFormOpen(false);
      setTicketType("Standard");
      await refreshData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to register for event.");
    } finally {
      setSaving(false);
    }
  }
  async function reviewBooking(booking, status) {
    if (reviewing) return;
    if (
      status !== "Confirmed" &&
      !(await confirm(
        `${status === "Rejected" ? "Reject" : "Cancel"} this booking?`,
      ))
    )
      return;
    setReviewing(booking._id);
    try {
      const { data } = await API.patch(`/attendees/${booking._id}/status`, {
        status,
      });
      setAttendees((previous) =>
        previous.map((item) =>
          item._id === booking._id ? { ...item, status: data.status } : item,
        ),
      );
      toast.success(`Booking ${data.status.toLowerCase()}.`);
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Unable to update booking status.",
      );
    } finally {
      setReviewing("");
    }
  }
  if (!canView) {
    return (
      <p className="p-6">
        Event registration requires an attendee account. Exhibitors can apply
        through the Exhibitors page.
      </p>
    );
  }
  return (
    <div className="w-full space-y-6">
      <PageHeading
        title={isAttendee ? "My registrations" : "Attendee registrations"}
        description={
          isOrganizer
            ? "Review booking requests and manage attendee registrations."
            : "Track your bookings and download confirmed passes from your profile."
        }
      />

      {["admin", "exhibitor"].includes(role) && <PassScanner />}
      {isAttendee && (
        <FormPanel
          open={formOpen}
          onOpenChange={(value) => {
            if (!saving) setFormOpen(value);
          }}
          title="Register for an Event"
          compact
          trigger="Register for an expo"
        >
          <Card>
            <CardHeader>
              <CardTitle>Register for an Event</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRegister}>
                <fieldset
                  disabled={saving || loading || Boolean(loadError)}
                  className="workspace-field-grid workspace-registration-fields min-[640px]:[.workspace-form-body_fieldset&]:[grid-template-columns:minmax(0,_1.65fr)_minmax(0,_1fr)]"
                >
                  <div className="space-y-2">
                    <Label htmlFor="attendee-event">Event</Label>
                    <WorkspaceSelect
                      id="attendee-event"
                      value={eventId}
                      onChange={(event) => setEventId(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select an event</option>

                      {events.map((event) => {
                        const closed = isExpo(event) && isPastEvent(event.date);
                        return (
                          <option
                            key={event._id}
                            value={event._id}
                            disabled={closed}
                          >
                            {closed
                              ? `${event.title} (booking closed)`
                              : event.title}
                          </option>
                        );
                      })}
                    </WorkspaceSelect>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-type">Ticket Type</Label>
                    <WorkspaceSelect
                      id="ticket-type"
                      value={ticketType}
                      onChange={(event) => setTicketType(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="Standard">Standard</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                    </WorkspaceSelect>
                  </div>

                  <Button
                    type="submit"
                    disabled={!eventId || events.length === 0}
                  >
                    {saving && (
                      <EllipsisLoader scope="inline" label="Registering" />
                    )}{" "}
                    Register
                  </Button>

                  {!loading && events.length === 0 && (
                    <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                      No events are available yet.
                    </p>
                  )}
                </fieldset>
              </form>
            </CardContent>
          </Card>
        </FormPanel>
      )}

      <div className="max-w-md space-y-2">
        <Label htmlFor="registration-event-filter">Expo / Event</Label>
        <WorkspaceSelect id="registration-event-filter" value={eventFilter} onChange={event => setEventFilter(event.target.value)}>
          <option value="">All Expos and Events</option>
          {[...new Map(attendees.filter(item => item.event).map(item => [item.event._id, item.event])).values()].map(event => <option key={event._id} value={event._id}>{event.title}</option>)}
        </WorkspaceSelect>
      </div>
      {loading ? (
        <EllipsisLoader scope="page" label="Loading registrations" />
      ) : loadError ? (
        <div className="space-y-3">
          <p role="alert">{loadError}</p>

          <Button variant="outline" onClick={refreshData}>
            Try Again
          </Button>
        </div>
      ) : !isOrganizer && attendees.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground [.workspace-form-body_fieldset_>_p&]:py-[14px]">
          No registrations found.
        </p>
      ) : (
        <RecordBrowser
          records={attendees.filter(item => !eventFilter || item.event?._id === eventFilter)}
          label="registrations"
          statusOptions={
            isOrganizer
              ? ["Pending", "Confirmed", "Rejected", "Cancelled"]
              : undefined
          }
          statusValue={(item) => item.status || "Confirmed"}
          allStatusesLabel="All Registrations"
          emptyText="No registrations found."
        >
          {(visible) => (
            <div className="overflow-hidden rounded-xl border bg-card [.workspace-form-body_fieldset_>_p&]:py-[14px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee / Event</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Event date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    {isOrganizer && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((registration) => (
                    <TableRow key={registration._id}>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium">
                          {isOrganizer
                            ? registration.user?.name || "Unavailable"
                            : registration.event?.title || "Event unavailable"}
                        </p>
                        {isOrganizer && (
                          <p className="mt-1 text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                            {registration.event?.title || "Event unavailable"}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {isOrganizer
                          ? registration.user?.email || "Unavailable"
                          : "Your registration"}
                        {(registration.phone ||
                          registration.guestCount ||
                          registration.details) && (
                          <details className="mt-1 max-w-64 whitespace-normal">
                            <summary className="cursor-pointer text-sm font-medium text-primary">
                              Booking details
                            </summary>
                            <div className="mt-2 space-y-1 [overflow-wrap:anywhere]">
                              {registration.phone && (
                                <p>Phone: {registration.phone}</p>
                              )}
                              {registration.guestCount && (
                                <p>Guests: {registration.guestCount}</p>
                              )}
                              {registration.details && (
                                <p className="whitespace-pre-wrap">
                                  {registration.details}
                                </p>
                              )}
                            </div>
                          </details>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {registration.ticketType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {registration.event?.date
                          ? new Date(
                              registration.event.date,
                            ).toLocaleDateString("en-GB", {
                              timeZone: "UTC",
                            })
                          : "Unavailable"}
                      </TableCell>
                      <TableCell className="max-w-60 whitespace-normal">
                        {registration.event?.location || "Unavailable"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {registration.status || "Confirmed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{registration.checkedInAt ? `Checked in ${new Date(registration.checkedInAt).toLocaleString()}` : "Not checked in"}</TableCell>
                      {isOrganizer && (
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {!canReview(registration.event) && <span className="text-muted-foreground">Assigned reviewer only</span>}
                            {canReview(registration.event) && registration.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  disabled={Boolean(reviewing)}
                                  onClick={() =>
                                    reviewBooking(registration, "Confirmed")
                                  }
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={Boolean(reviewing)}
                                  onClick={() =>
                                    reviewBooking(registration, "Rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {canReview(registration.event) && (!registration.status ||
                              ["Pending", "Confirmed"].includes(
                                registration.status,
                              )) && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(reviewing)}
                                onClick={() =>
                                  reviewBooking(registration, "Cancelled")
                                }
                              >
                                Cancel booking
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </RecordBrowser>
      )}
    </div>
  );
}
