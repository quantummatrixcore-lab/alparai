"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  FileText,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Award,
  GraduationCap,
  Scale,
  Eye,
  Shield,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { href: "/leaderboard", labelKey: "leaderboard", icon: BarChart3 },
  { href: "/incidents", labelKey: "incidents", icon: FileText },
  { href: "/ai-act", labelKey: "ai_act", icon: Shield },
  { href: "/academy", labelKey: "academy", icon: GraduationCap },
  { href: "/dilemmas", labelKey: "dilemmas", icon: Scale },
];

const resourcesItems: NavItem[] = [
  { href: "/transparency", labelKey: "transparency", icon: Eye },
  { href: "/challenges", labelKey: "challenges", icon: Award },
  { href: "/blog", labelKey: "blog", icon: BookOpen },
  { href: "/press-kit", labelKey: "presskit", icon: Award },
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
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const isMod = user && (user.role === "moderator" || user.role === "admin" || user.role === "ceo");
  const activeItems = isMod
    ? [...mainNavItems, { href: "/admin", labelKey: "admin", icon: ShieldCheck }]
    : mainNavItems;

  const isDropdownActive = resourcesItems.some((item) => pathname.startsWith(item.href));

  return (
    <nav className={cn("hidden items-center gap-0.5 lg:flex", className)}>
      {activeItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-visible:ring-brand-500 relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 xl:gap-1.5 xl:px-2.5 xl:text-xs",
              isActive ? "text-brand-400" : "text-fg-secondary hover:text-fg-primary",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-full border border-white/5 bg-white/5 shadow-inner"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Icon className="hidden h-3.5 w-3.5 lg:block" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </span>
          </Link>
        );
      })}

      {/* Resources Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            "focus-visible:ring-brand-500 relative inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-2 xl:gap-1.5 xl:px-2 xl:text-xs 2xl:gap-2 2xl:px-3 2xl:text-sm",
            isDropdownActive || dropdownOpen
              ? "text-brand-400"
              : "text-fg-secondary hover:text-fg-primary",
          )}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <span className="relative z-10 flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
            <BookOpen className="hidden h-4 w-4 2xl:block" aria-hidden="true" />
            {t("resources")}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                dropdownOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </span>
        </button>

        {dropdownOpen && (
          <div className="border-border-subtle bg-bg-elevated/95 animate-in fade-in slide-in-from-top-1 absolute top-8 left-0 z-50 mt-1 w-44 rounded-xl border p-1 shadow-2xl backdrop-blur-md duration-200">
            {resourcesItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive = pathname.startsWith(subItem.href);
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={() => setDropdownOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200",
                    isSubActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-fg-secondary hover:text-fg-primary hover:bg-white/5",
                  )}
                >
                  <SubIcon className="h-4 w-4" />
                  {t(subItem.labelKey)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
