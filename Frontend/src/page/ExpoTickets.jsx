import { useEffect, useState } from "react";
import API from "@/api/api";
import { PageHeading, RecordBrowser } from "@/components/workspace";
import { IntegrationNotice, UnavailableAction } from "@/components/integration-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import WorkspaceSelect from "@/components/workspace-select";
import { Table, TableHeader, TableBody, TableHead, TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function ExpoTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [ticketType, setTicketType] = useState("all");
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/attendees/all", {
          signal: controller.signal
        });
        if (!controller.signal.aborted) setRegistrations(response.data.attendees);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load ticket registrations.");
          setRegistrations([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh]);
  return <div className="space-y-6"><PageHeading title="Expo tickets" description="View the ticket types attached to real attendee registrations."><Button variant="outline" disabled={loading} onClick={() => setRefresh(v => v + 1)}>Refresh registrations</Button></PageHeading><IntegrationNotice title="Registration records connected · ticket issuance unavailable">The backend records Standard, VIP, and Regular ticket types. It has no issued-ticket ID, price, payment status, entry pass, QR code, or check-in workflow. These records are not issued admission credentials.</IntegrationNotice><div className="max-w-xs space-y-2"><Label htmlFor="ticket-filter">Ticket type</Label><WorkspaceSelect id="ticket-filter" value={ticketType} onChange={e => setTicketType(e.target.value)}><option value="all">All ticket types</option>{["Standard", "VIP", "Regular"].map(type => <option key={type} value={type}>{type}</option>)}</WorkspaceSelect></div>{loading ? <p role="status">Loading ticket registrations…</p> : error ? <p role="alert" className="text-destructive">{error}</p> : <RecordBrowser records={registrations.filter(item => ticketType === "all" || item.ticketType === ticketType)} label="ticket registrations" searchText={item => [item.user?.name, item.user?.email, item.event?.title, item.ticketType].join(" ")}>{visible => <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{["Attendee", "Expo", "Ticket type", "Registered", "Details"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{visible.map(item => <TableRow key={item._id}><TableCell><p className="font-medium">{item.user?.name || "Unavailable"}</p><p className="text-xs text-muted-foreground">{item.user?.email}</p></TableCell><TableCell className="max-w-64 whitespace-normal">{item.event?.title || "Event unavailable"}</TableCell><TableCell><Badge variant="secondary">{item.ticketType}</Badge></TableCell><TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "Not recorded"}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => setSelected(item)}>View registration</Button></TableCell></TableRow>)}</TableBody></Table></div>}</RecordBrowser>}<Dialog open={Boolean(selected)} onOpenChange={open => {
      if (!open) setSelected(null);
    }}><DialogContent><DialogHeader><DialogTitle>Ticket registration</DialogTitle><DialogDescription>Registration details, not an issued entry pass.</DialogDescription></DialogHeader><dl className="grid gap-4 text-sm"><div><dt className="text-muted-foreground">Expo</dt><dd>{selected?.event?.title}</dd></div><div><dt className="text-muted-foreground">Attendee</dt><dd>{selected?.user?.name}</dd></div><div><dt className="text-muted-foreground">Ticket type</dt><dd>{selected?.ticketType}</dd></div><div><dt className="text-muted-foreground">Registration reference</dt><dd className="break-all">{selected?._id}</dd></div></dl><IntegrationNotice>Issuance, cancellation, payment, and check-in require ticketing APIs.</IntegrationNotice><UnavailableAction>Issue pass unavailable</UnavailableAction></DialogContent></Dialog></div>;
}
