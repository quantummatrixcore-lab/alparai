"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { IconWeight } from "@phosphor-icons/react";
import { Warning, Clock, Trash, EyeSlash, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

interface StatusBannerProps {
  status: string;
  className?: string;
}

type IconComponent = ComponentType<{ weight?: IconWeight; className?: string }>;

interface StatusConfig {
  icon: IconComponent;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_review: {
    icon: Clock as IconComponent,
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-400",
    iconClass: "text-amber-400",
  },
  draft: {
    icon: EyeSlash as IconComponent,
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/30",
    textClass: "text-zinc-400",
    iconClass: "text-zinc-400",
  },
  takedown: {
    icon: Trash as IconComponent,
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    textClass: "text-rose-400",
    iconClass: "text-rose-400",
  },
  hard_deleted: {
    icon: Trash as IconComponent,
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    textClass: "text-rose-400",
    iconClass: "text-rose-400",
  },
  archived: {
    icon: Warning as IconComponent,
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-400",
    iconClass: "text-purple-400",
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  icon: EyeSlash as IconComponent,
  bgClass: "bg-zinc-500/10",
  borderClass: "border-zinc-500/30",
  textClass: "text-zinc-400",
  iconClass: "text-zinc-400",
};

export function StatusBanner({ status, className }: StatusBannerProps) {
  const t = useTranslations("admin");
  if (status === "published") return null;

  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  const labelMap: Record<string, string> = {
    pending_review: t("status_pending_review") || "Pending Review",
    draft: t("status_draft") || "Draft",
    takedown: t("status_takedown") || "Taken Down",
    hard_deleted: t("status_hard_deleted") || "Deleted",
    archived: t("status_archived") || "Archived",
  };

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-xl border px-4 py-3",
        config.bgClass,
        config.borderClass,
        className,
      )}
    >
      <Icon weight="duotone" className={cn("h-5 w-5 shrink-0", config.iconClass)} />
      <div className="flex-1">
        <span className={cn("text-sm font-bold", config.textClass)}>
          {labelMap[status] ?? status}
        </span>
        <span className="text-fg-muted ml-2 text-xs">
          — {t("status_admin_only_view") || "This status is only visible to admins and moderators."}
        </span>
      </div>
      <ShieldCheck weight="duotone" className="text-fg-muted h-4 w-4" />
    </div>
  );
}
