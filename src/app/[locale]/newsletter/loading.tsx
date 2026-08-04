import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-6 shadow-2xl">
        <div className="space-y-4 pb-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-xl" />
          <Skeleton className="mx-auto h-7 w-56 rounded-md" />
          <Skeleton className="mx-auto h-4 w-72 rounded-md" />
        </div>

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        <div className="border-border-subtle mt-8 grid grid-cols-2 gap-4 border-t pt-6">
          <div className="flex items-start gap-2.5">
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-2.5 w-36 rounded-md" />
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-2.5 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
