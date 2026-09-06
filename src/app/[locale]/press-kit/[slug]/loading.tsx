import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-border-subtle bg-bg-secondary/40 mb-8 rounded-xl border p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-28 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 flex items-center gap-3 rounded-xl border p-4"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-40 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-6 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-6">
          <Skeleton className="mb-4 h-4 w-28 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-48 rounded-md" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 flex items-center gap-4 rounded-xl border p-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-56 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
