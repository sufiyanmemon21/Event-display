import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RecordBrowser } from "@/components/workspace";
import { useConfirmation } from "@/hooks/useConfirmation";
import { PageHeading } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import useLiveRefresh from '@/hooks/useLiveRefresh';
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
export default function BoothSelection() {
  const confirm = useConfirmation();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [boothView, setBoothView] = useState("grid");
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [booths, setBooths] = useState([]);
  const [applications, setApplications] = useState([]);
  const [boothNumber, setBoothNumber] = useState("");
  const [assignmentBoothId, setAssignmentBoothId] = useState("");
  const [assignmentExhibitorId, setAssignmentExhibitorId] = useState("");
  const [loadedEventId, setLoadedEventId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBooths, setLoadingBooths] = useState(false);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState(null);
  const [eventError, setEventError] = useState("");
  const [boothError, setBoothError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const busy = saving || loadingBooths || Boolean(action);
  const selectedEvent = events.find(event => event._id === eventId);
  const organizerId = selectedEvent?.organizer?._id || selectedEvent?.organizer;
  const canManage = Boolean(selectedEvent) && (role === "admin" || role === "organizer" && organizerId === userId);
  const loaded = Boolean(eventId) && loadedEventId === eventId;
  const eventApplications = applications.filter(item => (item.event?._id || item.event) === eventId);
  const myApplication = role === "exhibitor" ? eventApplications[0] : null;
  function isMyBooth(booth) {
    const reservedBy = booth.reservedBy?._id || booth.reservedBy;
    return role === "exhibitor" && Boolean(myApplication) && reservedBy === myApplication._id;
  }
  const hasReservation = booths.some(isMyBooth);
  const approved = myApplication?.status === "Approved";
  const sortedBooths = [...booths].sort((first, second) => first.boothNumber.localeCompare(second.boothNumber, undefined, {
    numeric: true
  }));
  const availableBooths = sortedBooths.filter(booth => booth.status === "Available");
  const reservedBooths = booths.filter(booth => booth.status === "Reserved");
  const reservedApplicationIds = new Set(booths.filter(booth => booth.reservedBy).map(booth => booth.reservedBy._id || booth.reservedBy));
  const eligibleApplications = eventApplications.filter(item => item.status === "Approved" && !item.boothNumber && !reservedApplicationIds.has(item._id));
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
  async function fetchBooths() {
    if (!eventId) return;
    setLoadingBooths(true);
    setBoothError("");
    setLoadedEventId("");
    try {
      const [boothResponse, applicationResponse] = await Promise.all([API.get(`/booths/event/${eventId}`), ["exhibitor", "organizer", "admin"].includes(role) ? API.get("/exhibitors/all") : Promise.resolve(null)]);
      setBooths(boothResponse.data.booths);
      setApplications(applicationResponse?.data?.exhibitors || []);
      setAssignmentBoothId("");
      setAssignmentExhibitorId("");
      setLoadedEventId(eventId);
    } catch (error) {
      setBooths([]);
      setApplications([]);
      setBoothError(error.response?.data?.msg || "Unable to load booth details.");
    } finally {
      setLoadingBooths(false);
    }
  }
  useLiveRefresh(() => {
    if (!busy && loaded) void fetchBooths();
  });
  function changeEvent(event) {
    setEventId(event.target.value);
    setBooths([]);
    setApplications([]);
    setLoadedEventId("");
    setBoothNumber("");
    setAssignmentBoothId("");
    setAssignmentExhibitorId("");
    setBoothError("");
  }
  async function handleCreate(event) {
    event.preventDefault();
    if (busy || !canManage || !boothNumber.trim()) return;
    setSaving(true);
    try {
      await API.post("/booths/create", {
        event: eventId,
        boothNumber: boothNumber.trim()
      });
      setBoothNumber("");
      toast.success("Booth created successfully.");
      setCreateOpen(false);
      await fetchBooths();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to create booth.");
    } finally {
      setSaving(false);
    }
  }
  async function handleAssignment(event) {
    event.preventDefault();
    if (busy || !canManage || !loaded) return;
    const booth = availableBooths.find(item => item._id === assignmentBoothId);
    const application = eligibleApplications.find(item => item._id === assignmentExhibitorId);
    if (!booth || !application) {
      toast.error("Select an available booth and eligible exhibitor.");
      return;
    }
    if (!(await confirm(`Assign booth ${booth.boothNumber} to ${application.companyName}?`))) {
      return;
    }
    setAction({
      id: booth._id,
      type: "assign"
    });
    try {
      const response = await API.post("/booths/assign", {
        boothId: booth._id,
        exhibitorId: application._id
      });
      toast.success(response.data.msg);
      setAssignOpen(false);
      await fetchBooths();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to assign booth.");
      if ([400, 403, 404, 409].includes(error.response?.status)) {
        setAssignOpen(false);
        await fetchBooths();
      }
    } finally {
      setAction(null);
    }
  }
  async function handleReservation(booth, type) {
    if (busy || role !== "exhibitor") return;
    const cancelling = type === "cancel";
    if (cancelling && !isMyBooth(booth)) return;
    if (!cancelling && (!approved || hasReservation || booth.status !== "Available")) {
      return;
    }
    const question = cancelling ? `Cancel your reservation for booth ${booth.boothNumber}?` : `Reserve booth ${booth.boothNumber}?`;
    if (!(await confirm(question))) return;
    setAction({
      id: booth._id,
      type
    });
    try {
      const response = await API.post(`/booths/${type}`, {
        boothId: booth._id
      });
      toast.success(response.data.msg);
      await fetchBooths();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to update reservation.");
      if ([403, 404, 409].includes(error.response?.status)) {
        await fetchBooths();
      }
    } finally {
      setAction(null);
    }
  }
  return <div className="w-full space-y-6">
      <PageHeading title="Booth workspace" description="Coordinate availability, reservations, and exhibitor assignments." />

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
              <Label htmlFor="booth-event">Event</Label>

              <WorkspaceSelect id="booth-event" value={eventId} onChange={changeEvent} disabled={loadingEvents || busy} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">
                  {loadingEvents ? "Loading events..." : "Select an event"}
                </option>

                {events.map(event => <option key={event._id} value={event._id}>
                    {event.title}
                  </option>)}
              </WorkspaceSelect>

              <Button onClick={fetchBooths} disabled={!eventId || busy || loadingEvents}>
                {loadingBooths ? "Loading..." : "Load / Refresh Booths"}
              </Button>

              {!loadingEvents && events.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                  No events are available yet.
                </p>}
            </>}
        </CardContent>
      </Card>

      {canManage && <FormPanel open={createOpen} onOpenChange={value => {
      if (!busy) setCreateOpen(value);
    }} title="Create Booth" compact trigger="Add booth"><Card>
          <CardHeader>
            <CardTitle>Create Booth</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreate} className="workspace-inline-form">
              <div className="space-y-2">
                <Label htmlFor="booth-number">Booth Number</Label>
                <Input id="booth-number" value={boothNumber} onChange={event => setBoothNumber(event.target.value)} placeholder="A1" maxLength={20} disabled={busy} required />
              </div>

              <Button type="submit" disabled={busy}>
                {saving ? "Creating..." : "Create Booth"}
              </Button>
            </form>
          </CardContent>
        </Card></FormPanel>}

      {loadingBooths ? <p role="status">Loading booths...</p> : boothError ? <p role="alert">{boothError}</p> : loaded ? <>
          {canManage && <FormPanel open={assignOpen} onOpenChange={value => {
        if (!busy) setAssignOpen(value);
      }} title="Assign Booth" trigger="Assign a booth"><Card>
              <CardHeader>
                <CardTitle>Assign Booth</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleAssignment}>
                  <fieldset disabled={busy} className="workspace-field-grid">
                    <div className="space-y-2">
                      <Label htmlFor="assignment-booth">
                        Available Booth
                      </Label>
                      <WorkspaceSelect id="assignment-booth" value={assignmentBoothId} onChange={event => setAssignmentBoothId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                        <option value="">Select a booth</option>
                        {availableBooths.map(booth => <option key={booth._id} value={booth._id}>
                            {booth.boothNumber}
                          </option>)}
                      </WorkspaceSelect>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignment-exhibitor">
                        Approved Exhibitor
                      </Label>
                      <WorkspaceSelect id="assignment-exhibitor" value={assignmentExhibitorId} onChange={event => setAssignmentExhibitorId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                        <option value="">Select an exhibitor</option>
                        {eligibleApplications.map(item => <option key={item._id} value={item._id}>
                            {item.companyName}
                            {item.contactPerson?.name ? ` - ${item.contactPerson.name}` : ""}
                          </option>)}
                      </WorkspaceSelect>
                    </div>

                    <Button type="submit" disabled={!assignmentBoothId || !assignmentExhibitorId}>
                      {action?.type === "assign" ? "Assigning..." : "Assign Booth"}
                    </Button>

                    {availableBooths.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                        No available booths. Create a booth first.
                      </p>}

                    {eligibleApplications.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                        No approved exhibitors without a booth.
                      </p>}
                  </fieldset>
                </form>
              </CardContent>
            </Card></FormPanel>}

          {role === "exhibitor" && <p className="text-sm text-muted-foreground">
              {hasReservation ? "Your reserved booth is marked below. Cancel it before selecting another booth." : approved ? "Select an available booth. You can reserve one booth per event." : "An approved application is required to reserve a booth."}
            </p>}

          <div className="grid gap-4 sm:grid-cols-3">
            {[{
          title: "Total Booths",
          value: booths.length
        }, {
          title: "Available",
          value: availableBooths.length
        }, {
          title: "Reserved",
          value: reservedBooths.length
        }].map(item => <Card key={item.title}>
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-2xl font-semibold">{item.value}</p>
                </CardContent>
              </Card>)}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Booth availability</CardTitle><Tabs value={boothView} onValueChange={setBoothView}><TabsList><TabsTrigger value="grid">Grid</TabsTrigger><TabsTrigger value="table">Table</TabsTrigger></TabsList></Tabs></div>
              <p className="text-sm text-muted-foreground">
                {selectedEvent?.title} - sorted by booth number
              </p>
            </CardHeader>

            <CardContent>
              {booths.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                  No booths have been created for this event.
                </p> : <RecordBrowser records={sortedBooths} label="booths" statusKey="status">{visible => boothView === "table" ? <Table><TableHeader><TableRow><TableHead>Booth</TableHead><TableHead>Exhibitor</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map(booth => <TableRow key={booth._id}><TableCell className="font-semibold">{booth.boothNumber}</TableCell><TableCell>{booth.reservedBy?.companyName || "Unassigned"}</TableCell><TableCell><Badge variant={booth.status === "Available" ? "secondary" : "default"}>{booth.status}</Badge></TableCell><TableCell>{role === "exhibitor" && booth.status === "Available" && <Button size="sm" disabled={busy || !approved || hasReservation} onClick={() => handleReservation(booth, "reserve")}>Reserve Booth</Button>}{isMyBooth(booth) && booth.status !== "Available" && <Button size="sm" variant="destructive" disabled={busy} onClick={() => handleReservation(booth, "cancel")}>Cancel Reservation</Button>}</TableCell></TableRow>)}</TableBody></Table> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map(booth => {
                const available = booth.status === "Available";
                const mine = isMyBooth(booth);
                const processing = action?.id === booth._id;
                return <div key={booth._id} className={`workspace-booth-tile flex flex-col gap-3 rounded-xl border p-5 ${available ? "border-primary/25 bg-primary/5" : "border-border bg-muted/40"}`}>
                        <h2 className="break-words text-xl font-semibold">
                          {booth.boothNumber}
                        </h2>

                        <p className={`text-sm font-medium ${available ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                          {booth.status}
                        </p>

                        {mine && <p className="text-sm font-semibold">
                            Your Booth
                          </p>}

                        {booth.reservedBy?.companyName && <p className="break-words text-sm">
                            {booth.reservedBy.companyName}
                          </p>}

                        {role === "exhibitor" && available && <Button onClick={() => handleReservation(booth, "reserve")} disabled={busy || !approved || hasReservation} className="mt-auto w-full">
                            {processing ? "Reserving..." : "Reserve Booth"}
                          </Button>}

                        {mine && !available && <Button variant="destructive" onClick={() => handleReservation(booth, "cancel")} disabled={busy} className="mt-auto w-full">
                            {processing ? "Cancelling..." : "Cancel Reservation"}
                          </Button>}
                      </div>;
              })}
                </div>}</RecordBrowser>}
            </CardContent>
          </Card>
        </> : <p className="text-muted-foreground">
          Select an event and click Load / Refresh Booths.
        </p>}
    </div>;
}
