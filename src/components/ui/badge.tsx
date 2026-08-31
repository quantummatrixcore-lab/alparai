"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];

type BadgeVariant =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "muted"
  | "glass"
  | "accent";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-fg-primary border border-border-subtle shadow-sm",
  brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  success: "bg-success-500/15 text-success-400 border border-success-500/30 shadow-[0_0_12px_rgba(39,174,96,0.15)]",
  warning: "bg-warning-500/15 text-warning-400 border border-warning-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
  danger: "bg-danger-500/15 text-danger-400 border border-danger-500/30 shadow-[0_0_12px_rgba(230,57,70,0.15)]",
  outline: "bg-transparent text-fg-secondary border border-border-strong",
  muted: "bg-bg-tertiary/70 text-fg-muted border border-transparent",
  glass: "bg-white/5 text-fg-primary border border-border-subtle backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
  accent: "bg-accent-500/15 text-accent-300 border border-accent-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-200",
        "tracking-wider uppercase select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" && "bg-success-500 shadow-[0_0_6px_rgba(39,174,96,0.8)]",
            variant === "danger" && "bg-danger-500 shadow-[0_0_6px_rgba(230,57,70,0.8)]",
            variant === "warning" && "bg-warning-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
            variant === "brand" && "bg-brand-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]",
            variant === "accent" && "bg-accent-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]",
            (variant === "default" || variant === "muted" || variant === "outline" || variant === "glass") &&
              "bg-fg-muted",
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const t = useTranslations("badge.severity");
  const map: Record<
    IncidentSeverity,
    { variant: BadgeVariant; key: "low" | "medium" | "high" | "critical" }
  > = {
    low: { variant: "success", key: "low" },
    medium: { variant: "warning", key: "medium" },
    high: { variant: "danger", key: "high" },
    critical: { variant: "danger", key: "critical" },
  };
  const { variant, key } = map[severity];
  return (
    <Badge variant={variant} dot>
      {t(key)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const t = useTranslations("badge.status");
  const map: Record<
    string,
    {
      variant: BadgeVariant;
      key: "pending_review" | "published" | "rejected" | "archived" | "takedown";
    }
  > = {
    pending_review: { variant: "warning", key: "pending_review" },
    published: { variant: "success", key: "published" },
    rejected: { variant: "muted", key: "rejected" },
    archived: { variant: "muted", key: "archived" },
    takedown: { variant: "danger", key: "takedown" },
  };
  const entry = map[status] ?? { variant: "muted" as const, key: null };
  return <Badge variant={entry.variant}>{entry.key ? t(entry.key) : status}</Badge>;
}
