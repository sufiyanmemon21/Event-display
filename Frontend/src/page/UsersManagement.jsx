import EllipseLoader from "@/components/EllipseLoader";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { PageHeading, RecordBrowser, FormPanel } from "@/components/workspace";
import { UnavailableAction } from "@/components/integration-state";
import { Table, TableHeader, TableBody, TableHead, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WorkspaceSelect from "@/components/workspace-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState("all");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/auth/allusers", {
          params: {
            page
          },
          signal: controller.signal
        });
        if (!controller.signal.aborted) setUsers(response.data.allUsers);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.msg || "Unable to load users.");
          setUsers([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, refresh]);
  return <div className="space-y-6"><PageHeading title="User management" description="Browse platform accounts and role assignments."><FormPanel title="Add user" trigger="Add User" description="Preview the account form. Creating accounts is currently unavailable."><fieldset className="mt-5 space-y-4"><div className="space-y-2"><Label htmlFor="new-user-name">Name</Label><Input id="new-user-name" autoComplete="off" /></div><div className="space-y-2"><Label htmlFor="new-user-email">Email</Label><Input id="new-user-email" type="email" autoComplete="off" /></div><div className="space-y-2"><Label htmlFor="new-user-role">Role</Label><WorkspaceSelect id="new-user-role" defaultValue="attendee"><option value="attendee">Attendee</option><option value="exhibitor">Exhibitor</option><option value="organizer">Organizer</option><option value="admin">Admin</option></WorkspaceSelect></div><UnavailableAction>Create user unavailable</UnavailableAction></fieldset></FormPanel></PageHeading><p className="text-sm text-muted-foreground">Search and filters apply to the current page of up to 20 accounts.</p><div className="grid gap-4 sm:grid-cols-3">{[["Accounts on this page", users.length], ["Attendees on this page", users.filter(u => u.role === "attendee").length], ["Exhibitors on this page", users.filter(u => u.role === "exhibitor").length]].map(([label, value]) => <Card key={label}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{loading ? "—" : value}</p></CardContent></Card>)}</div><div className="flex flex-wrap items-end justify-between gap-3"><div className="w-48 space-y-2"><Label htmlFor="user-role-filter">Role on this page</Label><WorkspaceSelect id="user-role-filter" value={role} onChange={e => setRole(e.target.value)}><option value="all">All roles</option>{["admin", "organizer", "exhibitor", "attendee"].map(value => <option key={value} value={value}>{value}</option>)}</WorkspaceSelect></div><Button variant="outline" disabled={loading} onClick={() => setRefresh(v => v + 1)}>Refresh users</Button></div>{loading ? <EllipseLoader label="Loading accounts" /> : error ? <p role="alert" className="text-destructive">{error}</p> : <RecordBrowser records={users.filter(user => role === "all" || user.role === role)} label="users" searchText={user => `${user.name} ${user.email} ${user.role}`}>{visible => <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map(user => <TableRow key={user._id}><TableCell className="font-medium">{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell><TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "Not recorded"}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => setSelected(user)}>View account</Button></TableCell></TableRow>)}</TableBody></Table></div>}</RecordBrowser>}<div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">Server page {page} · up to 20 users per request</span><div className="flex gap-2"><Button variant="outline" disabled={loading || page === 1} onClick={() => setPage(v => v - 1)}>Previous server page</Button><Button variant="outline" disabled={loading || users.length < 20} onClick={() => setPage(v => v + 1)}>Next server page</Button></div></div><Dialog open={Boolean(selected)} onOpenChange={open => {
      if (!open) setSelected(null);
    }}><DialogContent><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Account details returned by the admin API.</DialogDescription></DialogHeader><dl className="space-y-4 text-sm"><div><dt className="text-muted-foreground">Email</dt><dd>{selected?.email}</dd></div><div><dt className="text-muted-foreground">Role</dt><dd>{selected?.role}</dd></div></dl><UnavailableAction>Edit account unavailable</UnavailableAction></DialogContent></Dialog></div>;
}
