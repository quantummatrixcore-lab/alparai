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
  Sparkles,
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

// Clean top-level core pages (only 3 direct links to prevent bar overflow)
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
];

// Clean categorized dropdowns for secondary features
const navGroups: NavGroup[] = [
  {
    id: "governance",
    labelKey: "transparency",
    icon: ShieldCheck,
    items: [
      { href: "/ai-act", labelKey: "ai_act", icon: ShieldCheck },
      { href: "/academy", labelKey: "academy", icon: GraduationCap },
      { href: "/about/advisory-board", labelKey: "advisory_board", icon: Users },
      { href: "/transparency", labelKey: "transparency", icon: Eye },
      { href: "/methodology", labelKey: "methodology", icon: Scale },
      { href: "/velocity", labelKey: "velocity", icon: BarChart3 },
      { href: "/press-kit", labelKey: "presskit", icon: BookOpen },
    ],
  },
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
      role="navigation"
      aria-label="Main navigation"
      className={cn("hidden flex-shrink-0 items-center gap-1 xl:gap-1.5 lg:flex", className)}
    >
      {topLevelItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-visible:ring-brand-500 relative inline-flex min-h-[36px] flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2",
              isActive ? "text-brand-300" : "text-fg-secondary hover:text-white hover:bg-white/[0.04]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="border-brand-500/30 absolute inset-0 rounded-full border bg-brand-500/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
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
                "focus-visible:ring-brand-500 relative inline-flex min-h-[36px] cursor-pointer items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2",
                isGroupActive || isGroupOpen
                  ? "text-brand-300 bg-brand-500/10"
                  : "text-fg-secondary hover:text-white hover:bg-white/[0.04]",
              )}
              aria-expanded={isGroupOpen}
              aria-haspopup="menu"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <GroupIcon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                <span>{t(group.labelKey)}</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 opacity-60 transition-transform duration-200",
                    isGroupOpen && "rotate-180 text-brand-300 opacity-100",
                  )}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isGroupOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="border-border-subtle/80 bg-bg-secondary/95 animate-in fade-in slide-in-from-top-1 absolute top-full left-0 z-50 mt-2 w-60 rounded-2xl border p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-2xl duration-200"
              >
                {group.items.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = pathname.startsWith(subItem.href);
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      role="menuitem"
                      onClick={() => setOpenGroup(null)}
                      className={cn(
                        "flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]",
                        isSubActive
                          ? "bg-brand-500/20 text-brand-200 font-semibold shadow-sm"
                          : "text-fg-secondary hover:text-white hover:bg-white/[0.06]",
                      )}
                    >
                      <SubIcon className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
                      <span>{t(subItem.labelKey)}</span>
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
            "focus-visible:ring-brand-500 relative inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2",
            pathname.startsWith("/admin")
              ? "text-brand-300"
              : "text-fg-secondary hover:text-white hover:bg-white/[0.04]",
          )}
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
        >
          {pathname.startsWith("/admin") && (
            <motion.span
              layoutId="nav-active"
              className="border-brand-500/30 absolute inset-0 rounded-full border bg-brand-500/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
            <span>{t("admin")}</span>
          </span>
        </Link>
      )}
    </nav>
  );
}
