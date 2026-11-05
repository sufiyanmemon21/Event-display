import { createContext, useContext } from "react";
export const ConfirmationContext = createContext(null);
export function useConfirmation() {
  return useContext(ConfirmationContext);
}
