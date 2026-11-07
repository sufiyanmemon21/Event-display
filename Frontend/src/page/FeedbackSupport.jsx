import EllipseLoader from "@/components/EllipseLoader";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/workspace";
import { RecordBrowser } from "@/components/workspace";
import { FormPanel } from "@/components/workspace";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
function FeedbackReply({
  feedback,
  onUpdated
}) {
  const [status, setStatus] = useState(feedback.status || "Open");
  const [reply, setReply] = useState(feedback.reply || "");
  const [saving, setSaving] = useState(false);
  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const response = await API.put(`/feedback/update/${feedback._id}`, {
        status,
        reply
      });
      toast.success(response.data.msg);
      await onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to save reply.");
    } finally {
      setSaving(false);
    }
  }
  return <form onSubmit={handleSave} className="rounded-xl border bg-muted/30 p-4">
      <fieldset disabled={saving} className="grid items-end gap-4 lg:grid-cols-[180px_1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor={`status-${feedback._id}`}>Status</Label>
          <WorkspaceSelect id={`status-${feedback._id}`} value={status} onChange={event => setStatus(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </WorkspaceSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`reply-${feedback._id}`}>Reply</Label>
          <Textarea id={`reply-${feedback._id}`} value={reply} onChange={event => setReply(event.target.value)} maxLength={2000} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <Button type="submit">
          {saving ? "Saving..." : "Save Update"}
        </Button>
      </fieldset>
    </form>;
}
export default function FeedbackSupport() {
  const [formOpen, setFormOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  async function loadData() {
    setLoading(true);
    setLoadError("");
    try {
      const [feedbackResponse, eventResponse] = await Promise.all([API.get("/feedback/all"), API.get("/events/all")]);
      setFeedbacks(feedbackResponse.data.feedbacks);
      setEvents(eventResponse.data.events);
    } catch {
      setLoadError("Unable to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function loadInitialData() {
      try {
        const [feedbackResponse, eventResponse] = await Promise.all([API.get("/feedback/all", {
          signal: controller.signal
        }), API.get("/events/all", {
          signal: controller.signal
        })]);
        if (controller.signal.aborted) return;
        setFeedbacks(feedbackResponse.data.feedbacks);
        setEvents(eventResponse.data.events);
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Unable to load feedback. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadInitialData();
    return () => controller.abort();
  }, []);
  function canManage(feedback) {
    return role === "admin" || role === "organizer" && feedback.event?.organizer === userId;
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    if (message.trim().length < 5) {
      toast.error("Enter a message with at least 5 characters.");
      return;
    }
    setSaving(true);
    try {
      const response = await API.post("/feedback/submit", {
        event: eventId,
        type,
        message: message.trim()
      });
      toast.success(response.data.msg);
      setMessage("");
      setEventId("");
      setFormOpen(false);
      setType("suggestion");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Unable to submit feedback.");
    } finally {
      setSaving(false);
    }
  }
  return <div className="w-full space-y-6">
      <PageHeading title="Feedback & support" description="Keep suggestions and support requests moving forward." />

      <FormPanel open={formOpen} onOpenChange={value => {
      if (!saving) setFormOpen(value);
    }} title="Submit Feedback" trigger="New feedback"><Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={saving || loading || Boolean(loadError)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-event">Event</Label>
                <WorkspaceSelect id="feedback-event" value={eventId} onChange={event => setEventId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">General Feedback</option>

                  {events.map(event => <option key={event._id} value={event._id}>
                      {event.title}
                    </option>)}
                </WorkspaceSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-type">Type</Label>
                <WorkspaceSelect id="feedback-type" value={type} onChange={event => setType(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="suggestion">Suggestion</option>
                  <option value="issue">Report an Issue</option>
                  <option value="review">Public review</option>
                </WorkspaceSelect>
                {type === "review" && <p className="text-sm text-muted-foreground">Your first name and review will appear on the public landing page.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-message">Message</Label>
                <Textarea id="feedback-message" value={message} onChange={event => setMessage(event.target.value)} minLength={5} maxLength={3000} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>

              <Button type="submit">
                {saving ? "Submitting..." : "Submit Feedback"}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card></FormPanel>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Feedback Requests</h2>
        <Button variant="outline" onClick={loadData} disabled={loading || saving}>
          Refresh
        </Button>
      </div>

      {loading ? <EllipseLoader label="Loading feedback" /> : loadError ? <p role="alert">{loadError}</p> : feedbacks.length === 0 ? <p className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No feedback requests found.
        </p> : <RecordBrowser records={feedbacks} label="feedbacks" statusKey="status">{visible => <div className="space-y-4">
          {visible.map(feedback => <Card key={feedback._id}>
              <CardContent className="space-y-5 p-6">
                <div className="grid gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                  <p className="font-semibold">
                    {feedback.event?.title || "General Feedback"}
                  </p>
                  <p><Badge variant="outline" className="capitalize">{feedback.type}</Badge></p>
                  <p><Badge variant={feedback.status === "Resolved" ? "default" : "secondary"}>{feedback.status || "Open"}</Badge></p>

                  {canManage(feedback) && <>
                      <p>From: {feedback.name}</p>
                      <p className="break-all">
                        Email: {feedback.email}
                      </p>
                    </>}

                  <p className="text-xs text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm">
                  {feedback.subject && <strong className="mb-1 block">{feedback.subject}</strong>}
                  {feedback.rating && <span className="mb-1 block">{feedback.rating} out of 5 stars</span>}
                  {feedback.message}
                </p>

                {feedback.reply && <div className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-semibold">Support Reply</p>
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {feedback.reply}
                    </p>
                  </div>}

                {canManage(feedback) && <FeedbackReply key={`${feedback._id}-${feedback.updatedAt}`} feedback={feedback} onUpdated={loadData} />}
              </CardContent>
            </Card>)}
        </div>}</RecordBrowser>}
    </div>;
}
