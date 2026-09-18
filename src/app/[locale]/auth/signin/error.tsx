"use client";

import { ErrorFallback } from "@/components/ui/error-boundary";

export default function AuthSigninError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
    throw error;
  }
  return <ErrorFallback error={error} reset={reset} />;
}
