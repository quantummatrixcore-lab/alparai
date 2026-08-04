"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Sparkles, Clock, Flame, UserCheck } from "lucide-react";

export type FeedTabType = "for-you" | "latest" | "trending" | "following";

interface FeedTabsProps {
  activeTab: FeedTabType;
  onChange: (tab: FeedTabType) => void;
  isLoggedIn?: boolean;
}

export function FeedTabs({ activeTab, onChange, isLoggedIn = false }: FeedTabsProps) {
  const t = useTranslations("feed");

  const tabs = [
    {
      id: "for-you" as const,
      label: t("feed_tab_for_you"),
      icon: Sparkles,
    },
    {
      id: "latest" as const,
      label: t("feed_tab_latest"),
      icon: Clock,
    },
    {
      id: "trending" as const,
      label: t("feed_tab_trending"),
      icon: Flame,
    },
    {
      id: "following" as const,
      label: t("feed_tab_following"),
      icon: UserCheck,
      disabled: !isLoggedIn,
    },
  ];

  return (
    <div className="mb-6 flex scrollbar-none gap-2 overflow-x-auto border-b border-white/5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.disabled) return null;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all",
              isActive
                ? "border-brand-500 text-brand-400"
                : "text-fg-secondary hover:text-fg-primary border-transparent",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
