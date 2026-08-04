import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/layout";

export default function LeaderboardLoading() {
  return (
    <Container className="py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-96" />
    </Container>
  );
}
