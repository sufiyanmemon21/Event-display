import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import ExhibitorApplicationForm from "@/components/ExhibitorApplicationForm";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeading } from "@/components/workspace";
import { RecordBrowser } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import { useEffect, useState } from "react";
import API from "@/api/api";
import ExhibitorProfileForm from "@/components/ExhibitorProfileForm";
import ExhibitorServices from "@/components/ExhibitorServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
async function fetchApplicationData(isExhibitor, signal) {
  const [applicationResponse, eventResponse] = await Promise.all([
    API.get("/exhibitors/all", {
      signal,
    }),
    isExhibitor
      ? API.get("/events/all", {
          signal,
        })
      : Promise.resolve(null),
  ]);
  return {
    exhibitors: applicationResponse.data.exhibitors,
    events: eventResponse?.data?.events || [],
  };
}
export default function ExhibitorsManagement() {
  const [formOpen, setFormOpen] = useState(false);
  const [exhibitors, setExhibitors] = useState([]);
  const [events, setEvents] = useState([]);
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
  async function handleStatus(id, status) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const response = await API.put(`/exhibitors/status/${id}`, {
        status,
      });
      setExhibitors((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                status: response.data.updated.status,
              }
            : item,
        ),
      );
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
    return (
      <p className="p-6">
        Open Search Exhibitors to browse participating companies. Exhibitor
        applications require an exhibitor account.
      </p>
    );
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end [&_.workspace-heading]:flex-1">
        <PageHeading
          title={isExhibitor ? "My applications" : "Exhibitor applications"}
          description="Review companies, manage applications, and coordinate exhibitor services."
        />

        <Button
          variant="outline"
          onClick={refreshData}
          disabled={
            loading || saving || Boolean(editingId) || Boolean(updatingId)
          }
        >
          Refresh
        </Button>
      </div>

      {isExhibitor && (
        <FormPanel
          open={formOpen}
          onOpenChange={(value) => {
            if (!saving) setFormOpen(value);
          }}
          title="Apply for an Event"
          trigger="New application"
        >
          <Card>
            <CardHeader>
              <CardTitle>Apply for an Event</CardTitle>
            </CardHeader>

            <CardContent>
              {formOpen && (
                <ExhibitorApplicationForm
                  events={events}
                  disabled={loading || Boolean(loadError) || Boolean(editingId)}
                  onBusyChange={setSaving}
                  onSaved={async () => {
                    setFormOpen(false);
                    await refreshData();
                  }}
                />
              )}
            </CardContent>
          </Card>
        </FormPanel>
      )}

      {loading ? (
        <CardGridSkeleton label="Loading applications" className="lg:grid-cols-2" />
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : exhibitors.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground [.workspace-form-body_fieldset_>_p&]:py-[14px]">
          No applications found.
        </p>
      ) : (
        <RecordBrowser
          records={exhibitors}
          label="exhibitors"
          statusKey="status"
        >
          {(visible) => (
            <div className="space-y-4">
              {visible.map((item) => (
                <Card key={item._id}>
                  <CardContent className="space-y-5 p-6">
                    <h2 className="break-words text-lg font-semibold">
                      {item.companyName}
                    </h2>

                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    {item.products && (
                      <p className="whitespace-pre-wrap break-words text-sm">
                        Products / Services: {item.products}
                      </p>
                    )}

                    <div className="grid gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2 [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                      <p>Event: {item.event?.title || "Unavailable"}</p>
                      <p>Category: {item.category || "Not provided"}</p>
                      <p>
                        <Badge
                          variant={
                            item.status === "Approved" ? "default" : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </p>
                      <p>Booth: {item.boothNumber || "Not assigned"}</p>

                      {item.contactEmail && (
                        <p className="break-all">
                          Public Email: {item.contactEmail}
                        </p>
                      )}

                      {item.phone && <p>Public Phone: {item.phone}</p>}

                      {item.website && (
                        <p className="break-all">Website: {item.website}</p>
                      )}

                      {isOrganizer && (
                        <>
                          <p>Applicant: {item.contactPerson?.name}</p>
                          <p className="break-all">
                            Account Email: {item.contactPerson?.email}
                          </p>
                        </>
                      )}
                    </div>

                    <ExhibitorServices profile={item} />
                    {isExhibitor && editingId !== item._id && (
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(item._id)}
                        disabled={saving || Boolean(editingId)}
                      >
                        Edit Profile
                      </Button>
                    )}

                    {isExhibitor && editingId === item._id && (
                      <Dialog
                        open
                        onOpenChange={(open) => {
                          if (!open) setEditingId("");
                        }}
                      >
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit exhibitor profile</DialogTitle>
                            <DialogDescription>
                              Update your company details and public contact
                              information.
                            </DialogDescription>
                          </DialogHeader>
                          <ExhibitorProfileForm
                            key={`${item._id}-${item.updatedAt}`}
                            profile={item}
                            onSaved={handleProfileSaved}
                            onCancel={() => setEditingId("")}
                          />
                        </DialogContent>
                      </Dialog>
                    )}

                    {isOrganizer && item.status === "Pending" && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleStatus(item._id, "Approved")}
                          disabled={Boolean(updatingId)}
                        >
                          {updatingId === item._id ? "Updating..." : "Approve"}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleStatus(item._id, "Rejected")}
                          disabled={Boolean(updatingId)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </RecordBrowser>
      )}
    </div>
  );
}
