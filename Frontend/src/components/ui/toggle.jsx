import { Toggle as TogglePrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { toggleVariants } from "./toggle-variants";

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle };