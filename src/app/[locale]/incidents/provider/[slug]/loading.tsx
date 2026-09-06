import { Container } from "@/components/ui/layout";
import { Skeleton, FeedCardSkeleton } from "@/components/ui/skeleton";

export default function ProviderIncidentsLoading() {
  return (
    <div className="min-h-screen bg-bg-primary py-8 sm:py-12">
      <Container>
        <div className="border-border-subtle bg-bg-secondary/40 mb-10 rounded-2xl border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-md rounded" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
