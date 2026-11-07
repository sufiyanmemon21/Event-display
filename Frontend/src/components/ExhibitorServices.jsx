import EllipsisLoader from "@/components/EllipsisLoader";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
const services = ["Electricity", "Internet", "Furniture", "Cleaning", "Other"];
function ServiceRequest({
  request,
  canManage,
  busy,
  onUpdate
}) {
  const [reply, setReply] = useState(request.reply || "");
  const actionable = ["Pending", "Approved"].includes(request.status);
  return <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium">{request.service}</h4>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {request.status}
        </span>
      </div>

      <p className="whitespace-pre-wrap break-words text-sm">
        {request.details}
      </p>

      <p className="text-xs text-muted-foreground">
        Submitted: {new Date(request.createdAt).toLocaleString()}
      </p>

      {request.reply && <div className="space-y-1 rounded-md bg-muted p-3">
          <p className="text-xs font-medium">Organizer Reply</p>
          <p className="whitespace-pre-wrap break-words text-sm">
            {request.reply}
          </p>
        </div>}

      {canManage && actionable && <fieldset disabled={busy} className="space-y-3">
          <Label htmlFor={`service-reply-${request._id}`}>
            Reply or Update Note
          </Label>

          <Textarea id={`service-reply-${request._id}`} value={reply} onChange={event => setReply(event.target.value)} maxLength={1000} rows={3} placeholder="Add an optional note..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />

          <div className="flex flex-wrap gap-3">
            {request.status === "Pending" ? <>
                <Button onClick={() => onUpdate(request._id, "Approved", reply)}>
                  Approve
                </Button>

                <Button variant="destructive" onClick={() => onUpdate(request._id, "Rejected", reply)}>
                  Reject
                </Button>
              </> : <Button onClick={() => onUpdate(request._id, "Fulfilled", reply)}>
                Mark Fulfilled
              </Button>}
          </div>
        </fieldset>}
    </div>;
}
export default function ExhibitorServices({
  profile
}) {
  const confirm = useConfirmation();
  const [requests, setRequests] = useState([]);
  const [service, setService] = useState("Internet");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const role = localStorage.getItem("userRole");
  const isExhibitor = role === "exhibitor";
  const canManage = role === "organizer" || role === "admin";
  const canRequest = isExhibitor && profile.status === "Approved" && Boolean(profile.boothNumber);
  useEffect(() => {
    const controller = new AbortController();
    async function loadRequests() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get(`/exhibitors/services/${profile._id}`, {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setRequests(response.data.requests);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load service requests.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadRequests();
    return () => controller.abort();
  }, [profile._id, refresh]);
  async function handleSubmit(event) {
    event.preventDefault();
    if (!canRequest || busy || loading || error || !details.trim()) {
      return;
    }
    setBusy(true);
    try {
      const response = await API.post(`/exhibitors/services/${profile._id}`, {
        service,
        details: details.trim()
      });
      setRequests(previous => [response.data.request, ...previous].slice(0, 50));
      setDetails("");
      toast.success(response.data.msg);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to submit service request.");
    } finally {
      setBusy(false);
    }
  }
  async function handleUpdate(requestId, status, reply) {
    if (!canManage || busy || loading) return;
    if (!(await confirm(`Set this request to ${status}?`))) return;
    setBusy(true);
    try {
      const response = await API.put(`/exhibitors/service-requests/${requestId}/status`, {
        status,
        reply: reply.trim()
      });
      setRequests(previous => previous.map(item => item._id === requestId ? response.data.request : item));
      toast.success(response.data.msg);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to update service request.");
      if (err.response?.status === 409) {
        setRefresh(previous => previous + 1);
      }
    } finally {
      setBusy(false);
    }
  }
  return <div className="space-y-4 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-medium">Additional Services</h3>

        <Button variant="outline" disabled={loading || busy} onClick={() => setRefresh(previous => previous + 1)}>
          Refresh Requests
        </Button>
      </div>

      {canRequest ? <form onSubmit={handleSubmit}>
          <fieldset disabled={loading || busy || Boolean(error)} className="space-y-3">
            <Label htmlFor={`service-type-${profile._id}`}>
              Service
            </Label>

            <WorkspaceSelect id={`service-type-${profile._id}`} value={service} onChange={event => setService(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {services.map(item => <option key={item} value={item}>
                  {item}
                </option>)}
            </WorkspaceSelect>

            <Label htmlFor={`service-details-${profile._id}`}>
              Request Details
            </Label>

            <Textarea id={`service-details-${profile._id}`} value={details} onChange={event => setDetails(event.target.value)} rows={3} maxLength={1000} placeholder="Describe what you need for your booth..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />

            <Button type="submit" disabled={!details.trim()}>
              {busy ? "Please wait..." : "Submit Request"}
            </Button>
          </fieldset>
        </form> : isExhibitor ? <p className="text-sm text-muted-foreground">
          An approved application and assigned booth are required
          to submit service requests.
        </p> : null}

      {loading ? <EllipsisLoader label="Loading requests" /> : error ? <p className="text-sm text-destructive" role="alert">
          {error}
        </p> : requests.length === 0 ? <p className="text-sm text-muted-foreground">
          No service requests yet.
        </p> : <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Latest 50 requests.
          </p>

          {requests.map(request => <ServiceRequest key={`${request._id}-${request.updatedAt}`} request={request} canManage={canManage} busy={busy} onUpdate={handleUpdate} />)}
        </div>}
    </div>;
}
