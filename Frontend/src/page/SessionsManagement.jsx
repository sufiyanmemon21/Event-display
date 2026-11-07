import EllipseLoader from "@/components/EllipseLoader";
import { RecordBrowser } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { useConfirmation } from "@/hooks/useConfirmation";
import { PageHeading } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import useLiveRefresh from '@/hooks/useLiveRefresh';
import { useEffect, useState } from "react";
import API from "@/api/api";
import SessionActivity from "@/components/SessionActivity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
const emptyForm = {
  title: "",
  speaker: "",
  topic: "",
  location: "",
  description: "",
  startTime: "",
  endTime: ""
};
const fields = [{
  name: "title",
  label: "Session Title",
  maxLength: 150
}, {
  name: "speaker",
  label: "Speaker",
  maxLength: 100
}, {
  name: "topic",
  label: "Topic",
  maxLength: 200
}, {
  name: "location",
  label: "Location / Room",
  maxLength: 200
}];
function localDateTime(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
export default function SessionsManagement() {
  const confirm = useConfirmation();
  const [formOpen, setFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loadedEventId, setLoadedEventId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [eventError, setEventError] = useState("");
  const [sessionError, setSessionError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const busy = saving || loadingSessions || Boolean(deletingId);
  const selectedEvent = events.find(event => event._id === eventId);
  const organizerId = selectedEvent?.organizer?._id || selectedEvent?.organizer;
  const canManage = Boolean(selectedEvent) && (role === "admin" || role === "organizer" && organizerId === userId);
  async function fetchEvents() {
    setLoadingEvents(true);
    setEventError("");
    try {
      const response = await API.get("/events/all");
      setEvents(response.data.events);
    } catch {
      setEventError("Unable to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function loadInitialEvents() {
      try {
        const response = await API.get("/events/all", {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setEvents(response.data.events);
        }
      } catch {
        if (!controller.signal.aborted) {
          setEventError("Unable to load events.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingEvents(false);
      }
    }
    loadInitialEvents();
    return () => controller.abort();
  }, []);
  async function fetchSessions() {
    if (!eventId) return;
    setLoadingSessions(true);
    setSessionError("");
    setLoadedEventId("");
    try {
      const response = await API.get(`/sessions/event/${eventId}`);
      setSessions(response.data.sessions);
      setLoadedEventId(eventId);
    } catch (error) {
      setSessions([]);
      setSessionError(error.response?.data?.msg || "Unable to load sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }
  useLiveRefresh(() => {
    if (!busy && !editingId && loadedEventId === eventId && eventId) void fetchSessions();
  });
  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }
  function changeEvent(event) {
    setEventId(event.target.value);
    setSessions([]);
    setLoadedEventId("");
    setSessionError("");
    resetForm();
  }
  function handleChange(event) {
    const {
      name,
      value
    } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }
  function handleEdit(session) {
    setEditingId(session._id);
    setForm({
      title: session.title,
      speaker: session.speaker,
      topic: session.topic || "",
      location: session.location,
      description: session.description || "",
      startTime: localDateTime(session.startTime),
      endTime: localDateTime(session.endTime)
    });
    setFormOpen(true);
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (fields.some(field => !form[field.name].trim())) {
      toast.error("Please fill all required fields.");
      return;
    }
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("End time must be after start time.");
      return;
    }
    const data = {
      ...form,
      event: eventId,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/sessions/update/${editingId}`, data);
        toast.success("Session updated successfully!");
      } else {
        await API.post("/sessions/create", data);
        toast.success("Session created successfully!");
      }
      resetForm();
      setFormOpen(false);
      await fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to save session.");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(session) {
    if (busy) return;
    if (!(await confirm(`Delete "${session.title}" permanently?`))) {
      return;
    }
    setDeletingId(session._id);
    try {
      await API.delete(`/sessions/delete/${session._id}`);
      setSessions(previous => previous.filter(item => item._id !== session._id));
      if (editingId === session._id) resetForm();
      toast.success("Session deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to delete session.");
    } finally {
      setDeletingId("");
    }
  }
  return <div className="w-full space-y-6">
      <PageHeading title="Schedule" description="Plan speakers, rooms, and sessions for each expo." />

      <Card className="workspace-event-scope">
        <CardHeader>
          <CardTitle>Select an Event</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {eventError ? <div className="space-y-3">
              <p role="alert">{eventError}</p>
              <Button variant="outline" onClick={fetchEvents}>
                Try Again
              </Button>
            </div> : <>
              <Label htmlFor="session-event">Event</Label>
              <WorkspaceSelect id="session-event" value={eventId} onChange={changeEvent} disabled={loadingEvents || busy} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">
                  Select an event
                </option>

                {events.map(event => <option key={event._id} value={event._id}>
                    {event.title}
                  </option>)}
              </WorkspaceSelect>
              {loadingEvents && <EllipseLoader inline label="Loading events" />}

              <Button onClick={fetchSessions} disabled={!eventId || loadingEvents || busy}>
                {loadingSessions ? <EllipseLoader inline /> : "Load Schedule"}
              </Button>

              {!loadingEvents && events.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                  No events are available yet.
                </p>}
            </>}
        </CardContent>
      </Card>

      {canManage && <FormPanel title={editingId ? "Edit session" : "Add session"} trigger="Add Session" open={formOpen} onOpenChange={value => {
      if (!saving) {
        setFormOpen(value);
        if (!value) resetForm();
      }
    }}><Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Session" : "Create Session"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={busy} className="workspace-field-grid">
                {fields.map(field => <div key={field.name} className="space-y-2">
                    <Label htmlFor={`session-${field.name}`}>
                      {field.label}
                    </Label>
                    <Input id={`session-${field.name}`} name={field.name} value={form[field.name]} onChange={handleChange} maxLength={field.maxLength} required />
                  </div>)}

                <div className="space-y-2">
                  <Label htmlFor="session-description">
                    Description (optional)
                  </Label>
                  <Textarea id="session-description" name="description" value={form.description} onChange={handleChange} maxLength={3000} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>

                <div className="workspace-time-range col-span-full grid gap-3 sm:grid-cols-2">
                  {["startTime", "endTime"].map(name => <div key={name} className="space-y-2">
                      <Label htmlFor={`session-${name}`}>
                        {name === "startTime" ? "Start Time" : "End Time"}
                      </Label>
                      <Input id={`session-${name}`} name={name} type="datetime-local" value={form[name]} onChange={handleChange} required />
                    </div>)}
                </div>

                <p className="text-sm text-muted-foreground">
                  Enter times in your computer&apos;s local timezone.
                </p>

                <div className="workspace-form-actions">
                  <Button type="submit">
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Create Session"}
                  </Button>

                  {editingId && <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>}
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card></FormPanel>}

      {loadingSessions ? <EllipseLoader label="Loading sessions" /> : sessionError ? <p role="alert">{sessionError}</p> : loadedEventId === eventId && eventId ? sessions.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            No sessions have been added for this event.
          </p> : <RecordBrowser records={sessions} label="sessions">{visible => <div className="space-y-4">
            <h2 className="text-xl font-semibold">Event Schedule</h2>

            {visible.map(session => <Card key={session._id} className="workspace-schedule-entry border-l-4 border-l-primary">
                <CardContent className="space-y-4 p-6">
                  <h3 className="break-words text-lg font-semibold">
                    {session.title}
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {session.description}
                  </p>

                  <div className="grid gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                    <p>Speaker: {session.speaker}</p>
                    <p><Badge variant="secondary">{session.topic || "Not provided"}</Badge></p>
                    <p>Location: {session.location}</p>
                    <p>
                      Starts:{" "}
                      {new Date(session.startTime).toLocaleString("en-GB")}
                    </p>
                    <p>
                      Ends:{" "}
                      {new Date(session.endTime).toLocaleString("en-GB")}
                    </p>
                  </div>

                  {role === "attendee" && <SessionActivity session={session} />}

                  {canManage && <div className="flex gap-3">
                      <Button variant="outline" onClick={() => handleEdit(session)} disabled={busy}>
                        Edit
                      </Button>

                      <Button variant="destructive" onClick={() => handleDelete(session)} disabled={busy}>
                        {deletingId === session._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>}
                </CardContent>
              </Card>)}
          </div>}</RecordBrowser> : <p className="text-muted-foreground">
          Select an event and click Load Schedule.
        </p>}
    </div>;
}
