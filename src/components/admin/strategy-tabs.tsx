"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Compass,
  FileText,
  Grid2X2,
  Map,
  AlertTriangle,
  Building2,
  Calculator,
} from "lucide-react";

export function StrategyTabs() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const tabs = [
    {
      name: t("strategy_overview") || "Overview",
      href: "/admin/strategy",
      icon: Compass,
      exact: true,
    },
    {
      name: t("nav_masterPlan") || "Master Plan",
      href: "/admin/strategy/master-plan",
      icon: FileText,
      exact: false,
    },
    {
      name: t("strategy_swot") || "SWOT",
      href: "/admin/strategy/swot",
      icon: Grid2X2,
      exact: false,
    },
    {
      name: t("strategy_roadmap") || "Roadmap",
      href: "/admin/strategy/roadmap",
      icon: Map,
      exact: false,
    },
    {
      name: t("strategy_risks") || "Risks",
      href: "/admin/strategy/risks",
      icon: AlertTriangle,
      exact: false,
    },
    {
      name: t("strategy_state_support") || "State Support",
      href: "/admin/strategy/state-support",
      icon: Building2,
      exact: false,
    },
    {
      name: t("strategy_valuation") || "Valuation",
      href: "/admin/strategy/valuation",
      icon: Calculator,
      exact: false,
    },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300",
              isActive
                ? "text-brand-300 bg-brand-500/10 border-brand-500/30 border"
                : "text-fg-secondary hover:text-fg-primary border border-transparent hover:bg-white/5",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="strategy-tab-active"
                className="bg-brand-500/5 pointer-events-none absolute inset-0 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-brand-400" : "text-fg-muted",
              )}
            />
            <span className="relative z-10">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
