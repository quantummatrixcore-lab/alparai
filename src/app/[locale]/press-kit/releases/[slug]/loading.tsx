import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function PressReleaseLoading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="border-border-subtle/50 bg-bg-navy border-b py-8">
        <Container>
          <Skeleton className="mb-8 h-5 w-36 rounded-md" />
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-5 w-full rounded" />
          </div>
        </Container>
      </div>
      <Container size="narrow" className="py-12 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </Container>
    </div>
  );
}
