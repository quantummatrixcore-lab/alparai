"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  Plus,
  Home,
  BarChart3,
  Trophy,
  Scale,
  ShieldCheck,
  CreditCard,
  Shield,
  Eye,
  GraduationCap,
  Building,
  Users,
  BookOpen,
  Newspaper,
  Info,
  ChevronRight,
} from "lucide-react";
import { Wordmark } from "./wordmark";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

interface NavLinkItem {
  href: string;
  key: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavGroupItem {
  group: string;
}

type NavItem = NavLinkItem | NavGroupItem;

const links: readonly NavItem[] = [
  { href: "/", key: "home", icon: Home },
  { href: "/incidents", key: "incidents", icon: BarChart3 },
  { href: "/leaderboard", key: "leaderboard", icon: Trophy },
  { href: "/dilemmas", key: "dilemmas", icon: Scale },
  { href: "/ai-act", key: "ai_act", icon: ShieldCheck },
  { href: "/pricing", key: "pricing", icon: CreditCard },
  { group: "products" },
  { href: "/products/ars-api", key: "ars_api", icon: Shield },
  { href: "/products/datasets", key: "datasets", icon: BarChart3 },
  { href: "/products/browser-extension", key: "browser_extension", icon: Eye },
  { href: "/products/eu-ai-act", key: "eu_ai_act", icon: Scale },
  { href: "/academy", key: "academy", icon: GraduationCap },
  { href: "/enterprise", key: "enterprise", icon: Building },
  { group: "transparency" },
  { href: "/transparency", key: "transparency", icon: Eye },
  { href: "/velocity", key: "velocity", icon: BarChart3 },
  { href: "/methodology", key: "methodology", icon: Scale },
  { href: "/about/advisory-board", key: "advisory_board", icon: Users },
  { href: "/press-kit", key: "presskit", icon: BookOpen },
  { href: "/blog", key: "blog", icon: Newspaper },
  { href: "/about", key: "about", icon: Info },
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

  const isMod = user && (user.role === "moderator" || user.role === "admin" || user.role === "ceo");
  const activeLinks: readonly NavItem[] = isMod
    ? [...links, { href: "/admin", key: "admin", icon: ShieldCheck } as const]
    : links;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-platform robust body scroll lock (iOS Safari + Chrome + Firefox)
  useEffect(() => {
    if (!open) return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Helper for safe style reset
  

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-fg-secondary hover:bg-white/[0.06] hover:text-white focus-visible:ring-brand-500 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-95"
        aria-label={t("open_menu")}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            id="mobile-nav-panel"
            className="fixed inset-0 z-[999999] flex h-[100dvh] max-h-[100dvh] w-screen flex-col bg-bg-primary text-white shadow-2xl overflow-hidden overscroll-contain animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header with Safe Area Inset */}
            <div className="border-b border-border-subtle flex shrink-0 items-center justify-between bg-bg-secondary/95 px-4 py-3.5 backdrop-blur-2xl shadow-md pt-[max(0.875rem,env(safe-area-inset-top))]">
              <Wordmark size="md" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-fg-secondary hover:bg-white/10 hover:text-white focus-visible:ring-brand-500 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border-subtle bg-white/[0.04] focus-visible:ring-2 focus-visible:outline-none transition-all active:scale-95"
                aria-label={t("close_menu")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Navigation Area */}
            <nav
              role="navigation"
              aria-label="Mobile navigation"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 space-y-1 bg-bg-primary"
            >
              {activeLinks.map((item) => {
                const isGroup = "group" in item;
                if (isGroup) {
                  return (
                    <div
                      key={item.group}
                      className="text-fg-disabled mt-5 mb-1 px-3 text-[11px] font-bold tracking-wider uppercase"
                    >
                      {t(item.group)}
                    </div>
                  );
                }

                const Icon = item.icon;
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "focus-visible:ring-brand-500 group flex min-h-[46px] w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99] touch-manipulation",
                      isActive
                        ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-[0_0_15px_rgba(168,85,247,0.12)] font-bold"
                        : "text-fg-secondary hover:bg-white/[0.05] hover:text-white active:bg-white/[0.08]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 shrink-0 transition-colors",
                          isActive
                            ? "text-brand-300"
                            : "text-fg-muted group-hover:text-fg-secondary",
                        )}
                        aria-hidden="true"
                      />
                      <span>{t(item.key)}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive
                          ? "text-brand-300 opacity-100"
                          : "text-fg-disabled group-hover:text-fg-muted opacity-60 group-hover:translate-x-0.5",
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions & Safe Area Inset */}
            <div className="border-t border-border-subtle bg-bg-secondary/95 backdrop-blur-2xl shrink-0 flex flex-col gap-3 p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg">
              <Link
                href="/submit"
                onClick={() => setOpen(false)}
                className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 flex min-h-[48px] h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] transition-all"
              >
                <Plus className="h-4.5 w-4.5" aria-hidden="true" />
                <span>{t("report")}</span>
              </Link>
              <div className="flex min-h-[44px] items-center justify-between pt-1">
                <span className="text-fg-muted text-xs font-medium">{t("language_switcher")}</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle className="flex h-8.5 w-8.5 shrink-0" direction="up" />
                  <LanguageSwitcher direction="up" />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
