"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "error",
          msg: "Global error boundary",
          err: { name: error.name, message: error.message, digest: error.digest },
        }),
      );
    }
  }, [error]);
  return (
    <Container size="narrow" className="py-24 text-center">
      <AlertTriangle className="text-warning-500 mx-auto h-12 w-12" />
      <h1 className="text-fg-primary mt-4 text-2xl font-semibold">{t("somethingWentWrong")}</h1>
      <p className="text-fg-muted mt-2 text-sm">{t("unexpectedError")}</p>
      {error.digest && (
        <p className="text-fg-muted mt-2 text-xs">{t("error_id", { id: error.digest })}</p>
      )}
      <div className="mt-8">
        <Button onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />}>
          {t("tryAgain")}
        </Button>
      </div>
    </Container>
  );
}
