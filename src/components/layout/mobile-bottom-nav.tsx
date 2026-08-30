"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Activity, FileText, Plus, Trophy, Scale } from "lucide-react";

interface NavItem {
  href: string;
  labelTr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { href: "/feed", labelTr: "Akış", labelEn: "Feed", icon: Activity },
  { href: "/incidents", labelTr: "Olaylar", labelEn: "Incidents", icon: FileText },
  { href: "/submit", labelTr: "Bildir", labelEn: "Report", icon: Plus, isAction: true },
  { href: "/leaderboard", labelTr: "Liderlik", labelEn: "Ranks", icon: Trophy },
  { href: "/dilemmas", labelTr: "İkilemler", labelEn: "Dilemmas", icon: Scale },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const isAdmin =
    pathname &&
    (/^\/(?:en|tr|[a-z]{2})\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/"));

  if (isAdmin) {
    return null;
  }

  return (
    <div className="bg-[#0A1622]/95 border-border-subtle/60 safe-bottom fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const label = locale === "tr" ? item.labelTr : item.labelEn;

        if (item.isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-brand-500 hover:bg-brand-400 border-brand-400/30 z-50 -mt-5 flex h-12 w-12 flex-col items-center justify-center rounded-full border text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform hover:scale-105 active:scale-95"
              aria-label={label}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition-all duration-300",
              isActive
                ? "text-brand-400 bg-brand-500/10 font-bold"
                : "text-fg-secondary hover:text-fg-primary",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-brand-400")} />
            <span className="text-[10px] font-bold tracking-tight">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
