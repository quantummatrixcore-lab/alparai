"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";
import { ExternalLink, CheckCircle2, DollarSign, Building2, Send, FileText } from "lucide-react";
import { updateGrantStatus, markGrantSubmitted } from "@/actions/admin/grants";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface GrantApplication {
  id: string;
  program_name: string;
  funding_amount: string | null;
  apply_url: string | null;
  category: string | null;
  phase: number;
  status:
    | "not_started"
    | "drafting"
    | "submitted_pending_review"
    | "approved"
    | "rejected"
    | "accepted_by_program";
  notes: string | null;
  created_at: string;
}

export function GrantsList({
  initialGrants,
  userRole,
}: {
  initialGrants: GrantApplication[];
  userRole?: string;
}) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const isAdmin = userRole === "admin" || userRole === "ceo";

  const handleMarkSubmitted = (id: string) => {
    startTransition(async () => {
      const result = await markGrantSubmitted(id);
      if (result.success) {
        toast.success(t("status_updated") || "Status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleUpdateStatus = (id: string, status: GrantApplication["status"], phase: number) => {
    startTransition(async () => {
      const result = await updateGrantStatus({ id, status, phase });
      if (result.success) {
        toast.success(t("status_updated") || "Status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const filtered =
    filter === "all" ? initialGrants : initialGrants.filter((g) => g.status === filter);

  const stats = {
    total: initialGrants.length,
    drafting: initialGrants.filter((g) => g.status === "drafting").length,
    submitted: initialGrants.filter((g) => g.status === "submitted_pending_review").length,
    approved: initialGrants.filter(
      (g) => g.status === "approved" || g.status === "accepted_by_program",
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title={t("grants_total")}
          value={stats.total}
          icon={<Building2 className="h-4 w-4 text-sky-400" />}
        />
        <MetricCard
          title={t("grants_drafting")}
          value={stats.drafting}
          icon={<FileText className="h-4 w-4 text-amber-400" />}
        />
        <MetricCard
          title={t("grants_submitted")}
          value={stats.submitted}
          icon={<Send className="h-4 w-4 text-blue-400" />}
        />
        <MetricCard
          title={t("grants_approved")}
          value={stats.approved}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        />
      </div>

      {stats.total > 0 && (
        <Card className="border-white/10 bg-black/40 p-4">
          <h4 className="mb-4 text-sm font-semibold text-white">{t("grants_pipeline_status")}</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: t("grants_status_drafting"), value: stats.drafting, color: "#fbbf24" },
                  {
                    name: t("grants_status_submitted_pending_review"),
                    value: stats.submitted,
                    color: "#60a5fa",
                  },
                  { name: t("grants_status_approved"), value: stats.approved, color: "#34d399" },
                ]}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    background: "#0f172a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "11px" }}
                  labelStyle={{ display: "none" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {[
                    { name: t("grants_status_drafting"), value: stats.drafting, color: "#fbbf24" },
                    {
                      name: t("grants_status_submitted_pending_review"),
                      value: stats.submitted,
                      color: "#60a5fa",
                    },
                    { name: t("grants_status_approved"), value: stats.approved, color: "#34d399" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="flex space-x-2 overflow-x-auto border-b border-white/10 pb-2">
        {(
          [
            "all",
            "not_started",
            "drafting",
            "submitted_pending_review",
            "approved",
            "rejected",
            "accepted_by_program",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
            }`}
          >
            {tab === "all"
              ? t("grants_status_all")
              : tab
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-fg-muted rounded-xl border border-white/10 bg-black/20 py-12 text-center">
            {t("grants_no_data")}
          </div>
        ) : (
          filtered.map((grant) => (
            <Card
              key={grant.id}
              className="flex flex-col items-start justify-between gap-4 border-white/10 bg-black/40 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{grant.program_name}</h3>
                  <span className="text-fg-muted rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                    {t("grants_phase")} {grant.phase}
                  </span>
                  {grant.funding_amount && (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      <DollarSign className="h-3 w-3" /> {grant.funding_amount}
                    </span>
                  )}
                </div>
                <p className="text-fg-muted mt-1 text-sm">
                  {grant.category || t("grants_general")}
                </p>
                {grant.notes && (
                  <p className="text-fg-muted/70 mt-2 flex items-center gap-1 text-xs">
                    <FileText className="h-3 w-3" /> {grant.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {grant.apply_url && (
                  <a
                    href={grant.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-muted rounded-md border border-white/5 bg-white/5 p-2 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                {(grant.status === "not_started" || grant.status === "drafting") && (
                  <button
                    disabled={isPending}
                    onClick={() => handleMarkSubmitted(grant.id)}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("grants_mark_submitted")}
                  </button>
                )}

                <div className="flex overflow-hidden rounded-md border border-white/10 bg-black/50">
                  <select
                    disabled={isPending}
                    value={grant.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        grant.id,
                        e.target.value as GrantApplication["status"],
                        grant.phase,
                      )
                    }
                    className="cursor-pointer bg-transparent px-3 py-1.5 text-sm text-white outline-none hover:bg-white/5"
                  >
                    <option value="not_started">{t("grants_status_not_started")}</option>
                    <option value="drafting">{t("grants_status_drafting")}</option>
                    <option value="submitted_pending_review">
                      {t("grants_status_submitted_pending_review")}
                    </option>
                    <option value="approved" disabled={!isAdmin}>
                      {t("grants_status_approved")} {!isAdmin ? t("grants_admin_only") : ""}
                    </option>
                    <option value="rejected" disabled={!isAdmin}>
                      {t("grants_status_rejected")} {!isAdmin ? t("grants_admin_only") : ""}
                    </option>
                    <option value="accepted_by_program" disabled={!isAdmin}>
                      {t("grants_status_accepted_by_program")}{" "}
                      {!isAdmin ? t("grants_admin_only") : ""}
                    </option>
                  </select>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
