
import { useConfirmation } from "@/hooks/useConfirmation";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading, FormPanel, RecordBrowser } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import { isExpo } from "@/hooks/useExpos";
import { getEventImage } from "@/components/landing/eventImages";
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

async function prepareCoverImage(file) {
  if (file.size < 3 * 1024 * 1024) return file;

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1600 / image.naturalWidth, 1200 / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const cover = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.88));
    if (!cover || cover.size >= 3 * 1024 * 1024) throw new Error("Cover encoding failed");
    return cover;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function EventsManagement({ listingType = "expo" }) {
  const listingName = listingType === "expo" ? "Expo" : "Event";
  const collectionName = `${listingName}s`;
  const listingLabel = listingName.toLowerCase();
  const confirm = useConfirmation();
  const [details, setDetails] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [selectedType, setSelectedType] = useState(listingType);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const isOrganizer = role === "organizer" || role === "admin";
  const busy = saving || Boolean(deletingId);
  const listings = events.filter((item) => isExpo(item) === (listingType === "expo"));
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
    setTime("");
    setEndTime("");
    setLocation("");
    setCategory("");
    setSelectedType(listingType);
    setImageFile(null);
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
    setTime(event.time || "");
    setEndTime(event.endTime || "");
    setLocation(event.location);
    setCategory(event.category);
    setSelectedType(isExpo(event) ? "expo" : "event");
    setImageFile(null);
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
      category: category.trim(),
      listingType: selectedType
    };
    if (Object.values(data).some(value => !value)) {
      toast.error("Please fill all fields.");
      return;
    }
    const eventData = { ...data, time, endTime };
    setSaveError("");
    setSaving(true);
    try {
      const payload = imageFile ? new FormData() : eventData;
      if (imageFile) {
        const cover = await prepareCoverImage(imageFile).catch(() => null);
        if (!cover) {
          setSaveError("Could not prepare this cover image. Choose a valid JPEG, PNG, WebP, or AVIF image.");
          return;
        }
        Object.entries(eventData).forEach(([key, value]) => payload.append(key, value));
        payload.append("image", cover, cover === imageFile ? imageFile.name : "cover.webp");
      }
      const options = imageFile ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
      if (editingId) {
        await API.put(`/events/update/${editingId}`, payload, options);
        toast.success("Event updated successfully!");
      } else {
        await API.post("/events/create", payload, options);
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
      <PageHeading title={collectionName} description={`Manage your ${collectionName.toLowerCase()} and their public listings.`}>
      {isOrganizer && <FormPanel showCancel={false} closeButtonOnly title={editingId ? `Edit ${listingLabel}` : `Create ${listingLabel}`} trigger={`Create ${listingName}`} open={formOpen} onOpenChange={value => {
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
              {editingId ? `Edit ${listingName}` : `Create ${listingName}`}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveEvent}>
              <fieldset disabled={busy} className="workspace-field-grid">
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
                  <Label htmlFor="event-time">Start time (optional)</Label>
                  <Input id="event-time" type="time" value={time} onChange={event => setTime(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-end-time">End time (optional)</Label>
                  <Input id="event-end-time" type="time" value={endTime} onChange={event => setEndTime(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" value={location} onChange={event => setLocation(event.target.value)} maxLength={200} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-category">Category</Label>
                  <Input id="event-category" value={category} onChange={event => setCategory(event.target.value)} maxLength={100} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-listing-type">Public listing type</Label>
                  <WorkspaceSelect id="event-listing-type" value={selectedType} onChange={event => setSelectedType(event.target.value)} required>
                    <option value="event">Event</option>
                    <option value="expo">Expo</option>
                  </WorkspaceSelect>
                </div>

                <div className="col-span-full space-y-2">
                  <Label htmlFor="event-image">Cover image (optional)</Label>
                  <Input id="event-image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-describedby="event-image-help" onChange={event => setImageFile(event.target.files?.[0] || null)} />
                  <p id="event-image-help" className="text-xs text-muted-foreground">JPEG, PNG, WebP, or AVIF. Large photos are optimized automatically for the public listing.</p>
                </div>

                {saveError && <p role="alert" className="col-span-full text-sm text-destructive">{saveError}</p>}
                <div className="workspace-form-actions">
                  <Button type="submit">{saving ? "Saving…" : editingId ? "Save Changes" : `Create ${selectedType === "expo" ? "Expo" : "Event"}`}</Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
        </FormPanel>}

      </PageHeading>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">{collectionName} collection</h2><p className="text-sm text-muted-foreground">{listings.length} {collectionName.toLowerCase()} in your workspace</p></div><div className="space-y-2"><Label htmlFor="expo-date-filter">Filter by date</Label><Input id="expo-date-filter" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} /></div></div>

        {loading ? <p role="status">Loading events...</p> : loadError ? <div className="space-y-3">
            <p role="alert">{loadError}</p>
            <Button variant="outline" onClick={fetchEvents}>
              Try Again
            </Button>
          </div> : listings.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">No {collectionName.toLowerCase()} found.</p> : <RecordBrowser records={listings.filter(item => !dateFilter || item.date?.slice(0, 10) === dateFilter)} label={collectionName.toLowerCase()} searchText={item => [item.title, item.location, item.category, item.organizer?.name].join(" ")}>{visible => <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead className="w-28">Image</TableHead><TableHead>{listingName}</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Organizer</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map((event, index) => <TableRow key={event._id}><TableCell><img src={getEventImage(event, index)} alt="" loading="lazy" width={80} height={52} className="h-[52px] w-20 max-w-none rounded-md border object-cover" /></TableCell><TableCell className="max-w-80 whitespace-normal"><Button variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left font-semibold" onClick={() => setDetails(event)}>{event.title}</Button><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.description}</p></TableCell><TableCell><Badge variant="secondary">{event.category}</Badge></TableCell><TableCell>{new Date(event.date).toLocaleDateString("en-GB", {
                    timeZone: "UTC"
                  })}</TableCell><TableCell className="max-w-60 whitespace-normal">{event.location}</TableCell><TableCell>{event.organizer?.name || "Unavailable"}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${event.title}`} disabled={busy}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setDetails(event)}><Eye className="size-4" />View details</DropdownMenuItem>{canManage(event) && <><DropdownMenuItem onSelect={() => handleEdit(event)}><Pencil className="size-4" />Edit {listingLabel}</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => handleDelete(event)}><Trash2 className="size-4" />{deletingId === event._id ? "Deleting…" : `Delete ${listingLabel}`}</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></div>}</RecordBrowser>}
      </div>
      <Sheet open={Boolean(details)} onOpenChange={open => {
      if (!open) setDetails(null);
    }}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>{details?.title}</SheetTitle><SheetDescription>{listingName} details</SheetDescription></SheetHeader>{details && <div className="space-y-6 p-6"><Badge variant="secondary">{details.category}</Badge><p className="whitespace-pre-wrap text-sm leading-relaxed">{details.description}</p><dl className="grid gap-4 text-sm"><div><dt className="text-muted-foreground">Date</dt><dd>{new Date(details.date).toLocaleDateString("en-GB", {
                  timeZone: "UTC"
                })}</dd></div><div><dt className="text-muted-foreground">Location</dt><dd>{details.location}</dd></div><div><dt className="text-muted-foreground">Organizer</dt><dd>{details.organizer?.name || "Unavailable"}</dd></div></dl>{canManage(details) && <Button onClick={() => {
            handleEdit(details);
            setDetails(null);
          }}>Edit {listingLabel}</Button>}</div>}</SheetContent></Sheet>
    </div>;
}
