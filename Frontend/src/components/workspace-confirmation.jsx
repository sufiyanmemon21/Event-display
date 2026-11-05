import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { ConfirmationContext } from "@/hooks/useConfirmation";
export function ConfirmationProvider({children}) {
  const [request, setRequest] = useState(null);
  function confirm(message) {
    return new Promise(resolve => setRequest({message, resolve}));
  }
  function finish(value) {
    request?.resolve(value);
    setRequest(null);
  }
  return <ConfirmationContext.Provider value={confirm}>
    {children}
    <AlertDialog open={Boolean(request)} onOpenChange={open => {if (!open) finish(false);}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
          <AlertDialogDescription>{request?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => finish(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => finish(true)}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </ConfirmationContext.Provider>;
}
