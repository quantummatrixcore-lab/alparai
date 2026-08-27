import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner Skeleton */}
      <div className="space-y-4 text-center">
        <Skeleton className="bg-bg-secondary mx-auto h-7 w-64 rounded-full" />
        <Skeleton className="bg-bg-secondary mx-auto h-12 w-80 rounded-xl sm:w-[480px]" />
        <Skeleton className="bg-bg-secondary mx-auto h-5 w-72 rounded-lg sm:w-96" />
      </div>

      {/* Stat Cards Skeleton Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary rounded-2xl border p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="bg-bg-secondary h-4 w-24 rounded" />
              <Skeleton className="bg-bg-secondary h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="bg-bg-secondary mt-3 h-8 w-16 rounded-lg" />
            <Skeleton className="bg-bg-secondary mt-2 h-3.5 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Glass Filter Bar Skeleton */}
      <div className="border-border-subtle bg-bg-secondary mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border p-4 backdrop-blur-xl sm:flex-row">
        <Skeleton className="bg-bg-secondary h-10 flex-1 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="bg-bg-secondary h-10 w-36 rounded-xl" />
          <Skeleton className="bg-brand-500/20 h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Enterprise Table Skeleton */}
      <div className="border-border-subtle bg-bg-secondary overflow-hidden rounded-2xl border backdrop-blur-xl">
        <div className="border-border-subtle bg-bg-secondary border-b p-4">
          <Skeleton className="bg-bg-secondary h-5 w-full rounded" />
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 md:grid md:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.8fr_0.8fr_40px] md:items-center md:gap-4 md:px-6 md:py-4"
            >
              <div className="space-y-2">
                <Skeleton className="bg-bg-secondary h-5 w-40 rounded" />
                <Skeleton className="bg-bg-secondary h-3 w-28 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="bg-bg-secondary h-7 w-7 rounded-lg" />
                <Skeleton className="bg-bg-secondary h-4 w-24 rounded" />
              </div>
              <Skeleton className="bg-bg-secondary h-6 w-16 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="bg-bg-secondary h-4 w-20 rounded" />
                <Skeleton className="bg-bg-secondary h-5 w-8 rounded" />
              </div>
              <Skeleton className="bg-bg-secondary h-4 w-8 rounded" />
              <Skeleton className="bg-bg-secondary h-4 w-8 rounded" />
              <Skeleton className="bg-bg-secondary h-8 w-8 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
