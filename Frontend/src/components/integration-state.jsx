import { CircleAlert, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function IntegrationNotice({
  children,
  title = "Backend integration required"
}) {
  return <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/60 p-4 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"><CircleAlert className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">{title}</p><p className="mt-1 leading-relaxed opacity-80">{children}</p></div></div>;
}
export function PendingEmpty({
  title,
  description
}) {
  return <div className="grid min-h-64 place-content-center justify-items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center"><Inbox className="size-8 text-muted-foreground" /><Badge variant="outline">Not connected</Badge><h2 className="text-lg font-semibold">{title}</h2><p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{description}</p></div>;
}
export function UnavailableAction({
  children = "Save changes"
}) {
  return <Button disabled title="Requires a backend API that is not implemented">{children}</Button>;
}
