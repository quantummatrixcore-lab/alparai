"use client";

import { useState, useTransition, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MetricWidget } from "@/components/ui/metric-widget";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import {
  Check,
  X,
  Eye,
  MessageSquare,
  Code,
  Cpu,
  Inbox,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { moderateIncident } from "@/actions/admin";
import { autoModerateIncidentAction } from "@/actions/autopilot-moderate";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { IncidentListItem } from "@/types";

const severityOptions: SegmentedOption[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ModerationQueue({ incidents }: { incidents: IncidentListItem[] }) {
  const t = useTranslations("admin");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const criticalCount = useMemo(
    () => incidents.filter((i) => i.severity === "critical").length,
    [incidents],
  );
  const highCount = useMemo(
    () => incidents.filter((i) => i.severity === "high").length,
    [incidents],
  );

  const filtered = useMemo(
    () =>
      filterSeverity === "all" ? incidents : incidents.filter((i) => i.severity === filterSeverity),
    [incidents, filterSeverity],
  );

  if (incidents.length === 0) {
    return (
      <div className="border-border-subtle bg-bg-secondary/30 rounded-2xl border px-6 py-16 text-center backdrop-blur-sm">
        <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="text-md mb-2 font-bold text-white">
          {t("queueEmptyTitle", { defaultValue: "Queue is Empty!" })}
        </h3>
        <p className="text-fg-secondary mx-auto mb-6 max-w-sm text-sm">
          {t("queueEmptyDesc", {
            defaultValue: "Great job! All reported AI incidents have been moderated and processed.",
          })}
        </p>
        <Link href="/admin/strategy">
          <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
            {t("go_to_strategy_board")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricWidget
          icon={Inbox}
          label={t("total_pending")}
          value={incidents.length}
          trend={criticalCount > 0 ? "up" : "neutral"}
          trendValue={criticalCount > 0 ? `${criticalCount} critical` : "0 critical"}
        />
        <MetricWidget
          icon={AlertTriangle}
          label={t("high_critical")}
          value={criticalCount + highCount}
          trend={criticalCount + highCount > 0 ? "down" : "neutral"}
          trendValue={`${highCount} high`}
        />
        <MetricWidget
          icon={ShieldCheck}
          label={t("moderated_today")}
          value={incidents.length - filtered.length}
          trend="neutral"
          trendValue="pending"
        />
      </div>

      <SegmentedControl
        options={severityOptions}
        value={filterSeverity}
        onChange={setFilterSeverity}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((inc) => (
          <ModerationCard key={inc.id} incident={inc} />
        ))}
      </div>
    </div>
  );
}

function ModerationCard({ incident }: { incident: IncidentListItem }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [rerunPending, startRerun] = useTransition();

  const decide = (decision: "approve" | "reject") => {
    start(async () => {
      const res = await moderateIncident({
        incidentId: incident.id,
        decision,
        moderationNote: note || undefined,
      });
      if (res.ok) {
        toast.success(decision === "approve" ? t("approve") + " ✓" : t("reject") + " ✓");
      } else {
        toast.error(res.error ?? tCommon("loading"));
      }
    });
  };

  const handleRerun = () => {
    startRerun(async () => {
      const res = await autoModerateIncidentAction(incident.id);
      if (res.ok) {
        toast.success("Autopilot re-run triggered successfully.");
      } else {
        toast.error("Failed to re-run autopilot.");
      }
    });
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <Card className="group border-border-subtle bg-bg-secondary/40 hover:border-brand-500/40 relative flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(168,85,247,0.1)]">
      {/* Visual Accent glow line */}
      <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 opacity-20 transition-opacity duration-300 group-hover:opacity-100" />

      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant={getSeverityBadgeVariant(incident.severity)} dot>
                {incident.severity}
              </Badge>
              <Badge variant="muted" className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-cyan-400" />
                {incident.provider_name}
              </Badge>
              {incident.processing_stage === "failed" && (
                <Badge variant="danger">{t("failed")}</Badge>
              )}
            </div>
            <span className="text-fg-muted font-mono text-[10px] tracking-wider uppercase">
              {formatRelativeTime(new Date(incident.created_at), locale)}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <div className="mb-2 flex items-start gap-2">
              <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-400 uppercase">
                {incident.category}
              </span>
            </div>
            <Link href={`/incidents/${incident.id}`} className="group/link block">
              <h3 className="text-fg-primary group-hover/link:text-brand-300 text-base leading-snug font-bold transition-colors">
                {incident.title_masked}
              </h3>
              <p className="text-fg-secondary mt-2 line-clamp-3 text-xs leading-relaxed">
                {incident.description_masked}
              </p>
            </Link>
          </div>

          {/* AI Metrics quick summary mock (Ethics & Consensus) */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-neutral-950/40 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-fg-muted">{t("ethics_score")}</span>
              <span className="font-mono font-bold text-emerald-400">92%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-fg-muted">{t("consensus_strength")}</span>
              <span className="font-mono font-bold text-cyan-400">{t("high")}</span>
            </div>
          </div>

          {/* Action Note Area */}
          {showNote && (
            <div className="animate-in fade-in slide-in-from-top-2 pt-2 duration-200">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("moderationNotePlaceholder", {
                  defaultValue: "Provide a moderation explanation note...",
                })}
                rows={2}
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
          <div className="flex flex-1 gap-2">
            <Button
              size="sm"
              variant="success"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              isLoading={pending}
              onClick={() => decide("approve")}
              className="flex-1 text-xs"
            >
              {t("approve")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<X className="h-3.5 w-3.5" />}
              isLoading={pending}
              onClick={() => decide("reject")}
              className="flex-1 text-xs"
            >
              {t("reject")}
            </Button>
          </div>

          <div className="mt-2 flex w-full justify-between gap-2">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
              onClick={() => setShowNote((v) => !v)}
              className="text-fg-muted hover:text-white"
            >
              {showNote ? t("hideNote") : t("addNote")}
            </Button>
            <div className="flex gap-1">
              {incident.processing_stage === "failed" && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Cpu className="h-3.5 w-3.5" />}
                  isLoading={rerunPending}
                  onClick={handleRerun}
                  className="text-xs"
                >
                  {t("rerun_autopilot", { defaultValue: "Re-run Autopilot" })}
                </Button>
              )}
              <Link href={`/incidents/${incident.id}`}>
                <Button size="sm" variant="outline" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                  {t("view", { defaultValue: "View" })}
                </Button>
              </Link>
              <Link href={`/incidents/${incident.id}/embed`} target="_blank">
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Code className="h-3.5 w-3.5" />}
                  className="text-fg-muted hover:text-white"
                />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
