import BoothSelection from "@/page/BoothSelection";
import CoverImageField from "@/components/CoverImageField";
import ExhibitorApplicationForm from "@/components/ExhibitorApplicationForm";
import { useRef } from "react";
import EllipsisLoader from "@/components/EllipsisLoader";

import { useConfirmation } from "@/hooks/useConfirmation";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading, FormPanel, RecordBrowser } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import { isExpo } from "@/hooks/useExpos";
import { getEventImage } from "@/components/landing/eventImages";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
  Clock,
  MapPin,
  UserRound,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import useLiveRefresh from "@/hooks/useLiveRefresh";
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
    const scale = Math.min(
      1,
      1600 / image.naturalWidth,
      1200 / image.naturalHeight,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const cover = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88),
    );
    if (!cover || cover.size >= 3 * 1024 * 1024)
      throw new Error("Cover encoding failed");
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
  const [existingImage, setExistingImage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const isOrganizer = role === "organizer" || role === "admin";
  const isExhibitor = role === "exhibitor";
  const busy = saving || Boolean(deletingId);
  const canRegister = isExhibitor && listingType === "expo";
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState("");
  const [applicationsReady, setApplicationsReady] = useState(false);
  const [applicationRefresh, setApplicationRefresh] = useState(0);
  const [activeExpo, setActiveExpo] = useState(null);
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const registrationHeading = useRef(null);
  const registrationTrigger = useRef(null);
  const applicationFor = (id) =>
    applications.find((item) => (item.event?._id || item.event) === id);
  const activeApplication = activeExpo ? applicationFor(activeExpo._id) : null;
  const refreshApplications = () => setApplicationRefresh((value) => value + 1);

  useEffect(() => {
    if (!canRegister) return;
    const controller = new AbortController();
    API.get("/exhibitors/all", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setApplications(data.exhibitors);
        setApplicationsReady(true);
        setApplicationsError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setApplicationsError(
            error.response?.data?.msg || "Unable to check booth applications.",
          );
      });
    return () => controller.abort();
  }, [canRegister, applicationRefresh]);

  useEffect(() => {
    if (activeExpo) registrationHeading.current?.focus();
  }, [activeExpo]);

  const listings = events.filter(
    (item) => isExpo(item) === (listingType === "expo"),
  );
  async function fetchEvents(background = false) {
    if (!background) setLoading(true);
    setLoadError("");
    try {
      const response = await API.get("/events/all");
      setEvents(response.data.events);
    } catch {
      if (!background) setLoadError("Failed to load events. Please try again.");
    } finally {
      if (!background) setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function loadInitialEvents() {
      try {
        const response = await API.get("/events/all", {
          signal: controller.signal,
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
    if (!busy && !loading && !loadError) void fetchEvents(true);
    if (canRegister && !registrationBusy) refreshApplications();
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
    setExistingImage("");
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
    setExistingImage(event.hasImage ? getEventImage(event) : "");
    setFormOpen(true);
  }
  async function handleSaveEvent(event) {
    event.preventDefault();
    if (busy || !isOrganizer) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      category: category.trim(),
      listingType: editingId ? selectedType : listingType,
    };
    if (Object.values(data).some((value) => !value)) {
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
          setSaveError(
            "Could not prepare this cover image. Choose a valid JPEG, PNG, WebP, or AVIF image.",
          );
          return;
        }
        Object.entries(eventData).forEach(([key, value]) =>
          payload.append(key, value),
        );
        payload.append(
          "image",
          cover,
          cover === imageFile ? imageFile.name : "cover.webp",
        );
      }
      const options = imageFile
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
      if (editingId) {
        await API.put(`/events/update/${editingId}`, payload, options);
        toast.success(`${listingName} updated successfully.`);
      } else {
        await API.post("/events/create", payload, options);
        toast.success(`${listingName} created successfully.`);
      }
      clearForm();
      setFormOpen(false);
      await fetchEvents(true);
    } catch (error) {
      const message =
        error.response?.data?.msg || `Failed to save ${listingLabel}.`;
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
      setEvents((previous) =>
        previous.filter((item) => item._id !== event._id),
      );
      if (editingId === event._id) clearForm();
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete event.");
    } finally {
      setDeletingId("");
    }
  }
  return (
    <div className="w-full space-y-6">
      <PageHeading
        title={collectionName}
        description={
          isExhibitor
            ? `Browse ${collectionName.toLowerCase()}. Only administrators and organizers can create ${collectionName.toLowerCase()}.`
            : `Manage your ${collectionName.toLowerCase()} and their public listings.`
        }
      >
        {isExhibitor && (
          <Button type="button" variant="outline" disabled>
            {listingType === "expo" ? "Create Expo" : "Add Event"}
          </Button>
        )}
        {isOrganizer && (
          <FormPanel
            showCancel={false}
            closeButtonOnly
            title={
              editingId ? `Edit ${listingLabel}` : `Create ${listingLabel}`
            }
            trigger={`Create ${listingName}`}
            open={formOpen}
            onOpenChange={(value) => {
              if (!saving) {
                setFormOpen(value);
                if (!value) {
                  clearForm();
                  setSaveError("");
                }
              }
            }}
          >
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
                      <Input
                        id="event-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={5000}
                        rows={4}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Start time (optional)</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-end-time">
                        End time (optional)
                      </Label>
                      <Input
                        id="event-end-time"
                        type="time"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-category">Category</Label>
                      <Input
                        id="event-category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        maxLength={100}
                        required
                      />
                    </div>

                    {editingId && (
                      <div className="space-y-2">
                        <Label htmlFor="event-listing-type">
                          Public listing type
                        </Label>
                        <WorkspaceSelect
                          id="event-listing-type"
                          value={selectedType}
                          onChange={(event) =>
                            setSelectedType(event.target.value)
                          }
                          required
                        >
                          <option value="event">Event</option>
                          <option value="expo">Expo</option>
                        </WorkspaceSelect>
                      </div>
                    )}

                    <CoverImageField
                      existingImage={existingImage}
                      file={imageFile}
                      onChange={setImageFile}
                    />

                    {saveError && (
                      <p
                        role="alert"
                        className="col-span-full text-sm text-destructive"
                      >
                        {saveError}
                      </p>
                    )}
                    <div className="workspace-form-actions [.workspace-form-body_fieldset_>_&]:col-span-full flex flex-wrap justify-end gap-2 [border-top:1px_solid_var(--border)] pt-3">
                      <Button type="submit">
                        {saving
                          ? "Saving…"
                          : editingId
                            ? "Save Changes"
                            : `Create ${listingName}`}
                      </Button>
                    </div>
                  </fieldset>
                </form>
              </CardContent>
            </Card>
          </FormPanel>
        )}
      </PageHeading>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {collectionName} collection
            </h2>
            <p className="text-sm text-muted-foreground">
              {listings.length} {collectionName.toLowerCase()} in your workspace
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expo-date-filter">Filter by date</Label>
            <Input
              id="expo-date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {canRegister && applicationsError && (
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm text-destructive">
              {applicationsError}
            </p>
            <Button variant="outline" size="sm" onClick={refreshApplications}>
              Retry application status
            </Button>
          </div>
        )}
        {activeExpo && (
          <Card
            id="expo-registration"
            className="scroll-mt-20 border border-border"
          >
            <CardHeader className="flex flex-wrap items-start justify-between gap-3 sm:flex-row">
              <div>
                <CardTitle>
                  <h2 ref={registrationHeading} tabIndex={-1}>
                    Booth registration
                  </h2>
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeExpo.title}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={registrationBusy}
                onClick={() => {
                  setActiveExpo(null);
                  registrationTrigger.current?.focus();
                }}
              >
                Close registration
              </Button>
            </CardHeader>
            <CardContent>
              {!activeApplication ? (
                <ExhibitorApplicationForm
                  key={activeExpo._id}
                  expo={activeExpo}
                  disabled={Boolean(applicationsError)}
                  onBusyChange={setRegistrationBusy}
                  onConflict={refreshApplications}
                  onSaved={(application) => {
                    setApplications((previous) => [...previous, application]);
                    refreshApplications();
                  }}
                />
              ) : activeApplication.status === "Approved" ? (
                <BoothSelection
                  key={activeExpo._id}
                  expo={activeExpo}
                  onBusyChange={setRegistrationBusy}
                  onReservationChanged={refreshApplications}
                />
              ) : (
                <p role="status" className="text-sm">
                  Application status{" "}
                  <Badge variant="secondary">{activeApplication.status}</Badge>{" "}
                  {activeApplication.status === "Pending" &&
                    "You can reserve a booth after the organizer approves your application."}
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {loading ? (
          <EllipsisLoader scope="page" label="Loading events" />
        ) : loadError ? (
          <div className="space-y-3">
            <p role="alert">{loadError}</p>
            <Button variant="outline" onClick={() => fetchEvents()}>
              Try Again
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground [.workspace-form-body_fieldset_>_p&]:py-[14px]">
            No {collectionName.toLowerCase()} found.
          </p>
        ) : (
          <RecordBrowser
            records={listings.filter(
              (item) => !dateFilter || item.date?.slice(0, 10) === dateFilter,
            )}
            label={collectionName.toLowerCase()}
            searchText={(item) =>
              [
                item.title,
                item.location,
                item.category,
                item.organizer?.name,
              ].join(" ")
            }
          >
            {(visible) => (
              <div className="overflow-hidden rounded-xl border bg-card [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Image</TableHead>
                      <TableHead>{listingName}</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((event, index) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          <img
                            src={getEventImage(event, index)}
                            alt=""
                            loading="lazy"
                            width={80}
                            height={52}
                            className="h-[52px] w-20 max-w-none rounded-md border object-cover"
                          />
                        </TableCell>
                        <TableCell className="max-w-80 whitespace-normal">
                          <Button
                            variant="link"
                            className="h-auto max-w-full justify-start whitespace-normal p-0 text-left font-semibold"
                            onClick={() => setDetails(event)}
                          >
                            {event.title}
                          </Button>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                            {event.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{event.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            timeZone: "UTC",
                          })}
                        </TableCell>
                        <TableCell className="max-w-60 whitespace-normal">
                          {event.location}
                        </TableCell>
                        <TableCell>
                          {event.organizer?.name || "Unavailable"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canRegister && (
                              <Button
                                variant="outline"
                                size="sm"
                                aria-expanded={activeExpo?._id === event._id}
                                aria-controls={
                                  activeExpo?._id === event._id
                                    ? "expo-registration"
                                    : undefined
                                }
                                disabled={
                                  !applicationsReady ||
                                  Boolean(applicationsError) ||
                                  registrationBusy
                                }
                                onClick={(click) => {
                                  registrationTrigger.current =
                                    click.currentTarget;
                                  setActiveExpo(event);
                                  if (activeExpo === event)
                                    registrationHeading.current?.focus();
                                }}
                              >
                                {applicationFor(event._id)?.boothNumber
                                  ? `Booth ${applicationFor(event._id).boothNumber}`
                                  : applicationFor(event._id)?.status ===
                                      "Approved"
                                    ? "Select Booth"
                                    : applicationFor(event._id)?.status ||
                                      "Register Booth"}
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Actions for ${event.title}`}
                                  disabled={busy}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => setDetails(event)}
                                >
                                  <Eye className="size-4" />
                                  View details
                                </DropdownMenuItem>
                                {canManage(event) && (
                                  <>
                                    <DropdownMenuItem
                                      onSelect={() => handleEdit(event)}
                                    >
                                      <Pencil className="size-4" />
                                      Edit {listingLabel}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={() => handleDelete(event)}
                                    >
                                      <Trash2 className="size-4" />
                                      {deletingId === event._id
                                        ? "Deleting…"
                                        : `Delete ${listingLabel}`}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </RecordBrowser>
        )}
      </div>
      <Dialog
        open={Boolean(details)}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="min-w-0 pr-8 text-left">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="outline">{listingName}</Badge>
              {details?.category && (
                <Badge variant="secondary">{details.category}</Badge>
              )}
            </div>
            <DialogTitle className="break-words font-serif text-2xl leading-tight sm:text-3xl">
              {details?.title}
            </DialogTitle>
            <DialogDescription>
              Schedule, venue and organizer information.
            </DialogDescription>
          </DialogHeader>
          {details && (
            <div className="min-w-0 space-y-5">
              <img
                src={getEventImage(details)}
                alt=""
                className="h-40 w-full rounded-xl border object-cover sm:h-52 [.workspace-form-body_fieldset_>_p&]:py-[14px]"
              />
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Date",
                    icon: CalendarDays,
                    value: details.date
                      ? new Date(details.date).toLocaleDateString("en-GB", {
                          timeZone: "UTC",
                          dateStyle: "long",
                        })
                      : "To be announced",
                  },
                  {
                    label: "Time",
                    icon: Clock,
                    value:
                      [details.time, details.endTime]
                        .filter(Boolean)
                        .join(" – ") || "To be announced",
                  },
                  {
                    label: "Location",
                    icon: MapPin,
                    value: details.location || "To be announced",
                  },
                  {
                    label: "Organizer",
                    icon: UserRound,
                    value: details.organizer?.name || "Unavailable",
                  },
                ].map(({ label, icon: Icon, value }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border bg-muted/30 p-4 [.workspace-form-body_fieldset_>_p&]:py-[14px]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium [overflow-wrap:anywhere]">
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
              <section className="rounded-xl border p-4 sm:p-5 [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                <h3 className="mb-2 font-serif text-lg">
                  About this {listingLabel}
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">
                  {details.description || "No description provided."}
                </p>
              </section>
            </div>
          )}
          <DialogFooter className="gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDetails(null)}>
              Close
            </Button>
            {details && canManage(details) && (
              <Button
                onClick={() => {
                  handleEdit(details);
                  setDetails(null);
                }}
              >
                <Pencil className="size-4" />
                Edit {listingLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
