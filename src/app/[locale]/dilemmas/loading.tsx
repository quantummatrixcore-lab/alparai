import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/layout";

export default function DilemmasLoading() {
  return (
    <Container className="py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </Container>
  );
}
