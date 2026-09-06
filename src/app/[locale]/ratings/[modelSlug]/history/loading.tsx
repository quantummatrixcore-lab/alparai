import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function RatingsHistoryLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-72 rounded-lg mb-2" />
      <Skeleton className="h-4 w-96 max-w-full rounded mb-8" />

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-5 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
