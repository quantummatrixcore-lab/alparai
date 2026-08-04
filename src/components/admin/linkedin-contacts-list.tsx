"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";
import { CheckCircle2, MessageSquare, Linkedin, UserPlus, FileText } from "lucide-react";
import { updateLinkedinContactStatus } from "@/actions/admin/linkedin";
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

interface LinkedinContact {
  id: string;
  full_name: string;
  title: string | null;
  company: string | null;
  profile_url: string | null;
  category: string | null;
  status: "to_add" | "added" | "messaged" | "responded";
  priority: number;
  notes: string | null;
  created_at: string;
}

export function LinkedinContactsList({ initialContacts }: { initialContacts: LinkedinContact[] }) {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState<"all" | "to_add" | "added" | "messaged" | "responded">(
    "all",
  );
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (
    id: string,
    status: "to_add" | "added" | "messaged" | "responded",
  ) => {
    startTransition(async () => {
      const result = await updateLinkedinContactStatus({ id, status });
      if (result.success) {
        toast.success(t("status_updated") || "Status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const filtered =
    filter === "all" ? initialContacts : initialContacts.filter((c) => c.status === filter);

  const stats = {
    total: initialContacts.length,
    added: initialContacts.filter(
      (c) => c.status === "added" || c.status === "messaged" || c.status === "responded",
    ).length,
    messaged: initialContacts.filter((c) => c.status === "messaged" || c.status === "responded")
      .length,
    responded: initialContacts.filter((c) => c.status === "responded").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title={t("linkedin_total_targets")} value={stats.total} icon={<UsersIcon />} />
        <MetricCard
          title={t("linkedin_added")}
          value={stats.added}
          icon={<UserPlus className="h-4 w-4 text-emerald-400" />}
        />
        <MetricCard
          title={t("linkedin_messaged")}
          value={stats.messaged}
          icon={<MessageSquare className="h-4 w-4 text-blue-400" />}
        />
        <MetricCard
          title={t("linkedin_responded")}
          value={stats.responded}
          icon={<CheckCircle2 className="h-4 w-4 text-violet-400" />}
        />
      </div>

      {stats.total > 0 && (
        <Card className="border-white/10 bg-black/40 p-4">
          <h4 className="mb-4 text-sm font-semibold text-white">{t("linkedin_pipeline_status")}</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: t("linkedin_status_to_add"),
                    value: initialContacts.filter((c) => c.status === "to_add").length,
                    color: "#94a3b8",
                  },
                  {
                    name: t("linkedin_status_added"),
                    value: initialContacts.filter((c) => c.status === "added").length,
                    color: "#34d399",
                  },
                  {
                    name: t("linkedin_status_messaged"),
                    value: initialContacts.filter((c) => c.status === "messaged").length,
                    color: "#60a5fa",
                  },
                  {
                    name: t("linkedin_status_responded"),
                    value: stats.responded,
                    color: "#a78bfa",
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
                      name: t("linkedin_status_to_add"),
                      value: initialContacts.filter((c) => c.status === "to_add").length,
                      color: "#94a3b8",
                    },
                    {
                      name: t("linkedin_status_added"),
                      value: initialContacts.filter((c) => c.status === "added").length,
                      color: "#34d399",
                    },
                    {
                      name: t("linkedin_status_messaged"),
                      value: initialContacts.filter((c) => c.status === "messaged").length,
                      color: "#60a5fa",
                    },
                    {
                      name: t("linkedin_status_responded"),
                      value: stats.responded,
                      color: "#a78bfa",
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

      <div className="flex space-x-2 border-b border-white/10 pb-2">
        {(["all", "to_add", "added", "messaged", "responded"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab ? "bg-white/10 text-white" : "text-fg-muted hover:text-white"
            }`}
          >
            {tab === "all"
              ? t("linkedin_status_all")
              : tab.charAt(0).toUpperCase() + tab.slice(1).replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-fg-muted rounded-xl border border-white/10 bg-black/20 py-12 text-center">
            {t("linkedin_no_data")}
          </div>
        ) : (
          filtered.map((contact) => (
            <Card
              key={contact.id}
              className="flex flex-col items-start justify-between gap-4 border-white/10 bg-black/40 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{contact.full_name}</h3>
                  <span className="text-fg-muted rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                    {contact.category || t("linkedin_uncategorized")}
                  </span>
                  {contact.priority === 1 && (
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                      P1
                    </span>
                  )}
                </div>
                <p className="text-fg-muted mt-1 text-sm">
                  {contact.title} {contact.company && `${t("linkedin_at")} ${contact.company}`}
                </p>
                {contact.notes && (
                  <p className="text-fg-muted/70 mt-2 flex items-center gap-1 text-xs">
                    <FileText className="h-3 w-3" /> {contact.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {contact.profile_url && (
                  <a
                    href={contact.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-muted rounded-md border border-white/5 bg-white/5 p-2 transition-colors hover:bg-white/10 hover:text-[#0077b5]"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}

                <div className="flex overflow-hidden rounded-md border border-white/10 bg-black/50">
                  <button
                    disabled={isPending || contact.status === "to_add"}
                    onClick={() => handleUpdateStatus(contact.id, "to_add")}
                    className={`px-3 py-1.5 text-xs font-medium ${contact.status === "to_add" ? "bg-white/10 text-white" : "text-fg-muted hover:bg-white/5 hover:text-white"}`}
                  >
                    {t("linkedin_status_to_add")}
                  </button>
                  <button
                    disabled={isPending || contact.status === "added"}
                    onClick={() => handleUpdateStatus(contact.id, "added")}
                    className={`border-l border-white/10 px-3 py-1.5 text-xs font-medium ${contact.status === "added" ? "bg-emerald-500/20 text-emerald-400" : "text-fg-muted hover:bg-white/5 hover:text-white"}`}
                  >
                    {t("linkedin_status_added")}
                  </button>
                  <button
                    disabled={isPending || contact.status === "messaged"}
                    onClick={() => handleUpdateStatus(contact.id, "messaged")}
                    className={`border-l border-white/10 px-3 py-1.5 text-xs font-medium ${contact.status === "messaged" ? "bg-blue-500/20 text-blue-400" : "text-fg-muted hover:bg-white/5 hover:text-white"}`}
                  >
                    {t("linkedin_status_messaged")}
                  </button>
                  <button
                    disabled={isPending || contact.status === "responded"}
                    onClick={() => handleUpdateStatus(contact.id, "responded")}
                    className={`border-l border-white/10 px-3 py-1.5 text-xs font-medium ${contact.status === "responded" ? "bg-violet-500/20 text-violet-400" : "text-fg-muted hover:bg-white/5 hover:text-white"}`}
                  >
                    {t("linkedin_status_responded")}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-sky-400"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
