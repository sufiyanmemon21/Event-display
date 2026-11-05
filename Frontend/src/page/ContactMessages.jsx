import { PageHeading } from "@/components/workspace";
import { IntegrationNotice, PendingEmpty } from "@/components/integration-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
export default function ContactMessages() {
  return <div className="space-y-6"><PageHeading title="Contact messages" description="Review inquiries submitted through the public contact page." /><IntegrationNotice>The public contact form currently opens an email draft. It does not store submissions. A contact-message model and secured inbox endpoints are required before records can be searched or opened here.</IntegrationNotice><div className="space-y-2 rounded-xl border bg-card p-4"><Label htmlFor="contact-message-search">Search sender, subject, email, or phone</Label><Input id="contact-message-search" placeholder="Inbox search unavailable until connected" disabled /></div><div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{["Sender", "Email", "Phone", "Subject", "Message", "Date", "Actions"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={7}><PendingEmpty title="Contact inbox is not connected" description="No stored contact-message source is available. No sample inquiries have been added." /></TableCell></TableRow></TableBody></Table></div><Button variant="outline" disabled>View message unavailable</Button></div>;
}
