import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-bg-tertiary/60 animate-pulse rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="border-border-subtle bg-glass/60 flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="border-border-subtle/50 flex items-center justify-between border-t pt-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
