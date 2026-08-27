"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Gauge, Zap, Radio, Newspaper } from "lucide-react";

export function MetricsHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      name: t("nav_slo_dashboard") || "SLO",
      href: "/admin/metrics-hub/slo-dashboard",
      icon: Gauge,
    },
    {
      name: t("nav_api_metrics") || "API Metrics",
      href: "/admin/metrics-hub/api-metrics",
      icon: Zap,
    },
    {
      name: t("nav_signals") || "Signals",
      href: "/admin/metrics-hub/signals",
      icon: Radio,
    },
    {
      name: t("nav_ai_pulse") || "AI Pulse",
      href: "/admin/metrics-hub/ai-pulse",
      icon: Newspaper,
    },
  ];

  return (
    <div className="border-border-subtle mb-8 border-b">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                isActive
                  ? "border-brand-500 text-brand-400"
                  : "text-fg-muted hover:border-border-strong border-transparent hover:text-white",
                "group flex items-center border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors",
              )}
            >
              <tab.icon
                className={cn(
                  isActive ? "text-brand-400" : "text-fg-muted group-hover:text-white",
                  "mr-2 h-5 w-5 transition-colors",
                )}
                aria-hidden="true"
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
