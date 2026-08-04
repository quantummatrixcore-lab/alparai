"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";
import { ExternalLink, CheckCircle2, User, Globe, FileText } from "lucide-react";
import { updatePlatformStatus } from "@/actions/admin/platforms";
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

interface PlatformSignup {
  id: string;
  platform_name: string;
  url: string | null;
  category: string | null;
  status: "not_started" | "account_created" | "profile_complete" | "active";
  notes: string | null;
  created_at: string;
}

export function PlatformsList({ initialPlatforms }: { initialPlatforms: PlatformSignup[] }) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (id: string, status: PlatformSignup["status"]) => {
    startTransition(async () => {
      const result = await updatePlatformStatus({ id, status });
      if (result.success) {
        toast.success(t("status_updated") || "Status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const filtered =
    filter === "all" ? initialPlatforms : initialPlatforms.filter((p) => p.status === filter);

  const stats = {
    total: initialPlatforms.length,
    active: initialPlatforms.filter((p) => p.status === "active").length,
    in_progress: initialPlatforms.filter(
      (p) => p.status === "account_created" || p.status === "profile_complete",
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t("platforms_total")}
          value={stats.total}
          icon={<Globe className="h-4 w-4 text-pink-400" />}
        />
        <MetricCard
          title={t("platforms_in_progress")}
          value={stats.in_progress}
          icon={<User className="h-4 w-4 text-amber-400" />}
        />
        <MetricCard
          title={t("platforms_active_completed")}
          value={stats.active}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        />
      </div>

      {stats.total > 0 && (
        <Card className="border-white/10 bg-black/40 p-4">
          <h4 className="mb-4 text-sm font-semibold text-white">
            {t("platforms_pipeline_status")}
          </h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: t("platforms_status_not_started"),
                    value: initialPlatforms.filter((p) => p.status === "not_started").length,
                    color: "#94a3b8",
                  },
                  {
                    name: t("platforms_status_account_created"),
                    value: initialPlatforms.filter((p) => p.status === "account_created").length,
                    color: "#fbbf24",
                  },
                  {
                    name: t("platforms_status_profile_complete"),
                    value: initialPlatforms.filter((p) => p.status === "profile_complete").length,
                    color: "#60a5fa",
                  },
                  {
                    name: t("platforms_status_active"),
                    value: initialPlatforms.filter((p) => p.status === "active").length,
                    color: "#34d399",
                  },
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
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                  {[
                    {
                      name: t("platforms_status_not_started"),
                      value: initialPlatforms.filter((p) => p.status === "not_started").length,
                      color: "#94a3b8",
                    },
                    {
                      name: t("platforms_status_account_created"),
                      value: initialPlatforms.filter((p) => p.status === "account_created").length,
                      color: "#fbbf24",
                    },
                    {
                      name: t("platforms_status_profile_complete"),
                      value: initialPlatforms.filter((p) => p.status === "profile_complete").length,
                      color: "#60a5fa",
                    },
                    {
                      name: t("platforms_status_active"),
                      value: initialPlatforms.filter((p) => p.status === "active").length,
                      color: "#34d399",
                    },
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
        {(["all", "not_started", "account_created", "profile_complete", "active"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
              }`}
            >
              {tab === "all"
                ? t("platforms_status_all")
                : tab
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
            </button>
          ),
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-fg-muted rounded-xl border border-white/10 bg-black/20 py-12 text-center">
            {t("platforms_no_data")}
          </div>
        ) : (
          filtered.map((platform) => (
            <Card
              key={platform.id}
              className="flex flex-col items-start justify-between gap-4 border-white/10 bg-black/40 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{platform.platform_name}</h3>
                  {platform.category && (
                    <span className="text-fg-muted rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      {platform.category}
                    </span>
                  )}
                </div>
                {platform.notes && (
                  <p className="text-fg-muted/70 mt-2 flex items-center gap-1 text-xs">
                    <FileText className="h-3 w-3" /> {platform.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {platform.url && (
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-muted rounded-md border border-white/5 bg-white/5 p-2 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <div className="flex overflow-hidden rounded-md border border-white/10 bg-black/50">
                  <select
                    disabled={isPending}
                    value={platform.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => handleUpdateStatus(platform.id, e.target.value as any)}
                    className="cursor-pointer bg-transparent px-3 py-1.5 text-sm text-white outline-none hover:bg-white/5"
                  >
                    <option value="not_started">{t("platforms_status_not_started")}</option>
                    <option value="account_created">{t("platforms_status_account_created")}</option>
                    <option value="profile_complete">
                      {t("platforms_status_profile_complete")}
                    </option>
                    <option value="active">{t("platforms_status_active")}</option>
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
