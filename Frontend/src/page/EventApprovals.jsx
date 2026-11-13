import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { PageHeading, RecordBrowser } from "@/components/workspace";
import useAuth from "@/hooks/useAuth";
import { isExpo } from "@/hooks/useExpos";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function EventApprovals() {
  const user = useAuth();
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const canReview = (item) => item && (!item.approvalStatus || item.approvalStatus === "Pending") && (isExpo(item) ? user?.role === "admin" : user?.role === "exhibitor" && String(item.reviewExhibitor?._id || item.reviewExhibitor) === String(user?._id || user?.id));
  async function review(status) {
    if (saving || !canReview(selected)) return;
    setSaving(true); setReviewError("");
    try {
      await API.patch(`/events/${selected._id}/review`, { status, updatedAt: selected.updatedAt });
      setSelected(null); setRefresh(value => value + 1);
    } catch (error) { setReviewError(error.response?.data?.msg || "Unable to save the review."); }
    finally { setSaving(false); }
  }
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/events/workspace", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setEvents(response.data.events);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load events.");
          setEvents([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh]);
  return (
    <div className="space-y-6">
      <PageHeading
        title="Events & approvals"
        description="Assigned exhibitors review Events. Admins review Expos."
      >
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setRefresh((v) => v + 1)}
        >
          Refresh events
        </Button>
      </PageHeading>
      {loading ? (
        <CardGridSkeleton label="Loading events" className="lg:grid-cols-2" />
      ) : error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <RecordBrowser
          records={events}
          label="events"
          statusOptions={["Pending", "Approved", "Rejected"]}
          statusValue={item => item.approvalStatus || "Legacy listing"}
          searchText={(item) =>
            [
              item.title,
              item.category,
              item.description,
              item.organizer?.name,
            ].join(" ")
          }
        >
          {(visible) => (
            <div className="grid gap-4 lg:grid-cols-2">
              {visible.map((item) => (
                <Card key={item._id}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant="outline">{item.approvalStatus || "Legacy listing"}</Badge>
                    </div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-sm [.workspace-form-body_fieldset_>_p&]:py-[14px]">
                      <div>
                        <dt className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                          Organizer
                        </dt>
                        <dd>{item.organizer?.name || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                          Event date
                        </dt>
                        <dd>
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            timeZone: "UTC",
                          })}
                        </dd>
                      </div>
                    </dl>
                    <Button variant="outline" onClick={() => { setReviewError(""); setSelected(item); }}>
                      Review details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </RecordBrowser>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !saving) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Review all listing details before making your decision.
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {selected?.description}
          </p>
          <p className="text-sm">Location: {selected?.location}</p>
          <p className="text-sm">Reviewer: {selected && isExpo(selected) ? "Admin" : selected?.reviewExhibitor?.name || "Awaiting Admin assignment"}</p>
          {reviewError && <p role="alert" className="text-destructive">{reviewError}</p>}
          {canReview(selected) && <div className="flex flex-wrap gap-3">
            <Button disabled={saving} onClick={() => review("Approved")}>Approve</Button>
            <Button variant="destructive" disabled={saving} onClick={() => review("Rejected")}>Reject</Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
