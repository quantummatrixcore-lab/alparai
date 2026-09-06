"use client";

import { ErrorFallback } from "@/components/ui/error-boundary";

export default function AdminComplianceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} reset={reset} />;
}
