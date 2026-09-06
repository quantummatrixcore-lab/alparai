import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <Skeleton className="mb-4 h-7 w-36 rounded-sm" />
        <Skeleton className="mb-3 h-10 w-56 rounded-lg sm:h-12 sm:w-72" />
        <Skeleton className="h-5 w-80 rounded-md" />
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 flex items-center gap-3 rounded-lg border p-4"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-12 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="divide-border-subtle border-border-subtle bg-bg-secondary/40 divide-y rounded-xl border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-1 items-center gap-4 p-5 sm:grid-cols-[60px_1fr_120px_120px_100px]"
          >
            <div className="flex items-center justify-center">
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14 rounded-md" />
              <Skeleton className="h-4 w-10 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-10 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
