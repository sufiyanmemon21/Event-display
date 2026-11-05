import { PageHeading } from "@/components/workspace";
import { IntegrationNotice, PendingEmpty } from "@/components/integration-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
export default function AdminMessages() {
  return <div className="space-y-6"><PageHeading title="Messages" description="Administrative communication workspace." /><IntegrationNotice>The messaging API allows organizers, exhibitors, and attendees, and explicitly denies admins. Admin conversations require a new server authorization policy and routing rules. Existing role permissions have been preserved.</IntegrationNotice><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><div className="space-y-3 rounded-xl border bg-card p-4"><Label htmlFor="admin-message-search">Find a contact</Label><Input id="admin-message-search" disabled placeholder="Admin contacts unavailable" /><p className="py-8 text-center text-sm text-muted-foreground">No admin contact source is connected.</p></div><div className="space-y-4"><PendingEmpty title="Admin messaging is unavailable" description="Existing participants can continue using their authorized conversation workflows." /><div className="space-y-3 rounded-xl border bg-card p-4"><Label htmlFor="admin-message-composer">Message</Label><Textarea id="admin-message-composer" disabled placeholder="Messaging requires backend integration" /><Button disabled>Send unavailable</Button></div></div></div></div>;
}
