"use client";

import { useTranslations } from "next-intl";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-danger-500/10 flex h-16 w-16 items-center justify-center rounded-full">
        <AlertTriangle className="text-danger-500 h-8 w-8" aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-fg-primary text-xl font-semibold">{t("somethingWentWrong")}</h2>
        <p className="text-fg-muted text-sm">{error.message || t("unexpectedError")}</p>
        {error.digest && <p className="text-fg-muted text-xs">Error ID: {error.digest}</p>}
      </div>
      <Button variant="secondary" onClick={reset}>
        {t("tryAgain")}
      </Button>
    </div>
  );
}
