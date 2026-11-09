import AnimatedIcon from "@/components/AnimatedIcon";
import { PlusIcon } from "@animateicons/react/lucide";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function PageHeading({ title, description, children }) {
  return (
    <div
      className="workspace-heading flex flex-col justify-between gap-5 sm:flex-row sm:items-end
          workspace:p-[clamp(17px,_2.4vw,_30px)] workspace:border workspace:border-border workspace:rounded-[14px]
          workspace:[background:var(--card)] workspace:shadow-[var(--workspace-shadow)] workspace:border-s-[3px]
          workspace:border-s-ring [.eventsphere-workspace_&_p:last-child]:text-[1rem]"
    >
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
          EventSphere / Workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
export function FormPanel({
  title,
  description = "Complete the details below. Your changes are saved when you submit.",
  children,
  open,
  onOpenChange,
  trigger = "Add new",
  showCancel = true,
  closeButtonOnly = false,
  compact = false,
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const visible = open ?? localOpen;
  const change = onOpenChange ?? setLocalOpen;
  return (
    <>
      <AnimatedIcon icon={PlusIcon}>
        {(icon, triggerProps) => (
          <Button
            {...triggerProps}
            onClick={() => change(true)}
            className="gap-2"
          >
            {icon}
            {trigger}
          </Button>
        )}
      </AnimatedIcon>
      <Dialog open={visible} onOpenChange={change}>
        <DialogContent
          className={
            compact
              ? "workspace-form-panel workspace-form-compact workspace:p-[clamp(16px,_3vw,_28px)] workspace:gap-4 workspace:max-w-[32rem]"
              : "workspace-form-panel workspace:max-w-[42rem] workspace:p-[clamp(16px,_3vw,_28px)] workspace:gap-4"
          }
          onInteractOutside={
            closeButtonOnly ? (event) => event.preventDefault() : undefined
          }
          onEscapeKeyDown={
            closeButtonOnly ? (event) => event.preventDefault() : undefined
          }
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div
            className="workspace-form-body min-w-0 [&_fieldset]:grid [&_fieldset]:min-w-0
          [&_fieldset]:[grid-template-columns:minmax(0,_1fr)] [&_fieldset]:gap-[14px] [&_fieldset_>_*]:min-w-0
          [&_fieldset_>_*]:m-0 [&_fieldset_>_div:has(textarea)]:col-span-full [&_fieldset_>_p]:col-span-full
          [&_fieldset_>_button]:col-span-full [&_fieldset_>_button]:justify-self-end min-[640px]:[&_fieldset]:grid-cols-2"
          >
            {children}
          </div>
          {showCancel && (
            <DialogFooter>
              <Button variant="outline" onClick={() => change(false)}>
                Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function RecordBrowser({
  records,
  children,
  label = "records",
  searchText,
  statusKey,
  statusOptions,
  allStatusesLabel = "All statuses",
  statusValue,
  emptyText = "No records available yet.",
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const getStatus = statusValue ?? ((item) => item[statusKey]);
  const statuses =
    statusOptions ??
    (statusKey ? [...new Set(records.map(getStatus).filter(Boolean))] : []);
  const filtered = records.filter(
    (item) =>
      (status === "all" || getStatus(item) === status) &&
      (searchText ? searchText(item) : JSON.stringify(item))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  return (
    <section className="space-y-4">
      <div
        className="workspace-record-toolbar flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 sm:p-4
          workspace:border-border workspace:shadow-[var(--workspace-shadow)] workspace:border-border
          [.workspace-form-body_fieldset_>_p&]:py-[14px]"
      >
        <div className="relative min-w-0 flex-1 basis-48">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label={`Search ${label}`}
            placeholder={`Search ${label}…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-10 border-0 bg-muted/60 pl-9 shadow-none"
          />
        </div>
        {statuses.length > 0 && (
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger
              aria-label={`Filter ${label} by status`}
              className="w-44 max-w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allStatusesLabel}</SelectItem>
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Badge variant="secondary">
          {filtered.length} {label}
        </Badge>
      </div>
      {filtered.length ? (
        children(filtered.slice((current - 1) * 8, current * 8))
      ) : (
        <div
          className="grid min-h-52 place-content-center justify-items-center gap-3 workspace-empty rounded-xl border bg-card p-8
          text-center workspace:min-h-[10rem] workspace:[background:color-mix(in_srgb,_var(--card)_72%,_var(--muted))]
          [.workspace-form-body_fieldset_>_p&]:py-[14px]"
        >
          <Inbox className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {query || status !== "all" ? "No matching records" : emptyText}
          </p>
          <p className="text-sm text-muted-foreground">
            {query || status !== "all"
              ? "Try a different search or filter."
              : "Available records will appear here."}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground [.public-theme_&]:text-[0.8125rem] [.public-theme_&]:leading-[1.4rem]">
        <span>
          Page {current} of {pages}
        </span>
        <div className="flex gap-2">
          <Button
            aria-label="Previous page"
            size="icon"
            variant="outline"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label="Next page"
            size="icon"
            variant="outline"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
