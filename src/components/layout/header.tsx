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
    <div className="pointer-events-none fixed top-8 z-[100] flex w-full justify-center px-3 py-2 sm:p-6">
      <header className="hover:border-brand-500/30 pointer-events-auto flex h-13 w-full max-w-[1400px] items-center justify-between gap-2 rounded-full border border-white/10 bg-[#0A1622]/95 px-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(168,85,247,0.25)] sm:h-14 sm:px-4 xl:gap-4">
        <div className="flex flex-shrink-0 items-center gap-3 xl:gap-5 2xl:gap-8">
          <Link
            href="/"
            className="focus-visible:ring-brand-500 group relative flex flex-shrink-0 items-center rounded-full pl-1 focus-visible:ring-2 focus-visible:outline-none"
            aria-label={tCommon("alparAi", { defaultValue: "ALPAR AI" }) + " home"}
          >
            <div className="from-brand-500/0 via-brand-500/10 to-brand-500/0 absolute -inset-2 rounded-full bg-gradient-to-r opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"></div>
            <Wordmark size="md" />
          </Link>
          <div className="hidden flex-shrink-0 items-center lg:flex">
            <Nav user={user} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <a
            href="https://github.com/quantummatrixcore-lab/alparai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted hover:text-brand-400 focus-visible:ring-brand-500 hidden h-9 min-h-[44px] w-9 min-w-[44px] flex-shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none sm:flex"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>
          <LanguageSwitcher className="hidden flex-shrink-0 lg:inline-flex" />
          <Link
            href="/submit"
            style={{ whiteSpace: "nowrap" }}
            className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus-visible:ring-brand-500 hidden h-9 min-h-[44px] flex-shrink-0 touch-manipulation items-center gap-1.5 rounded-full bg-gradient-to-r px-4 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] md:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t("report")}
          </Link>
          <div className="flex-shrink-0 pl-1">
            <UserMenu initialUser={user} />
          </div>
          <div className="flex-shrink-0 lg:hidden">
            <MobileNav user={user} />
          </div>
        </div>
      </header>
    </div>
  );
}
