import { IntegrationNotice } from "@/components/integration-state";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading, FormPanel, RecordBrowser } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import useLiveRefresh from '@/hooks/useLiveRefresh';
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
export default function EventsManagement() {
  const confirm = useConfirmation();
  const [details, setDetails] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const isOrganizer = role === "organizer" || role === "admin";
  const busy = saving || Boolean(deletingId);
  async function fetchEvents() {
    setLoading(true);
    setLoadError("");
    try {
      const response = await API.get("/events/all");
      setEvents(response.data.events);
    } catch {
      setLoadError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
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
          setLoadError("Failed to load events. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadInitialEvents();
    return () => controller.abort();
  }, []);
  useLiveRefresh(() => {
    if (!busy) void fetchEvents();
  });
  function clearForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setCategory("");
    setEditingId("");
  }
  function canManage(event) {
    const organizerId = event.organizer?._id || event.organizer;
    return isOrganizer && (role === "admin" || organizerId === userId);
  }
  function handleEdit(event) {
    setEditingId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date.slice(0, 10));
    setLocation(event.location);
    setCategory(event.category);
    setFormOpen(true);
  }
  async function handleSaveEvent(event) {
    event.preventDefault();
    if (busy) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      category: category.trim()
    };
    if (Object.values(data).some(value => !value)) {
      toast.error("Please fill all fields.");
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/events/update/${editingId}`, data);
        toast.success("Event updated successfully!");
      } else {
        await API.post("/events/create", data);
        toast.success("Event created successfully!");
      }
      clearForm();
      setFormOpen(false);
      await fetchEvents();
    } catch (error) {
      const message = error.response?.data?.msg || "Failed to save event.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(event) {
    if (busy) return;
    if (!(await confirm(`Delete "${event.title}" permanently?`))) {
      return;
    }
    setDeletingId(event._id);
    try {
      await API.delete(`/events/delete/${event._id}`);
      setEvents(previous => previous.filter(item => item._id !== event._id));
      if (editingId === event._id) clearForm();
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete event.");
    } finally {
      setDeletingId("");
    }
  }
  return <div className="w-full space-y-6">
      <PageHeading title="Expos" description="Bring your next experience to life. Manage your expo portfolio and event details.">
      {isOrganizer && <FormPanel showCancel={false} title={editingId ? "Edit expo" : "Create expo"} trigger="Create Expo" open={formOpen} onOpenChange={value => {
        if (!saving) {
          setFormOpen(value);
          if (!value) {
            clearForm();
            setSaveError("");
          }
        }
      }}>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveEvent}>
              <fieldset disabled={busy} className="space-y-4">
                <div className="col-span-full space-y-2">
                  <Label htmlFor="event-title">Title</Label>
                  <Input id="event-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={150} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea id="event-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={5000} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" value={date} onChange={event => setDate(event.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" value={location} onChange={event => setLocation(event.target.value)} maxLength={200} required />
                </div>

                <div className="col-span-full space-y-2">
                  <Label htmlFor="event-category">Category</Label>
                  <Input id="event-category" value={category} onChange={event => setCategory(event.target.value)} maxLength={100} required />
                </div>

                {saveError && <p role="alert" className="col-span-full text-sm text-destructive">{saveError}</p>}
                <div className="col-span-full flex flex-col-reverse justify-end gap-3 border-t pt-5 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => {
                    clearForm();
                    setSaveError("");
                    setFormOpen(false);
                  }}>Cancel</Button>
                  <Button type="submit">{saving ? "Saving…" : editingId ? "Save Changes" : "Create Expo"}</Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
        </FormPanel>}

      </PageHeading>
      <IntegrationNotice title="Existing expo workflow">Title, description, date, location, and category are connected to the current API. Publishing status and expo-image uploads require backend support.</IntegrationNotice>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Expo collection</h2><p className="text-sm text-muted-foreground">{events.length} expos in your workspace</p></div><div className="space-y-2"><Label htmlFor="expo-date-filter">Filter by date</Label><Input id="expo-date-filter" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} /></div></div>

        {loading ? <p role="status">Loading events...</p> : loadError ? <div className="space-y-3">
            <p role="alert">{loadError}</p>
            <Button variant="outline" onClick={fetchEvents}>
              Try Again
            </Button>
          </div> : events.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">No events found.</p> : <RecordBrowser records={events.filter(item => !dateFilter || item.date?.slice(0, 10) === dateFilter)} label="expos" searchText={item => [item.title, item.location, item.category, item.organizer?.name].join(" ")}>{visible => <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Expo</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Organizer</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map(event => <TableRow key={event._id}><TableCell className="max-w-80 whitespace-normal"><Button variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left font-semibold" onClick={() => setDetails(event)}>{event.title}</Button><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.description}</p></TableCell><TableCell><Badge variant="secondary">{event.category}</Badge></TableCell><TableCell>{new Date(event.date).toLocaleDateString("en-GB", {
                    timeZone: "UTC"
                  })}</TableCell><TableCell className="max-w-60 whitespace-normal">{event.location}</TableCell><TableCell>{event.organizer?.name || "Unavailable"}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${event.title}`} disabled={busy}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setDetails(event)}><Eye className="size-4" />View details</DropdownMenuItem>{canManage(event) && <><DropdownMenuItem onSelect={() => handleEdit(event)}><Pencil className="size-4" />Edit expo</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => handleDelete(event)}><Trash2 className="size-4" />{deletingId === event._id ? "Deleting…" : "Delete expo"}</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></div>}</RecordBrowser>}
      </div>
      <Sheet open={Boolean(details)} onOpenChange={open => {
      if (!open) setDetails(null);
    }}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>{details?.title}</SheetTitle><SheetDescription>Expo details</SheetDescription></SheetHeader>{details && <div className="space-y-6 p-6"><Badge variant="secondary">{details.category}</Badge><p className="whitespace-pre-wrap text-sm leading-relaxed">{details.description}</p><dl className="grid gap-4 text-sm"><div><dt className="text-muted-foreground">Date</dt><dd>{new Date(details.date).toLocaleDateString("en-GB", {
                  timeZone: "UTC"
                })}</dd></div><div><dt className="text-muted-foreground">Location</dt><dd>{details.location}</dd></div><div><dt className="text-muted-foreground">Organizer</dt><dd>{details.organizer?.name || "Unavailable"}</dd></div></dl>{canManage(details) && <Button onClick={() => {
            handleEdit(details);
            setDetails(null);
          }}>Edit expo</Button>}</div>}</SheetContent></Sheet>
    </div>;
}
