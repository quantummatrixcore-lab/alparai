"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Users, Lock, FileText, Eraser, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function GovernanceHubTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const tabs = [
    {
      href: "/admin/users",
      label: t("users"),
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
    {
      href: "/admin/dsar",
      label: t("nav_dsar"),
      icon: Lock,
      active: pathname.startsWith("/admin/dsar"),
    },
    {
      href: "/admin/audit",
      label: t("audit_log"),
      icon: FileText,
      active: pathname.startsWith("/admin/audit"),
    },
    {
      href: "/admin/redaction-queue",
      label: t("nav_redaction_queue"),
      icon: Eraser,
      active: pathname.startsWith("/admin/redaction-queue"),
    },
    {
      href: "/admin/advisory-board",
      label: t("nav_advisoryBoard"),
      icon: Award,
      active: pathname.startsWith("/admin/advisory-board"),
    },
  ];

  return (
    <div className="border-border-subtle mb-8 border-b">
      <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all",
                tab.active
                  ? "border-success-500 text-success-400"
                  : "text-fg-muted hover:border-border-strong hover:text-fg-secondary border-transparent",
              )}
              aria-current={tab.active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  tab.active ? "text-success-500" : "text-fg-disabled group-hover:text-fg-muted",
                )}
                aria-hidden="true"
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
