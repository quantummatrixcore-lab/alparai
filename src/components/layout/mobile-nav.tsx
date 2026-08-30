"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Plus } from "lucide-react";
import { Wordmark } from "./wordmark";
import { LanguageSwitcher } from "./language-switcher";

type NavLink = { href: string; key: string };
type NavGroup = { group: string };
type NavItem = NavLink | NavGroup;

const links: readonly NavItem[] = [
  { href: "/", key: "home" },
  { href: "/incidents", key: "incidents" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/dilemmas", key: "dilemmas" },
  { href: "/ai-act", key: "ai_act" },
  { href: "/pricing", key: "pricing" },
  { group: "products" },
  { href: "/products/ars-api", key: "ars_api" },
  { href: "/products/datasets", key: "datasets" },
  { href: "/products/browser-extension", key: "browser_extension" },
  { href: "/products/eu-ai-act", key: "eu_ai_act" },
  { href: "/academy", key: "academy" },
  { href: "/enterprise", key: "enterprise" },
  { group: "transparency" },
  { href: "/transparency", key: "transparency" },
  { href: "/velocity", key: "velocity" },
  { href: "/methodology", key: "methodology" },
  { href: "/about/advisory-board", key: "advisory_board" },
  { href: "/press-kit", key: "presskit" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
] as const;

export function MobileNav({
  user,
}: {
  user?: {
    role: "user" | "moderator" | "admin" | "ceo";
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const isMod = user && (user.role === "moderator" || user.role === "admin" || user.role === "ceo");
  const activeLinks = isMod ? [...links, { href: "/admin", key: "admin" } as const] : links;

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {open && mounted && createPortal(
        <div
          id="mobile-nav-panel"
          className="fixed inset-0 z-[999999] flex min-h-screen w-screen flex-col bg-[#070e17] text-white pointer-events-auto shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label={tCommon("openMenu")}
        >
          <div className="border-b border-white/10 flex shrink-0 items-center justify-between bg-[#0A1622] p-4 shadow-md">
            <Wordmark size="md" />
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:bg-white/10 hover:text-white focus-visible:ring-brand-500 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 focus-visible:ring-2 focus-visible:outline-none transition-colors"
              aria-label={tCommon("closeMenu")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4 bg-[#070e17]">
            {activeLinks.map((item) => {
              const isGroup = "group" in item;
              if (isGroup) {
                return (
                  <div
                    key={item.group}
                    className="text-zinc-500 mt-4 px-4 pb-1 text-xs font-bold tracking-wider uppercase"
                  >
                    {t(item.group)}
                  </div>
                );
              }
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "focus-visible:ring-brand-500 rounded-xl px-4 py-3.5 text-base font-semibold transition-all focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 bg-[#0A1622] flex shrink-0 flex-col gap-4 p-4 pb-8 safe-bottom">
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("report")}
            </Link>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400 text-xs font-medium">{t("language_switcher")}</span>
              <LanguageSwitcher direction="up" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
