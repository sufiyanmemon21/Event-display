import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
function AlertDialog(props) { return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />; }
function AlertDialogContent({className, ...props}) {
  return <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"/><AlertDialogPrimitive.Content data-slot="alert-dialog-content" className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-950 shadow-xl outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",className)} {...props}/></AlertDialogPrimitive.Portal>;
}
function AlertDialogHeader({className,...props}) { return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2",className)} {...props}/>; }
function AlertDialogFooter({className,...props}) { return <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",className)} {...props}/>; }
function AlertDialogTitle({className,...props}) { return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-lg font-semibold",className)} {...props}/>; }
function AlertDialogDescription({className,...props}) { return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-sm text-slate-500 dark:text-slate-400",className)} {...props}/>; }
function AlertDialogAction({className,...props}) { return <Button asChild className={className}><AlertDialogPrimitive.Action {...props}/></Button>; }
function AlertDialogCancel({className,...props}) { return <Button asChild variant="outline" className={className}><AlertDialogPrimitive.Cancel {...props}/></Button>; }
export { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
