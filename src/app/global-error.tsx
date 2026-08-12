"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalErrorContent({ error, reset }: GlobalErrorProps) {
  let title = "Something went wrong";
  let errorIdLabel = "Error ID: ";
  let tryAgainLabel = "Try again";

  try {
    const t = useTranslations("errors");
    title = t("somethingWentWrong");
    errorIdLabel = error.digest ? t("error_id", { id: error.digest }) : "";
    tryAgainLabel = t("tryAgain");
  } catch {
    if (error.digest) {
      errorIdLabel = `Error ID: ${error.digest}`;
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="text-fg-primary text-2xl font-bold">{title}</h1>
        {error.digest && <p className="text-fg-muted mt-2 text-xs">{errorIdLabel}</p>}
      </div>
      <button
        onClick={reset}
        className="bg-brand-500 hover:bg-brand-600 cursor-pointer rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
      >
        {tryAgainLabel}
      </button>
    </div>
  );
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        msg: "Global unhandled error",
        err: { name: error.name, message: error.message, digest: error.digest },
      }),
    );
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg-primary text-fg-primary flex min-h-screen flex-col items-center justify-center p-8 font-sans">
        <GlobalErrorContent error={error} reset={reset} />
      </body>
    </html>
  );
}
