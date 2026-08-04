import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/layout";

export default function AboutLoading() {
  return (
    <Container className="py-12">
      <div className="mb-12 space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </Container>
  );
}
