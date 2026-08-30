"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Scale,
  Eye,
  Shield,
  ChevronDown,
  Users,
  Building,
  CreditCard,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  items: NavItem[];
}

const topLevelItems: NavItem[] = [
  {
    href: "/incidents",
    labelKey: "incidents",
    icon: BarChart3,
  },
  { href: "/leaderboard", labelKey: "leaderboard", icon: Trophy },
  {
    href: "/dilemmas",
    labelKey: "dilemmas",
    icon: Scale,
  },
  { href: "/ai-act", labelKey: "ai_act", icon: ShieldCheck },
  { href: "/academy", labelKey: "academy", icon: GraduationCap },
  { href: "/about/advisory-board", labelKey: "advisory_board", icon: Users },
];

const navGroups: NavGroup[] = [
  {
    id: "products",
    labelKey: "products",
    icon: Shield,
    items: [
      { href: "/pricing", labelKey: "pricing", icon: CreditCard },
      { href: "/products/ars-api", labelKey: "ars_api", icon: Shield },
      { href: "/products/datasets", labelKey: "datasets", icon: BarChart3 },
      { href: "/products/browser-extension", labelKey: "browser_extension", icon: Eye },
      { href: "/products/eu-ai-act", labelKey: "eu_ai_act", icon: Scale },
      { href: "/enterprise", labelKey: "enterprise", icon: Building },
    ],
  },
  {
    id: "transparency",
    labelKey: "transparency",
    icon: Eye,
    items: [
      { href: "/transparency", labelKey: "transparency", icon: Eye },
      { href: "/velocity", labelKey: "velocity", icon: BarChart3 },
      { href: "/methodology", labelKey: "methodology", icon: Scale },
      { href: "/about/advisory-board", labelKey: "advisory_board", icon: Users },
      { href: "/press-kit", labelKey: "presskit", icon: BookOpen },
      { href: "/blog", labelKey: "blog", icon: BookOpen },
      { href: "/about", labelKey: "about", icon: Users },
    ],
  },
];

export function Nav({
  className,
  user,
}: {
  className?: string;
  user?: {
    role: "user" | "moderator" | "admin" | "ceo";
  } | null;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    if (openGroup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openGroup]);

  React.useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroup(null);
      }
    }
    if (openGroup) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openGroup]);

  const isMod = user && (user.role === "moderator" || user.role === "admin" || user.role === "ceo");

  return (
    <nav
      ref={navRef}
      className={cn("hidden flex-shrink-0 items-center gap-0.5 lg:flex", className)}
    >
      {topLevelItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-visible:ring-brand-500 relative inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 xl:gap-1.5 xl:px-2.5 xl:text-xs",
              isActive ? "text-brand-400" : "text-fg-secondary hover:text-fg-primary",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="border-border-subtle/50 absolute inset-0 rounded-full border bg-white/5 shadow-inner"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="hidden h-3.5 w-3.5 lg:block" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
              {item.badge && (
                <span
                  className={cn(
                    "py-0.2 rounded-full border px-1.5 text-[9px] font-bold tracking-wider uppercase",
                    item.badgeColor || "border-brand-500/30 bg-brand-500/10 text-brand-300",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </span>
          </Link>
        );
      })}

      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        const isGroupOpen = openGroup === group.id;
        const isGroupActive = group.items.some((item) => pathname.startsWith(item.href));

        return (
          <div key={group.id} className="relative">
            <button
              onClick={() => setOpenGroup(isGroupOpen ? null : group.id)}
              className={cn(
                "focus-visible:ring-brand-500 relative inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 xl:gap-1.5 xl:px-2 xl:text-xs 2xl:gap-2 2xl:px-3 2xl:text-sm",
                isGroupActive || isGroupOpen
                  ? "text-brand-400"
                  : "text-fg-secondary hover:text-fg-primary",
              )}
              aria-expanded={isGroupOpen}
              aria-haspopup="true"
            >
              <span className="relative z-10 flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
                <GroupIcon className="hidden h-4 w-4 2xl:block" aria-hidden="true" />
                {t(group.labelKey)}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    isGroupOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isGroupOpen && (
              <div className="border-border-subtle/80 bg-bg-elevated/95 animate-in fade-in slide-in-from-top-1 absolute top-8 left-0 z-50 mt-1.5 w-56 rounded-2xl border p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(168,85,247,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl duration-200">
                {group.items.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = pathname.startsWith(subItem.href);
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setOpenGroup(null)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98]",
                        isSubActive
                          ? "bg-brand-500/15 text-brand-300 shadow-sm"
                          : "text-fg-secondary hover:text-fg-primary hover:bg-white/10",
                      )}
                    >
                      <SubIcon className="h-4 w-4 shrink-0" />
                      {t(subItem.labelKey)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {isMod && (
        <Link
          href="/admin"
          className={cn(
            "focus-visible:ring-brand-500 relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 xl:gap-1.5 xl:px-2.5 xl:text-xs",
            pathname.startsWith("/admin")
              ? "text-brand-400"
              : "text-fg-secondary hover:text-fg-primary",
          )}
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
        >
          {pathname.startsWith("/admin") && (
            <motion.span
              layoutId="nav-active"
              className="border-border-subtle/50 absolute inset-0 rounded-full border bg-white/5 shadow-inner"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            <ShieldCheck className="hidden h-3.5 w-3.5 lg:block" aria-hidden="true" />
            <span>{t("admin")}</span>
          </span>
        </Link>
      )}
    </nav>
  );
}
