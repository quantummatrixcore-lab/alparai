"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import { Globe } from "lucide-react";

interface LocaleOption {
  code: Locale;
  label: string;
  name: string;
}

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "tr", label: "TR", name: "Türkçe" },
].filter((opt) => SUPPORTED_LOCALES.includes(opt.code as Locale)) as LocaleOption[];

export function LanguageSwitcher({
  className,
  direction = "down",
}: {
  className?: string;
  direction?: "up" | "down";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleSelect(code: Locale) {
    if (code === locale) return;

    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    }

    try {
      router.replace(pathname, { locale: code });
    } catch {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const segments = currentPath.split("/").filter(Boolean);
        if (segments.length > 0 && LOCALE_OPTIONS.some((o) => o.code === segments[0])) {
          segments[0] = code;
          window.location.href =
            window.location.origin + "/" + segments.join("/") + window.location.search;
        } else {
          window.location.href =
            window.location.origin + `/${code}${currentPath}${window.location.search}`;
        }
      }
    }
  }

  // Quick 1-click toggle between EN and TR
  function handleToggle() {
    const nextLocale: Locale = locale === "tr" ? "en" : "tr";
    handleSelect(nextLocale);
  }

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        onClick={handleToggle}
        title={locale === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
        className={cn(
          "group inline-flex h-8 items-center gap-1.5 rounded-full border border-border-subtle bg-white/[0.04] px-2.5 text-xs font-semibold text-fg-secondary transition-all duration-200",
          "hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white",
          "focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none cursor-pointer"
        )}
        aria-label="Switch language"
        aria-current="true"
      >
        <Globe className="h-3.5 w-3.5 text-fg-muted group-hover:text-brand-300 transition-colors" aria-hidden="true" />
        <span className="font-mono text-[11px] font-bold tracking-wider text-fg-primary uppercase group-hover:text-white">
          {locale.toUpperCase()}
        </span>
      </button>
    </div>
  );
}
