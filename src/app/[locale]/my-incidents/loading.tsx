import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="mt-1 h-4 w-32 rounded-md" />
      </header>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 flex items-center gap-4 rounded-xl border p-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-64 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-5 w-18 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
