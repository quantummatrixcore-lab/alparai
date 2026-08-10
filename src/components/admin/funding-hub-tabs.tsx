"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Users, FileText, UserCog, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function FundingHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      name: t("investors") || "Investors",
      href: "/admin/investors",
      icon: Users,
      isActive: pathname.startsWith("/admin/investors"),
    },
    {
      name: t("grants") || "Grants",
      href: "/admin/grants",
      icon: FileText,
      isActive: pathname.startsWith("/admin/grants"),
    },
    {
      name: t("experts") || "Experts",
      href: "/admin/experts",
      icon: UserCog,
      isActive: pathname.startsWith("/admin/experts"),
    },
    {
      name: t("platforms") || "Platforms",
      href: "/admin/platforms",
      icon: Globe,
      isActive: pathname.startsWith("/admin/platforms"),
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
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                tab.isActive
                  ? "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={cn("h-4 w-4", tab.isActive ? "text-purple-400" : "text-zinc-500")} />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
