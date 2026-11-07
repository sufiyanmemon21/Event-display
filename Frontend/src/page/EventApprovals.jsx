import EllipsisLoader from "@/components/EllipsisLoader";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { PageHeading, RecordBrowser } from "@/components/workspace";
import { UnavailableAction } from "@/components/integration-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function EventApprovals() {
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
        const response = await API.get("/events/all", {
          signal: controller.signal
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
  return <div className="space-y-6"><PageHeading title="Events & approvals" description="Browse event details. Approval actions are currently unavailable."><Button variant="outline" disabled={loading} onClick={() => setRefresh(v => v + 1)}>Refresh events</Button></PageHeading>{loading ? <EllipsisLoader scope="page" label="Loading events" /> : error ? <p role="alert" className="text-destructive">{error}</p> : <RecordBrowser records={events} label="events" searchText={item => [item.title, item.category, item.description, item.organizer?.name].join(" ")}>{visible => <div className="grid gap-4 lg:grid-cols-2">{visible.map(item => <Card key={item._id}><CardContent className="space-y-4 p-6"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{item.category}</Badge><Badge variant="outline">Approval not recorded</Badge></div><h2 className="text-xl font-semibold">{item.title}</h2><p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p><dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-sm"><div><dt className="text-xs text-muted-foreground">Organizer</dt><dd>{item.organizer?.name || "Unavailable"}</dd></div><div><dt className="text-xs text-muted-foreground">Event date</dt><dd>{new Date(item.date).toLocaleDateString("en-GB", {
                    timeZone: "UTC"
                  })}</dd></div></dl><Button variant="outline" onClick={() => setSelected(item)}>Review details</Button></CardContent></Card>)}</div>}</RecordBrowser>}<Dialog open={Boolean(selected)} onOpenChange={open => {
      if (!open) setSelected(null);
    }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>Existing expo record. Approval actions are not supported.</DialogDescription></DialogHeader><p className="whitespace-pre-wrap text-sm leading-relaxed">{selected?.description}</p><p className="text-sm">Location: {selected?.location}</p><div className="flex flex-wrap gap-3"><UnavailableAction>Approve unavailable</UnavailableAction><Button variant="destructive" disabled>Reject unavailable</Button></div></DialogContent></Dialog></div>;
}
