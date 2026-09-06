import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <Skeleton className="mb-4 h-7 w-32 rounded-sm" />
        <Skeleton className="mb-3 h-10 w-64 rounded-lg sm:h-12 sm:w-80" />
        <Skeleton className="h-5 w-72 rounded-md" />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 overflow-hidden rounded-xl border"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
              <Skeleton className="h-6 w-full rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
