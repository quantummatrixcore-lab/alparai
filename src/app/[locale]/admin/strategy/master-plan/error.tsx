"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-fg-muted flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-fg-secondary text-sm">{t("unexpectedError")}</p>
      <button
        onClick={reset}
        className="bg-brand-500 hover:bg-brand-600 cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white transition-colors"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
