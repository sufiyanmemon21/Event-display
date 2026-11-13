import { TableSkeleton } from "@/components/LoadingSkeletons";
import { useEffect, useState } from "react";
import { isExpo } from "@/hooks/useExpos";
import API from "@/api/api";
import { PageHeading, RecordBrowser } from "@/components/workspace";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import WorkspaceSelect from "@/components/workspace-select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function ExpoTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [ticketType, setTicketType] = useState("all");
  const [expo, setExpo] = useState("");
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/attendees/all", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted)
          setRegistrations(response.data.attendees.filter(item => item.event && isExpo(item.event)));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.msg || "Unable to load ticket registrations.",
          );
          setRegistrations([]);
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
        title="Expo tickets"
        description="View ticket registrations. Attendees can download QR passes from their profile once confirmed."
      >
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setRefresh((v) => v + 1)}
        >
          Refresh registrations
        </Button>
      </PageHeading>
      <div className="max-w-xs space-y-2">
        <Label htmlFor="ticket-filter">Ticket type</Label>
        <WorkspaceSelect
          id="ticket-filter"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
        >
          <option value="all">All ticket types</option>
          {["Standard", "VIP", "Regular"].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </WorkspaceSelect>
      </div>
      <div className="max-w-md space-y-2"><Label htmlFor="expo-filter">Expo</Label><WorkspaceSelect id="expo-filter" value={expo} onChange={event => setExpo(event.target.value)}><option value="">All Expos</option>{[...new Map(registrations.map(item => [item.event._id, item.event])).values()].map(event => <option key={event._id} value={event._id}>{event.title}</option>)}</WorkspaceSelect></div>
      {loading ? (
        <TableSkeleton label="Loading ticket registrations" columns={7} />
      ) : error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <RecordBrowser
          records={registrations.filter(
            (item) => (!expo || item.event._id === expo) && (ticketType === "all" || item.ticketType === ticketType),
          )}
          label="ticket registrations"
          statusOptions={["Pending", "Confirmed", "Rejected", "Cancelled"]}
          statusValue={item => item.status || "Confirmed"}
          searchText={(item) =>
            [
              item.user?.name,
              item.user?.email,
              item.event?.title,
              item.ticketType,
            ].join(" ")
          }
        >
          {(visible) => (
            <div className="overflow-hidden rounded-xl border bg-card [.workspace-form-body_fieldset_>_p&]:py-[14px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Attendee",
                      "Expo",
                      "Ticket type",
                      "Registered",
                      "Approval",
                      "Attendance",
                      "Details",
                    ].map((label) => (
                      <TableHead key={label}>{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <p className="font-medium">
                          {item.user?.name || "Unavailable"}
                        </p>
                        <p className="text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
                          {item.user?.email}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        {item.event?.title || "Event unavailable"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.ticketType}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-GB")
                          : "Not recorded"}
                      </TableCell>
                      <TableCell><Badge variant="outline">{item.status || "Confirmed"}</Badge></TableCell>
                      <TableCell>{item.checkedInAt ? "Checked in" : "Not checked in"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(item)}
                        >
                          View registration
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </RecordBrowser>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket registration</DialogTitle>
            <DialogDescription>
              Review the booking and its ticket type.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Expo</dt>
              <dd>{selected?.event?.title}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Attendee</dt>
              <dd>{selected?.user?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ticket type</dt>
              <dd>{selected?.ticketType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Registration reference</dt>
              <dd className="break-all">{selected?._id}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            Booking status: {selected?.status || "Confirmed"}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
