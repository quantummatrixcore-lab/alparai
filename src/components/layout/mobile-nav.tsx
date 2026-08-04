"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Menu, X, Plus } from "lucide-react";
import { Wordmark } from "./wordmark";
import { LanguageSwitcher } from "./language-switcher";

const links = [
  { href: "/", key: "home" },
  { href: "/incidents", key: "incidents" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/dilemmas", key: "dilemmas" },
  { href: "/ai-act", key: "ai_act" },
  { href: "/transparency", key: "transparency" },
  { href: "/academy", key: "academy" },
  { href: "/blog", key: "blog" },
  { href: "/press-kit", key: "presskit" },
  { href: "/challenges", key: "challenges" },
] as const;

export function MobileNav({
  user,
}: {
  user?: {
    role: "user" | "moderator" | "admin" | "ceo";
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const isMod = user && (user.role === "moderator" || user.role === "admin" || user.role === "ceo");
  const activeLinks = isMod ? [...links, { href: "/admin", key: "admin" } as const] : links;

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = original;
        window.removeEventListener("keydown", handleKey);
      };
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary focus-visible:ring-brand-500 inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
        aria-label={tCommon("openMenu")}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div
          id="mobile-nav-panel"
          className="bg-bg-primary/95 fixed inset-0 z-50 flex flex-col backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={tCommon("openMenu")}
        >
          <div className="border-border-subtle flex items-center justify-between border-b p-4">
            <Wordmark size="md" />
            <button
              onClick={() => setOpen(false)}
              className="text-fg-secondary hover:bg-bg-tertiary focus-visible:ring-brand-500 inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
              aria-label={tCommon("closeMenu")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {activeLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "focus-visible:ring-brand-500 rounded-md px-4 py-3 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "bg-bg-tertiary text-brand-400"
                      : "text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary",
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
          <div className="border-border-subtle bg-bg-secondary/50 flex flex-col gap-4 border-t p-4">
            <Link
              href="/submit"
              className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r px-6 text-sm font-bold text-white shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("report")}
            </Link>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">{t("language_switcher")}</span>
              <LanguageSwitcher direction="up" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
