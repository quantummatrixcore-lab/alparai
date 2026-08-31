"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Home, ShieldAlert } from "lucide-react";
import { Container } from "@/components/ui/layout";

export default function NotFound() {
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const pageNotFoundText = tCommon("not_found", { defaultValue: "Sayfa bulunamadı" });
  const notFoundDesc = tErrors("notFoundDesc", {
    defaultValue: "Aradığınız sayfa mevcut değil veya taşınmış.",
  });
  const goHomeText = tErrors("goHome", { defaultValue: "Ana sayfaya dön" });
  const error404Text = tErrors("error_404", { defaultValue: "Hata 404" });

  return (
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden py-16">
      {/* Ambient background glassmorphism glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bg-brand-500/20 animate-float absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-accent-500/15 animate-float-delayed absolute right-1/4 -bottom-24 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <Container size="narrow" className="relative z-10 text-center">
        <div className="animate-fade-up flex flex-col items-center">
          {/* Glass Badge */}
          <div className="border-border-subtle bg-bg-secondary/60 text-brand-400 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase shadow-sm backdrop-blur-md">
            <ShieldAlert className="text-brand-400 h-4 w-4" />
            <span>{error404Text}</span>
          </div>

          {/* 404 Large Gradient Text */}
          <h1 className="from-fg-primary via-brand-300 to-fg-muted sm:text-2xl bg-gradient-to-b bg-clip-text text-7xl font-extrabold tracking-tighter text-transparent select-none md:text-9xl">
            404
          </h1>

          {/* Page Not Found Title */}
          <h2 className="text-fg-primary text-2xl mt-4 font-bold tracking-tight sm:text-3xl">
            {pageNotFoundText}
          </h2>

          {/* Description */}
          <p className="text-fg-muted mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            {notFoundDesc}
          </p>

          {/* Action Button - Return to Home */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              <span>{goHomeText}</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
