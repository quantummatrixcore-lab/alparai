"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Activity, BarChart3, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      name: t("nav_systemHealth") || "System Health",
      href: "/admin/health",
      icon: Activity,
      isActive:
        pathname.startsWith("/admin/health") ||
        pathname.startsWith("/admin/startup-health") ||
        pathname.startsWith("/admin/crons"),
    },
    {
      name: t("nav_apiManagement") || "API Management",
      href: "/admin/api-management",
      icon: Zap,
      isActive:
        pathname.startsWith("/admin/api-management") ||
        pathname.startsWith("/admin/integrations") ||
        pathname.startsWith("/admin/api-keys"),
    },
    {
      name: t("nav_infra_costs") || "Finance",
      href: "/admin/finance",
      icon: BarChart3,
      isActive:
        pathname.startsWith("/admin/finance") ||
        pathname.startsWith("/admin/billing") ||
        pathname.startsWith("/admin/resources"),
    },
    {
      name: t("nav_settings") || "Configuration",
      href: "/admin/settings",
      icon: Settings,
      isActive:
        pathname.startsWith("/admin/settings") ||
        pathname.startsWith("/admin/feature-flags") ||
        pathname.startsWith("/admin/providers"),
    },
  ];

  return (
    <div className="mb-8 overflow-x-auto pb-2">
      <nav className="flex space-x-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300",
                tab.isActive
                  ? "bg-amber-500/10 text-amber-400 shadow-lg ring-1 shadow-amber-500/5 ring-amber-500/20"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
              )}
            >
              <Icon className={cn("h-4 w-4", tab.isActive ? "text-amber-400" : "text-zinc-500")} />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
