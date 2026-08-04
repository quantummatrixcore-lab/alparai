import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-10 w-40" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary space-y-3 rounded-xl border p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="border-border-subtle bg-bg-secondary rounded-xl border">
        <div className="border-border-subtle border-b p-4">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="space-y-3 p-4">
          <div className="border-border-subtle flex items-center gap-4 border-b pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border-border-subtle flex items-center gap-4 border-b pb-3 last:border-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
