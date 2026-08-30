"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { RefreshCw, Home, AlertOctagon } from "lucide-react";
import { Container } from "@/components/ui/layout";

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
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden py-16">
      {/* Ambient background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bg-danger-500/20 animate-float absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]" />
      </div>

      <Container size="narrow" className="relative z-10 text-center">
        <div className="animate-fade-up flex flex-col items-center">
          {/* Glass Badge */}
          <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-md">
            <AlertOctagon className="text-danger-400 h-4 w-4" />
            <span>{t("somethingWentWrong", { defaultValue: "Bir şeyler ters gitti" })}</span>
          </div>

          {/* Title */}
          <h1 className="text-fg-primary text-2xl font-bold tracking-tight sm:text-3xl">
            {t("unexpectedError", { defaultValue: "Beklenmeyen bir hata oluştu." })}
          </h1>

          {/* Error Digest if present */}
          {error.digest && (
            <p className="text-fg-muted mt-2 font-mono text-xs">
              {t("error_id", { id: error.digest })}
            </p>
          )}

          {/* Description */}
          <p className="text-fg-muted mt-3 max-w-md text-sm leading-relaxed">
            {t("server_error_desc", {
              defaultValue: "Ekibimiz bilgilendirildi. Lütfen tekrar deneyin.",
            })}
          </p>

          {/* Action Buttons: Reset (Tekrar Dene) & Home Link (Ana Sayfaya Dön) */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t("tryAgain", { defaultValue: "Tekrar dene" })}</span>
            </button>

            <Link
              href="/"
              className="border-border-subtle bg-bg-secondary/60 hover:bg-bg-tertiary hover:border-border-default text-fg-primary inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="text-fg-muted h-4 w-4" />
              <span>{t("goHome", { defaultValue: "Ana sayfaya dön" })}</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
