import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-72 rounded-lg sm:h-12 sm:w-96" />
        <Skeleton className="mx-auto h-5 w-64 rounded-md" />
      </div>

      <div className="border-border-subtle bg-bg-secondary/20 mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border p-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-8 rounded-md" />
                <Skeleton className="h-3 w-6 rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-8 rounded-md" />
                <Skeleton className="h-3 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
