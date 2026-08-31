import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <article className="min-h-screen bg-bg-primary py-12 sm:py-16">
      <Container size="narrow">
        <Skeleton className="mb-8 h-5 w-28 rounded-md" />

        <div className="mb-8 space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-full max-w-2xl rounded-xl" />
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>

        <Skeleton className="mb-10 h-72 sm:h-96 w-full rounded-2xl" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <div className="py-4">
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </Container>
    </article>
  );
}
