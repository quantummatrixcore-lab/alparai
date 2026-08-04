import { Skeleton, FeedCardSkeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/layout";

export default function IncidentsLoading() {
  return (
    <Container className="py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
