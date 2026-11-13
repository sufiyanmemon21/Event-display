import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingRegion({ label, className, children }) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function CardSkeleton({ image = false }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--public-line,var(--border))] bg-card">
      {image && <Skeleton className="h-[clamp(132px,15vw,188px)] w-full rounded-none" />}
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ label, count = 3, image, className }) {
  return (
    <LoadingRegion label={label}>
      <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: count }, (_, index) => (
          <CardSkeleton key={index} image={image} />
        ))}
      </div>
    </LoadingRegion>
  );
}

export function TableSkeleton({ label, columns, rows = 5, rowClassName }) {
  return (
    <LoadingRegion label={label} className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="border-b bg-muted/30">
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index} className="px-3 py-3"><Skeleton className="h-3 w-3/4 max-w-24" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, row) => (
              <tr key={row} className="border-b last:border-b-0">
                {Array.from({ length: columns }, (_, column) => (
                  <td key={column} className={cn("px-3 py-4", rowClassName)}>
                    <Skeleton className={column === 0 ? "h-4 w-5/6 max-w-36" : "h-3 w-3/4 max-w-28"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LoadingRegion>
  );
}

export function ProfileSkeleton({ label }) {
  return (
    <LoadingRegion label={label} className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 shrink-0 rounded-xl" />
        <div className="w-full max-w-56 space-y-3">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 rounded-xl border p-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
