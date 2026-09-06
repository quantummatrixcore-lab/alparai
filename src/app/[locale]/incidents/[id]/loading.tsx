import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentDetailLoading() {
  return (
    <div className="min-h-screen bg-bg-primary py-8 sm:py-12">
      <Container>
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-4/5 max-w-2xl rounded-xl" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/6 rounded" />
              </div>
            </div>

            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-4">
              <Skeleton className="h-6 w-36 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>

            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-4">
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-4">
              <Skeleton className="h-6 w-32 rounded-md" />
              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>

            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 space-y-3">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
