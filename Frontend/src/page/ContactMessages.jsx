import { PageHeading } from "@/components/workspace";
import { PendingEmpty } from "@/components/integration-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
export default function ContactMessages() {
  return <div className="space-y-6"><PageHeading title="Contact messages" description="The public contact form opens an email draft." /><div className="space-y-2 rounded-xl border bg-card p-4"><Label htmlFor="contact-message-search">Search sender, subject, email, or phone</Label><Input id="contact-message-search" placeholder="Inbox search unavailable" disabled /></div><div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{["Sender", "Email", "Phone", "Subject", "Message", "Date", "Actions"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={7}><PendingEmpty title="Contact inquiries are handled by email" description="Check the mailbox for hello@eventsphere.com to read inquiries." /></TableCell></TableRow></TableBody></Table></div><Button variant="outline" disabled>View message unavailable</Button></div>;
}
