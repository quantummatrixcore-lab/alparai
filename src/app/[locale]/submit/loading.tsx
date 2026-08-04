import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/layout";

export default function SubmitLoading() {
  return (
    <Container className="py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-32" />
        <Skeleton className="h-12" />
      </div>
    </Container>
  );
}
