import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeading } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const metrics = [
  {
    key: "totalEvents",
    label: "Events",
  },
  {
    key: "attendeeRegistrations",
    label: "Attendee Registrations",
  },
  {
    key: "exhibitorApplications",
    label: "Exhibitor Applications",
  },
  {
    key: "approvedApplications",
    label: "Approved Applications",
  },
  {
    key: "pendingApplications",
    label: "Pending Applications",
  },
  {
    key: "rejectedApplications",
    label: "Rejected Applications",
  },
  {
    key: "totalBooths",
    label: "Total Booths",
  },
  {
    key: "reservedBooths",
    label: "Reserved Booths",
  },
  {
    key: "availableBooths",
    label: "Available Booths",
  },
  {
    key: "totalSessions",
    label: "Sessions",
  },
  {
    key: "sessionRegistrations",
    label: "Session Registrations",
  },
  {
    key: "sessionBookmarks",
    label: "Session Bookmarks",
  },
  {
    key: "recordedBoothVisits",
    label: "Recorded Booth Visits",
  },
  {
    key: "uniqueVisitingAttendees",
    label: "Unique Visiting Attendees",
  },
];
const sessionColumns = [
  {
    key: "title",
    label: "Session",
  },
  {
    key: "eventTitle",
    label: "Event",
  },
  {
    key: "registrations",
    label: "Registrations",
  },
  {
    key: "bookmarks",
    label: "Bookmarks",
  },
];
const exhibitorColumns = [
  {
    key: "companyName",
    label: "Company",
  },
  {
    key: "eventTitle",
    label: "Event",
  },
  {
    key: "boothNumber",
    label: "Current Booth",
  },
  {
    key: "visits",
    label: "Recorded Visits",
  },
];
function ReportTable({ rows, columns, emptyText }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {row[column.key] === "" ||
                  row[column.key] === null ||
                  row[column.key] === undefined
                    ? "Not assigned"
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text.trimStart())) {
    text = "'" + text;
  }
  return `"${text.replace(/"/g, '""')}"`;
}
export default function AnalyticsDashboard() {
  const [eventId, setEventId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const role = localStorage.getItem("userRole");
  const allowed = role === "organizer" || role === "admin";
  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const request = { running: false };
    async function loadAnalytics(firstLoad = false) {
      if (request.running || controller.signal.aborted) return;
      request.running = true;
      if (firstLoad) setLoading(true);
      try {
        const response = await API.get("/analytics/summary", {
          params: {
            eventId,
          },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setReport(response.data);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load analytics.");
        }
      } finally {
        request.running = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadAnalytics(true);
    const timer = window.setInterval(() => loadAnalytics(), 30000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [allowed, eventId, refresh]);
  function downloadReport() {
    if (!report || report.selectedEventId !== eventId) return;
    const eventTitle = eventId
      ? report.events.find((event) => event._id === eventId)?.title
      : role === "admin"
        ? "All Events"
        : "All My Events";
    const rows = [
      ["EventSphere Analytics Report"],
      ["Event", eventTitle],
      ["Generated At", report.generatedAt],
      [
        "Visit Counting",
        "Attendee-confirmed; one recorded visit per attendee and exhibitor application",
      ],
      [],
      ["Metric", "Value"],
      ...metrics.map((metric) => [metric.label, report.analytics[metric.key]]),
      ["Booth Reservation Rate", `${report.analytics.boothReservationRate}%`],
      [],
      ["Session", "Event", "Registrations", "Bookmarks"],
      ...report.sessionStats.map((session) => [
        session.title,
        session.eventTitle,
        session.registrations,
        session.bookmarks,
      ]),
      [],
      ["Company", "Event", "Current Booth", "Recorded Visits"],
      ...report.exhibitorStats.map((item) => [
        item.companyName,
        item.eventTitle,
        item.boothNumber || "Not assigned",
        item.visits,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "eventsphere-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (!allowed) {
    return (
      <p className="p-6">
        Analytics are available to organizers and administrators.
      </p>
    );
  }
  const currentReport = report && report.selectedEventId === eventId;
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading
          title="Analytics"
          description="Understand participation, booth performance, and session engagement."
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setRefresh((value) => value + 1)}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            onClick={downloadReport}
            disabled={loading || Boolean(error) || !currentReport}
          >
            Download CSV
          </Button>
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <Label htmlFor="analytics-event">Event</Label>
        <WorkspaceSelect
          id="analytics-event"
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          disabled={loading}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">
            {role === "admin" ? "All Events" : "All My Events"}
          </option>

          {report?.events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </WorkspaceSelect>
      </div>

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <CardGridSkeleton label="Loading analytics" count={6} className="sm:grid-cols-2 lg:grid-cols-3" />
      ) : currentReport ? (
        <>
          <p className="text-sm text-muted-foreground">
            Updated: {new Date(report.generatedAt).toLocaleString("en-GB")}.
            Refreshes every 30 seconds.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Application pipeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current exhibitor application outcomes
              </p>
            </CardHeader>
            <CardContent>
              <div
                className="h-60 w-full"
                role="img"
                aria-label={`Approved: ${report.analytics.approvedApplications}, Pending: ${report.analytics.pendingApplications}, Rejected: ${report.analytics.rejectedApplications}`}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{
                    width: 600,
                    height: 240,
                  }}
                >
                  <BarChart
                    data={[
                      {
                        name: "Approved",
                        count: report.analytics.approvedApplications || 0,
                      },
                      {
                        name: "Pending",
                        count: report.analytics.pendingApplications || 0,
                      },
                      {
                        name: "Rejected",
                        count: report.analytics.rejectedApplications || 0,
                      },
                    ]}
                  >
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="Applications"
                      fill="var(--primary)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={90}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.key}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-semibold">
                    {report.analytics[metric.key]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booth Reservations</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p>
                {report.analytics.reservedBooths} of{" "}
                {report.analytics.totalBooths} booths reserved (
                {report.analytics.boothReservationRate}%)
              </p>

              <progress
                value={report.analytics.reservedBooths}
                max={report.analytics.totalBooths || 1}
                aria-label="Reserved booths"
                className="h-3 w-full accent-primary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recorded Exhibitor Visits</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Visits are confirmed by attendees. Each attendee counts once per
                exhibitor application. Current booth numbers may differ from the
                booth used at the time of a visit.
              </p>

              <ReportTable
                rows={report.exhibitorStats}
                columns={exhibitorColumns}
                emptyText="No approved exhibitors or recorded visits found."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Popularity</CardTitle>
            </CardHeader>

            <CardContent>
              <ReportTable
                rows={report.sessionStats}
                columns={sessionColumns}
                emptyText="No sessions found."
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
