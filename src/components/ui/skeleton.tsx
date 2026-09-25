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

// FeedCardSkeleton domain component relocated to @/components/feed/feed-skeleton per Opus Component Taxonomy
export { FeedCardSkeleton } from "@/components/feed/feed-skeleton";
