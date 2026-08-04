"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import { Globe, Check } from "lucide-react";

interface LocaleOption {
  code: Locale;
  flag: string;
  name: string;
}

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "tr", flag: "🇹🇷", name: "Türkçe" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
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
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const isAdmin = pathname.startsWith("/admin");
  const availableOptions = isAdmin
    ? LOCALE_OPTIONS.filter((o) => o.code === "en" || o.code === "tr")
    : LOCALE_OPTIONS;

  const current = availableOptions.find((o) => o.code === locale) ?? availableOptions[0]!;

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function handleSelect(code: Locale) {
    if (code === locale) {
      setOpen(false);
      return;
    }
    // Explicitly update NEXT_LOCALE cookie so middleware & SSR pick up the new language immediately
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
          window.location.href = "/" + segments.join("/") + window.location.search;
        } else {
          window.location.href = `/${code}${currentPath}${window.location.search}`;
        }
      }
    }
    setOpen(false);
  }

  function handleClick() {
    if (isAdmin) {
      const nextLocale: Locale = locale === "tr" ? "en" : "tr";
      handleSelect(nextLocale);
    } else {
      setOpen((prev) => !prev);
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleClick}
        title={isAdmin ? `Switch to ${locale === "tr" ? "English" : "Türkçe"}` : "Select language"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5",
          "text-fg-secondary text-xs font-medium transition-all duration-200",
          "hover:text-fg-primary hover:border-white/[0.15] hover:bg-white/[0.06]",
          "focus-visible:ring-brand-500/50 focus-visible:ring-2 focus-visible:outline-none",
          open && !isAdmin && "text-fg-primary border-white/[0.15] bg-white/[0.06]",
        )}
        aria-expanded={isAdmin ? undefined : open}
        aria-label={
          isAdmin ? `Switch to ${locale === "tr" ? "English" : "Türkçe"}` : "Select language"
        }
      >
        <Globe className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="font-semibold tracking-wider uppercase">{current.code}</span>
        {!isAdmin && (
          <svg
            className={cn(
              "h-3 w-3 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {!isAdmin && open && (
        <div
          className={cn(
            "absolute right-0 z-50 min-w-[180px] overflow-hidden rounded-xl",
            direction === "up" ? "mb-1.5" : "top-full mt-1.5",
            "border border-white/[0.1] bg-[#0a0a0f]/95 backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          )}
          style={{
            animation: "fadeIn 0.15s ease-out",
            ...(direction === "up" ? { bottom: "100%" } : {}),
          }}
        >
          <div className="p-1">
            {availableOptions.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  opt.code === locale
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06]",
                )}
              >
                <span className="text-base leading-none">{opt.flag}</span>
                <span className="flex-1 font-medium">{opt.name}</span>
                {opt.code === locale && <Check className="text-brand-400 h-3.5 w-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
