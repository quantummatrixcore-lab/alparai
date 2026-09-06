import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuggestionDetailLoading() {
  return (
    <Container size="narrow" className="py-10 sm:py-12">
      <Skeleton className="mb-6 h-5 w-32 rounded-md" />
      <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-4/5 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle/50 pt-4">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </Container>
  );
}
