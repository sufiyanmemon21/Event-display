import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base
        transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3
        focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50
        aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm
        dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50
        dark:aria-invalid:ring-destructive/40 workspace:border-input workspace:rounded-lg
        workspace:[background:color-mix(in_srgb,_var(--card)_93%,_var(--muted))]
        workspace:[transition:border-color_.18s_ease,_box-shadow_.18s_ease,_background-color_.18s_ease]
        workspace:focus-visible:[outline:2px_solid_var(--ring)] workspace:focus-visible:outline-offset-2
        workspace:enabled:hover:border-ring motion-reduce:workspace:transition-none`,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
