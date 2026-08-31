"use client";

import { Link } from "@/i18n/routing";
import { Wordmark } from "./wordmark";
import { Nav } from "./nav";
import { MobileNav } from "./mobile-nav";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";
import { useTranslations } from "next-intl";
import { Plus, Github } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header({
  user,
}: {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: "user" | "moderator" | "admin" | "ceo";
  } | null;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const isAdmin =
    pathname &&
    (/^\/[a-z]{2}\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/"));

  if (isAdmin) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-6 z-[100] flex w-full justify-center px-3 sm:px-6">
      <header role="banner" className="hover:border-brand-500/40 pointer-events-auto flex h-13 w-full max-w-[1280px] items-center justify-between gap-2 rounded-full border border-white/10 bg-[#080D17]/95 px-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-2xl transition-all duration-300 sm:h-14 sm:px-5">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        {/* Left Side: Logo & Main Navigation */}
        <div className="flex min-w-0 items-center gap-3 xl:gap-5">
          <Link
            href="/"
            className="focus-visible:ring-brand-500 group relative flex shrink-0 items-center rounded-full pl-1 focus-visible:ring-2 focus-visible:outline-none"
            aria-label={tCommon("alparAi", { defaultValue: "ALPAR AI" }) + " home"}
          >
            <div className="from-brand-500/0 via-brand-500/15 to-brand-500/0 absolute -inset-2 rounded-full bg-gradient-to-r opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
            <Wordmark size="md" />
          </Link>
          <Nav user={user} />
        </div>

        {/* Right Side: GitHub, Language Toggle, CTA Button, User Profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <a
            href="https://github.com/quantummatrixcore-lab/alparai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white focus-visible:ring-brand-500 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:outline-none sm:flex"
            aria-label="GitHub Repository"
          >
            <Github className="h-4 w-4" />
          </a>

          <LanguageSwitcher className="hidden sm:inline-flex shrink-0" />

          <Link
            href="/submit"
            className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus-visible:ring-brand-500 inline-flex h-8.5 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r px-3.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("report")}</span>
          </Link>

          <div className="shrink-0 pl-0.5">
            <UserMenu initialUser={user} />
          </div>

          <div className="shrink-0 lg:hidden">
            <MobileNav user={user} />
          </div>
        </div>
      </header>
    </div>
  );
}
