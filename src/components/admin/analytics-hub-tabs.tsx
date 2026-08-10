"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BrainCircuit, BarChart3, Sparkles } from "lucide-react";

export function AnalyticsHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      name: t("nav_audit_analysis") || "Analysis",
      href: "/admin/analytics-hub/analysis",
      icon: BrainCircuit,
    },
    {
      name: t("nav_kBenchmark") || "K-Benchmark",
      href: "/admin/analytics-hub/k-benchmark",
      icon: BarChart3,
    },
    {
      name: t("nav_expert_analysis") || "Expert Analysis",
      href: "/admin/analytics-hub/expert-analysis",
      icon: Sparkles,
    },
  ];

  return (
    <div className="mb-8 border-b border-white/10">
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
                  : "text-fg-muted border-transparent hover:border-white/20 hover:text-white",
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
