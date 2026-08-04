"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "error",
          msg: "Unhandled route error",
          err: { name: error.name, message: error.message, digest: error.digest },
        }),
      );
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-fg-primary text-2xl font-bold">{t("unexpectedError")}</h1>
        <p className="text-fg-muted text-sm">
          {error.digest ? t("error_id", { id: error.digest }) : null}
        </p>
      </div>
      <button
        onClick={reset}
        className="bg-brand-500 hover:bg-brand-600 rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
