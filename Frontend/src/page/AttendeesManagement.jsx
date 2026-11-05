import { IntegrationNotice } from "@/components/integration-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
async function fetchRegistrationData(isAttendee, signal) {
  const [registrationResponse, eventResponse] = await Promise.all([API.get("/attendees/all", {
    signal
  }), isAttendee ? API.get("/events/all", {
    signal
  }) : Promise.resolve(null)]);
  return {
    attendees: registrationResponse.data.attendees,
    events: eventResponse?.data?.events || []
  };
}
export default function AttendeesManagement() {
  const [formOpen, setFormOpen] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [ticketType, setTicketType] = useState("Standard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const isAttendee = role === "attendee";
  const isOrganizer = role === "organizer" || role === "admin";
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
          setLoadError(error.response?.data?.msg || "Unable to load registrations.");
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
      setLoadError(error.response?.data?.msg || "Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  }
  async function handleRegister(event) {
    event.preventDefault();
    if (saving || !eventId) return;
    setSaving(true);
    try {
      const response = await API.post("/attendees/register", {
        event: eventId,
        ticketType
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
  if (!canView) {
    return <p className="p-6">
        Event registration requires an attendee account.
        Exhibitors can apply through the Exhibitors page.
      </p>;
  }
  return <div className="w-full space-y-6">
      <PageHeading title={isAttendee ? "My registrations" : "Attendee registrations"} description="Track event participation and manage your registration details." />

      <IntegrationNotice title="Registration records connected">The current API stores attendee, event, and ticket type. Booking decisions, check-in, entry passes, and administrator registration edits require backend support.</IntegrationNotice>
      {isAttendee && <FormPanel open={formOpen} onOpenChange={value => {
      if (!saving) setFormOpen(value);
    }} title="Register for an Event" trigger="Register for an expo"><Card>
          <CardHeader>
            <CardTitle>Register for an Event</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister}>
              <fieldset disabled={saving || loading || Boolean(loadError)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee-event">Event</Label>
                  <WorkspaceSelect id="attendee-event" value={eventId} onChange={event => setEventId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="">Select an event</option>

                    {events.map(event => <option key={event._id} value={event._id}>
                        {event.title}
                      </option>)}
                  </WorkspaceSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-type">Ticket Type</Label>
                  <WorkspaceSelect id="ticket-type" value={ticketType} onChange={event => setTicketType(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="Regular">Regular</option>
                  </WorkspaceSelect>
                </div>

                <Button type="submit" disabled={!eventId || events.length === 0}>
                  {saving ? "Registering..." : "Register"}
                </Button>

                {!loading && events.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                    No events are available yet.
                  </p>}
              </fieldset>
            </form>
          </CardContent>
        </Card></FormPanel>}

      {loading ? <p role="status">Loading registrations...</p> : loadError ? <div className="space-y-3">
          <p role="alert">{loadError}</p>

          <Button variant="outline" onClick={refreshData}>
            Try Again
          </Button>
        </div> : attendees.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No registrations found.
        </p> : <RecordBrowser records={attendees} label="registrations">{visible => <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Attendee / Event</TableHead><TableHead>Contact</TableHead><TableHead>Ticket</TableHead><TableHead>Event date</TableHead><TableHead>Location</TableHead></TableRow></TableHeader><TableBody>{visible.map(registration => <TableRow key={registration._id}><TableCell className="whitespace-normal"><p className="font-medium">{isOrganizer ? registration.user?.name || "Unavailable" : registration.event?.title || "Event unavailable"}</p>{isOrganizer && <p className="mt-1 text-xs text-muted-foreground">{registration.event?.title || "Event unavailable"}</p>}</TableCell><TableCell>{isOrganizer ? registration.user?.email || "Unavailable" : "Your registration"}</TableCell><TableCell><Badge variant="secondary">{registration.ticketType}</Badge></TableCell><TableCell>{registration.event?.date ? new Date(registration.event.date).toLocaleDateString("en-GB", {
                  timeZone: "UTC"
                }) : "Unavailable"}</TableCell><TableCell className="max-w-60 whitespace-normal">{registration.event?.location || "Unavailable"}</TableCell></TableRow>)}</TableBody></Table></div>}</RecordBrowser>}
    </div>;
}
