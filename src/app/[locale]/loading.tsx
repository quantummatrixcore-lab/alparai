import { Container } from "@/components/ui/layout";
import { Skeleton, FeedCardSkeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
