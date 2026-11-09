import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors
        outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium
        file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3
        focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50
        disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
        md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50
        dark:aria-invalid:ring-destructive/40 workspace:border-input workspace:rounded-lg
        workspace:[background:color-mix(in_srgb,_var(--card)_93%,_var(--muted))] workspace:min-h-[42px]
        workspace:min-w-0
        workspace:[transition:border-color_.18s_ease,_box-shadow_.18s_ease,_background-color_.18s_ease]
        workspace:focus-visible:[outline:2px_solid_var(--ring)] workspace:focus-visible:outline-offset-2
        workspace:enabled:hover:border-ring motion-reduce:workspace:transition-none`,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
