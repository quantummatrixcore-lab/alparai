"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle, Megaphone, Search, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      name: t("social_management") || "Social",
      href: "/admin/social",
      icon: MessageCircle,
      isActive: pathname.startsWith("/admin/social"),
    },
    {
      name: t("nav_linkedin") || "LinkedIn",
      href: "/admin/linkedin",
      icon: Users,
      isActive: pathname.startsWith("/admin/linkedin"),
    },
    {
      name: t("nav_email_outreach") || "Outreach",
      href: "/admin/outreach",
      icon: Mail,
      isActive: pathname.startsWith("/admin/outreach"),
    },
    {
      name: t("marketing") || "Marketing",
      href: "/admin/marketing",
      icon: Megaphone,
      isActive: pathname.startsWith("/admin/marketing"),
    },
    {
      name: t("seo") || "SEO",
      href: "/admin/seo-performance",
      icon: Search,
      isActive: pathname.startsWith("/admin/seo-performance"),
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
                  ? "bg-success-500/10 text-success-400 ring-success-500/20 ring-1"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon
                className={cn("h-4 w-4", tab.isActive ? "text-success-400" : "text-fg-disabled")}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
