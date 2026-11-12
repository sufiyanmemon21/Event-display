import AnimatedIcon from "@/components/AnimatedIcon";
import EllipsisLoader from "@/components/EllipsisLoader";
import {
  CalendarIcon,
  UsersIcon,
  Building2Icon,
  ClockIcon,
  ChartNoAxesColumnIcon,
} from "@animateicons/react/lucide";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, RefreshCw } from "lucide-react";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function Dashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    function updateAuth() {
      setToken(localStorage.getItem("token"));
      setRefresh((previous) => previous + 1);
    }
    window.addEventListener("auth-changed", updateAuth);
    window.addEventListener("storage", updateAuth);
    return () => {
      window.removeEventListener("auth-changed", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      setUser(null);
      setStats([]);
      setRecords([]);
      setError("");
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const options = {
          signal: controller.signal,
        };
        const account = await API.get("/auth/me", options);
        const currentUser =
          account.data.user || account.data.data || account.data;
        if (!currentUser.role) {
          throw new Error("Unable to identify account role.");
        }
        let nextStats = [];
        let nextRecords = [];
        if (["organizer", "admin"].includes(currentUser.role)) {
          const response = await API.get("/analytics/summary", options);
          const data = response.data.analytics;
          nextStats = [
            {
              label: "Total Listings",
              value: data.totalEvents,
            },
            {
              label: "Attendee Registrations",
              value: data.attendeeRegistrations,
            },
            {
              label: "Exhibitor Applications",
              value: data.exhibitorApplications,
            },
            {
              label: "Pending Applications",
              value: data.pendingApplications,
            },
            {
              label: "Reserved Booths",
              value: data.reservedBooths,
            },
            {
              label: "Total Booths",
              value: data.totalBooths,
            },
            {
              label: "Booth Occupancy",
              value: `${data.boothReservationRate}%`,
            },
            {
              label: "Approved Applications",
              value: data.approvedApplications,
            },
            {
              label: "Sessions",
              value: data.totalSessions,
            },
          ];
          nextRecords = response.data.events.map((event) => ({
            id: event._id,
            title: event.title,
            detail: "Manage this event from the Events page.",
          }));
        } else if (currentUser.role === "exhibitor") {
          const response = await API.get("/exhibitors/all", options);
          const applications = response.data.exhibitors;
          nextStats = [
            {
              label: "My Applications",
              value: applications.length,
            },
            {
              label: "Approved",
              value: applications.filter((item) => item.status === "Approved")
                .length,
            },
            {
              label: "Pending",
              value: applications.filter((item) => item.status === "Pending")
                .length,
            },
            {
              label: "Rejected",
              value: applications.filter((item) => item.status === "Rejected")
                .length,
            },
          ];
          nextRecords = applications.map((item) => ({
            id: item._id,
            title: item.companyName,
            detail: `${item.event?.title || "Unavailable event"} · ${item.status} · Booth: ${item.boothNumber || "Not assigned"}`,
          }));
        } else if (currentUser.role === "attendee") {
          const response = await API.get("/attendees/all", options);
          const registrations = response.data.attendees;
          nextStats = [
            {
              label: "My Event Registrations",
              value: registrations.length,
            },
          ];
          nextRecords = registrations.map((item) => ({
            id: item._id,
            title: item.event?.title || "Unavailable event",
            detail: `Ticket: ${item.ticketType || "Standard"} · ${item.event?.location || "Location unavailable"}`,
          }));
        } else {
          throw new Error("This account role is not supported.");
        }
        if (controller.signal.aborted) return;
        setUser(currentUser);
        setStats(nextStats);
        setRecords(nextRecords);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.msg ||
              err.message ||
              "Unable to load dashboard.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadDashboard();
    return () => controller.abort();
  }, [token, refresh]);
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to EventSphere</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-muted-foreground">
              Manage events, discover exhibitors and plan your sessions in one
              place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/dashboard/login">Login</Link>
              </Button>

              <Button asChild variant="outline">
                <Link to="/dashboard/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const isOrganizer = ["organizer", "admin"].includes(user?.role);
  const shortcuts = isOrganizer
    ? [
        {
          title: "Manage Events",
          path: "/dashboard/events",
        },
        {
          title: "Manage Expos",
          path: "/events",
        },
        {
          title: "Review Applications",
          path: "/exhibitors",
        },
        {
          title: "Manage Booths",
          path: "/booths",
        },
        {
          title: "Manage Sessions",
          path: "/sessions",
        },
        {
          title: "View Analytics",
          path: "/analytics",
        },
      ]
    : user?.role === "exhibitor"
      ? [
          {
            title: "My Applications",
            path: "/exhibitors",
          },
          {
            title: "Select Booth",
            path: "/booths",
          },
          {
            title: "Company Profile",
            path: "/exhibitor-profile",
          },
          {
            title: "Search Exhibitors",
            path: "/exhibitor-search",
          },
        ]
      : [
          {
            title: "Event Registration",
            path: "/attendees",
          },
          {
            title: "Session Schedule",
            path: "/sessions",
          },
          {
            title: "Search Exhibitors",
            path: "/exhibitor-search",
          },
        ];
  const listTitle = isOrganizer
    ? "Your Events"
    : user?.role === "exhibitor"
      ? "My Applications"
      : "My Registered Events";
  const statIcons = [
    CalendarIcon,
    UsersIcon,
    Building2Icon,
    ClockIcon,
    ChartNoAxesColumnIcon,
    Building2Icon,
    ChartNoAxesColumnIcon,
    Building2Icon,
    CalendarIcon,
  ];
  return (
    <div className="space-y-7">
      <div
        className="workspace-heading workspace-overview flex min-w-0 flex-col gap-6 rounded-2xl border border-border border-s-[3px] border-s-ring bg-card p-5 shadow-[var(--workspace-shadow)] sm:p-7 xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="min-w-0 space-y-3">
          <Badge variant="secondary" className="capitalize">
            {user?.role} workspace
          </Badge>
          <div>
            <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {user?.role === "admin"
                ? "Admin Dashboard"
                : user?.role === "exhibitor"
                  ? "Exhibitor Dashboard"
                  : `Welcome back${user?.name ? `, ${user.name}` : ""}`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {isOrganizer
                ? "Overview of your listings, booths, exhibitors, and attendee bookings."
                : "Manage your registrations, booth reservations, and event activity."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full shrink-0 rounded-xl bg-card text-foreground sm:w-auto [.workspace-form-body_fieldset_>_p&]:py-[14px]"
          disabled={loading}
          onClick={() => setRefresh((previous) => previous + 1)}
        >
          {loading ? (
            <EllipsisLoader scope="inline" label="Refreshing overview" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh overview
        </Button>
      </div>

      {loading ? (
        <EllipsisLoader scope="page" label="Loading dashboard" />
      ) : error ? (
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => setRefresh((previous) => previous + 1)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item, index) => (
              <AnimatedIcon
                key={item.label}
                icon={statIcons[index % statIcons.length]}
                size={20}
              >
                {(icon, triggerProps) => (
                  <Card
                    {...triggerProps}
                    className="workspace-stat-card group relative overflow-hidden rounded-xl border border-border/80 transition
          hover:border-primary/40 [.eventsphere-workspace_&::before]:content-['']
          [.eventsphere-workspace_&::before]:absolute [.eventsphere-workspace_&::before]:top-[calc(50%_-_7px)]
          [.eventsphere-workspace_&::before]:w-[14px] [.eventsphere-workspace_&::before]:h-[14px]
          [.eventsphere-workspace_&::before]:[border:1px_solid_var(--border)]
          [.eventsphere-workspace_&::before]:rounded-[50%]
          [.eventsphere-workspace_&::before]:[background:var(--background)]
          [.eventsphere-workspace_&::before]:pointer-events-none [.eventsphere-workspace_&::before]:left-[-8px]
          [.eventsphere-workspace_&::after]:content-[''] [.eventsphere-workspace_&::after]:absolute
          [.eventsphere-workspace_&::after]:top-[calc(50%_-_7px)] [.eventsphere-workspace_&::after]:w-[14px]
          [.eventsphere-workspace_&::after]:h-[14px] [.eventsphere-workspace_&::after]:[border:1px_solid_var(--border)]
          [.eventsphere-workspace_&::after]:rounded-[50%]
          [.eventsphere-workspace_&::after]:[background:var(--background)]
          [.eventsphere-workspace_&::after]:pointer-events-none [.eventsphere-workspace_&::after]:right-[-8px]
          [.workspace-form-body_fieldset_>_p&]:py-[14px]"
                  >
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="space-y-2">
                        <p className="text-sm font-medium opacity-70">
                          {item.label}
                        </p>
                        <p className="text-3xl font-semibold tracking-tight tabular-nums">
                          {item.value}
                        </p>
                      </div>
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        {icon}
                      </span>
                    </CardContent>
                  </Card>
                )}
              </AnimatedIcon>
            ))}
          </div>

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
              <div>
                <CardTitle className="text-base">Your workspace</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jump back into the tools you use most.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
              {shortcuts.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-4
          py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring [.workspace-form-body_fieldset_>_p&]:py-[14px]"
                >
                  <span>{item.title}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
              <Link
                to="/notifications"
                className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-4
          py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring [.workspace-form-body_fieldset_>_p&]:py-[14px]"
              >
                <span>Notifications</span>
                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
              <Link
                to="/feedback"
                className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-4
          py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring [.workspace-form-body_fieldset_>_p&]:py-[14px]"
              >
                <span>Feedback & support</span>
                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
              <div>
                <CardTitle className="text-base">{listTitle}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent activity from your account.
                </p>
              </div>
              <Badge variant="outline" className="tabular-nums">
                {records.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {records.length === 0 ? (
                <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                  <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                    <CalendarDays className="size-5" />
                  </span>
                  <p className="font-medium">Nothing here yet</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Your {listTitle.toLowerCase()} will appear here when
                    available.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="px-5">Name</TableHead>
                      <TableHead className="px-5">Details</TableHead>
                      <TableHead className="px-5 text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xs whitespace-normal px-5 py-4 font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell className="max-w-lg whitespace-normal px-5 py-4 text-muted-foreground">
                          {item.detail}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                          >
                            <Link
                              to={
                                isOrganizer
                                  ? "/events"
                                  : user?.role === "exhibitor"
                                    ? "/exhibitors"
                                    : "/attendees"
                              }
                              aria-label={`Open ${item.title}`}
                            >
                              Open
                              <ArrowUpRight className="ml-1 size-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
