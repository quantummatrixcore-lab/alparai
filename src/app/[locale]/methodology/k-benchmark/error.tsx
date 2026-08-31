"use client";

import { ErrorFallback } from "@/components/ui/error-boundary";

export default function MethodologyKBenchmarkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} />;
}
