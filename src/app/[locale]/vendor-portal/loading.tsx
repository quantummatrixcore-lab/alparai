import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSectionLoading() {
  return (
    <Container className="py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-5 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-4">
        <Skeleton className="h-6 w-44 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </Container>
  );
}
