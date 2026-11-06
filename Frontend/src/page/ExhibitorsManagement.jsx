import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeading } from "@/components/workspace";
import { RecordBrowser } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useState } from "react";
import API from "@/api/api";
import ExhibitorProfileForm from "@/components/ExhibitorProfileForm";
import ExhibitorFiles from "@/components/ExhibitorFiles";
import ExhibitorStaff from "@/components/ExhibitorStaff";
import ExhibitorServices from "@/components/ExhibitorServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
async function fetchApplicationData(isExhibitor, signal) {
  const [applicationResponse, eventResponse] = await Promise.all([API.get("/exhibitors/all", {
    signal
  }), isExhibitor ? API.get("/events/all", {
    signal
  }) : Promise.resolve(null)]);
  return {
    exhibitors: applicationResponse.data.exhibitors,
    events: eventResponse?.data?.events || []
  };
}
export default function ExhibitorsManagement() {
  const [formOpen, setFormOpen] = useState(false);
  const [exhibitors, setExhibitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [eventId, setEventId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const isExhibitor = role === "exhibitor";
  const isOrganizer = role === "organizer" || role === "admin";
  const canView = isExhibitor || isOrganizer;
  useEffect(() => {
    if (!canView) return;
    const controller = new AbortController();
    async function loadInitialData() {
      try {
        const data = await fetchApplicationData(isExhibitor, controller.signal);
        if (controller.signal.aborted) return;
        setExhibitors(data.exhibitors);
        setEvents(data.events);
        setLoadError("");
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Unable to load data. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadInitialData();
    return () => controller.abort();
  }, [canView, isExhibitor]);
  async function refreshData() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchApplicationData(isExhibitor);
      setExhibitors(data.exhibitors);
      setEvents(data.events);
    } catch {
      setLoadError("Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || editingId) return;
    if (!companyName.trim() || !category.trim() || !description.trim() || !eventId) {
      toast.error("Please fill all fields.");
      return;
    }
    setSaving(true);
    try {
      await API.post("/exhibitors/register", {
        companyName: companyName.trim(),
        category: category.trim(),
        description: description.trim(),
        event: eventId
      });
      toast.success("Application submitted successfully.");
      setCompanyName("");
      setCategory("");
      setDescription("");
      setEventId("");
      setFormOpen(false);
      await refreshData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to submit application.");
    } finally {
      setSaving(false);
    }
  }
  async function handleStatus(id, status) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const response = await API.put(`/exhibitors/status/${id}`, {
        status
      });
      setExhibitors(previous => previous.map(item => item._id === id ? {
        ...item,
        status: response.data.updated.status
      } : item));
      toast.success(response.data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to update application.");
    } finally {
      setUpdatingId("");
    }
  }
  async function handleProfileSaved() {
    setEditingId("");
    await refreshData();
  }
  if (!canView) {
    return <p className="p-6">
        Open Search Exhibitors to browse participating companies.
        Exhibitor applications require an exhibitor account.
      </p>;
  }
  return <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end [&_.workspace-heading]:flex-1">
        <PageHeading title={isExhibitor ? "My applications" : "Exhibitor applications"} description="Review companies, manage applications, and coordinate exhibitor services." />

        <Button variant="outline" onClick={refreshData} disabled={loading || saving || Boolean(editingId) || Boolean(updatingId)}>
          Refresh
        </Button>
      </div>

      {isExhibitor && <FormPanel open={formOpen} onOpenChange={value => {
      if (!saving) setFormOpen(value);
    }} title="Apply for an Event" trigger="New application"><Card>
          <CardHeader>
            <CardTitle>Apply for an Event</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={saving || loading || Boolean(loadError) || Boolean(editingId)} className="workspace-field-grid">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={companyName} onChange={event => setCompanyName(event.target.value)} maxLength={150} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-category">Category</Label>
                  <Input id="company-category" value={category} onChange={event => setCategory(event.target.value)} maxLength={100} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-description">
                    Company Description
                  </Label>
                  <Textarea id="company-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={2000} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application-event">Event</Label>
                  <WorkspaceSelect id="application-event" value={eventId} onChange={event => setEventId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="">Select an event</option>
                    {events.map(event => <option key={event._id} value={event._id}>
                        {event.title}
                      </option>)}
                  </WorkspaceSelect>
                </div>

                <Button type="submit" disabled={events.length === 0}>
                  {saving ? "Submitting..." : "Submit Application"}
                </Button>

                {!loading && events.length === 0 && <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                    No events are available yet.
                  </p>}
              </fieldset>
            </form>
          </CardContent>
        </Card></FormPanel>}

      {loading ? <p role="status">Loading applications...</p> : loadError ? <p role="alert">{loadError}</p> : exhibitors.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">No applications found.</p> : <RecordBrowser records={exhibitors} label="exhibitors" statusKey="status">{visible => <div className="space-y-4">
          {visible.map(item => <Card key={item._id}>
              <CardContent className="space-y-5 p-6">
                <h2 className="break-words text-lg font-semibold">
                  {item.companyName}
                </h2>

                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {item.description}
                </p>

                {item.products && <p className="whitespace-pre-wrap break-words text-sm">
                    Products / Services: {item.products}
                  </p>}

                <div className="grid gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                  <p>Event: {item.event?.title || "Unavailable"}</p>
                  <p>Category: {item.category || "Not provided"}</p>
                  <p><Badge variant={item.status === "Approved" ? "default" : "secondary"}>{item.status}</Badge></p>
                  <p>Booth: {item.boothNumber || "Not assigned"}</p>

                  {item.contactEmail && <p className="break-all">
                      Public Email: {item.contactEmail}
                    </p>}

                  {item.phone && <p>Public Phone: {item.phone}</p>}

                  {item.website && <p className="break-all">Website: {item.website}</p>}

                  {isOrganizer && <>
                      <p>Applicant: {item.contactPerson?.name}</p>
                      <p className="break-all">
                        Account Email: {item.contactPerson?.email}
                      </p>
                    </>}
                </div>

                <Tabs defaultValue="files"><TabsList className="w-full justify-start"><TabsTrigger value="files">Company files</TabsTrigger><TabsTrigger value="staff">Staff</TabsTrigger><TabsTrigger value="services">Services</TabsTrigger></TabsList><TabsContent value="files" className="pt-3"><ExhibitorFiles exhibitorId={item._id} canUpload={isExhibitor} /></TabsContent><TabsContent value="staff" className="pt-3"><ExhibitorStaff exhibitorId={item._id} canEdit={isExhibitor && item.status === "Approved"} /></TabsContent><TabsContent value="services" className="pt-3"><ExhibitorServices profile={item} /></TabsContent></Tabs>
                {isExhibitor && editingId !== item._id && <Button variant="outline" onClick={() => setEditingId(item._id)} disabled={saving || Boolean(editingId)}>
                    Edit Profile
                  </Button>}

                {isExhibitor && editingId === item._id && <Dialog open onOpenChange={open => {
              if (!open) setEditingId("");
            }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit exhibitor profile</DialogTitle><DialogDescription>Update your company details and public contact information.</DialogDescription></DialogHeader><ExhibitorProfileForm key={`${item._id}-${item.updatedAt}`} profile={item} onSaved={handleProfileSaved} onCancel={() => setEditingId("")} /></DialogContent></Dialog>}

                {isOrganizer && item.status === "Pending" && <div className="flex gap-3">
                    <Button onClick={() => handleStatus(item._id, "Approved")} disabled={Boolean(updatingId)}>
                      {updatingId === item._id ? "Updating..." : "Approve"}
                    </Button>

                    <Button variant="destructive" onClick={() => handleStatus(item._id, "Rejected")} disabled={Boolean(updatingId)}>
                      Reject
                    </Button>
                  </div>}
              </CardContent>
            </Card>)}
        </div>}</RecordBrowser>}
    </div>;
}
