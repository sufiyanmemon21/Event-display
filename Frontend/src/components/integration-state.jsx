import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PendingEmpty({ title, description }) {
  return (
    <div className="grid min-h-64 place-content-center justify-items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center [.workspace-form-body_fieldset_>_p&]:py-[14px]">
      <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
export function UnavailableAction({ children = "Save changes" }) {
  return <Button disabled>{children}</Button>;
}
