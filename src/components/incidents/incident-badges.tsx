"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Database } from "@/types/database";

export type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
export type IncidentStatus = Database["public"]["Enums"]["incident_status"];

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const t = useTranslations("badge.severity");
  const map: Record<
    IncidentSeverity,
    { variant: NonNullable<BadgeProps["variant"]>; key: "low" | "medium" | "high" | "critical" }
  > = {
    low: { variant: "success", key: "low" },
    medium: { variant: "warning", key: "medium" },
    high: { variant: "danger", key: "high" },
    critical: { variant: "danger", key: "critical" },
  };
  const { variant, key } = map[severity] ?? { variant: "muted" as const, key: "low" as const };
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
      variant: NonNullable<BadgeProps["variant"]>;
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
