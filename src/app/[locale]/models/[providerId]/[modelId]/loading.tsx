import { Skeleton } from "@/components/ui/skeleton";

export default function ModelDetailLoading() {
  return (
    <div className="min-h-screen bg-bg-primary py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <Skeleton className="h-6 w-32 bg-bg-secondary" />
        
        {/* Banner Skeleton */}
        <div className="border-border-subtle bg-bg-secondary/40 rounded-3xl border p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl bg-bg-tertiary" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-bg-tertiary" />
              <Skeleton className="h-8 w-64 bg-bg-tertiary" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20 rounded-lg bg-bg-tertiary" />
            <Skeleton className="h-8 w-28 rounded-lg bg-bg-tertiary" />
          </div>
        </div>

        {/* Score Display Skeleton */}
        <div className="border-border-subtle bg-bg-secondary/40 rounded-3xl border p-8">
          <Skeleton className="h-32 w-full bg-bg-secondary" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-8 w-48 bg-bg-secondary" />
            <Skeleton className="h-40 w-full rounded-2xl bg-bg-secondary" />
            <Skeleton className="h-40 w-full rounded-2xl bg-bg-secondary" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-2xl bg-bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
