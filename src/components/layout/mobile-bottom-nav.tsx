"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Activity, FileText, Plus, Trophy, Info } from "lucide-react";

interface NavItem {
  href: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { href: "/feed", key: "feed", icon: Activity },
  { href: "/incidents", key: "incidents", icon: FileText },
  { href: "/submit", key: "report", icon: Plus, isAction: true },
  { href: "/leaderboard", key: "leaderboard", icon: Trophy },
  { href: "/about", key: "about", icon: Info },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <div className="bg-bg-secondary/90 border-border-subtle safe-bottom fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-4 py-2 shadow-2xl backdrop-blur-md lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        if (item.isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-brand-500 hover:bg-brand-400 border-brand-400/20 z-50 -mt-6 flex h-12 w-12 flex-col items-center justify-center rounded-full border text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={t(item.key)}
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
              "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 transition-all duration-300",
              isActive
                ? "text-brand-400 bg-brand-500/5 font-bold"
                : "text-fg-secondary hover:text-fg-primary",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wider uppercase">
              {t(item.key).split(" ")[0]} {/* keep label brief */}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
