"use client";

import React, { useState, useEffect } from "react";
import { Award, ShieldAlert, DollarSign, Plus, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

interface BountyRow {
  id: string;
  incident_id: string;
  status: string;
  severity_score: number;
  actual_reward_cents: number;
  estimated_reward_cents: number;
  created_at: string;
}

export default function ChallengesPage() {
  const t = useTranslations("admin.sidebar");
  const [bounties, setBounties] = useState<BountyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBounties() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bug_bounties")
          .select(
            "id, incident_id, status, severity_score, actual_reward_cents, estimated_reward_cents, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data) {
          setBounties(data as BountyRow[]);
        }
      } catch (err) {
        console.error("Error loading bug_bounties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBounties();
  }, []);

  const totalPaidEur = bounties
    .filter((b) => b.status === "paid")
    .reduce((acc, b) => acc + (b.actual_reward_cents || 0) / 100, 0);

  const pendingCount = bounties.filter(
    (b) => b.status === "open" || b.status === "validated",
  ).length;

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              {t("cluster1Title")}
            </span>
            <span className="text-xs font-semibold text-purple-500 dark:text-purple-400">
              RED-TEAMING & BUG BOUNTIES
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            {t("challenges")}
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Live Supabase bug bounty registry and red-team vulnerability disclosures.
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-600 px-3 py-1.5 text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-rose-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">New Bounty Challenge</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Distributed Rewards"
          value={`€${totalPaidEur.toLocaleString()}`}
          subtext="Verified Payouts"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="Pending Triage Reviews"
          value={`${pendingCount} Bounties`}
          subtext="Under SLA Evaluation"
          changeType={pendingCount > 0 ? "alert" : "neutral"}
          icon={ShieldAlert}
        />
        <MetricCard
          label="Registered Researchers"
          value="420+"
          subtext="Global Red-Team Community"
          icon={Award}
        />
      </div>

      {/* Bounties Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Recent Vulnerability Submissions & Bounty Claims
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-[#656d76] dark:text-[#8b949e]">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span>Connecting to Supabase bug_bounties table...</span>
          </div>
        ) : bounties.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center text-[#656d76] dark:text-[#8b949e]">
            <p>No active bug bounties recorded in database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#d0d7de] text-[#656d76] dark:border-[#30363d] dark:text-[#8b949e]">
                  <th className="pb-2">BOUNTY ID</th>
                  <th className="pb-2">INCIDENT ID</th>
                  <th className="pb-2">SEVERITY SCORE</th>
                  <th className="pb-2">REWARD (EUR)</th>
                  <th className="pb-2">DATE</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {bounties.map((b) => (
                  <tr
                    key={b.id}
                    className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <td className="py-3 font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                      {b.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 font-semibold text-purple-500 dark:text-purple-400">
                      {b.incident_id ? `${b.incident_id.slice(0, 8)}...` : "General"}
                    </td>
                    <td className="py-3 text-[#1f2328] dark:text-[#c9d1d9]">
                      Score: {b.severity_score}/100
                    </td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      €
                      {(
                        (b.actual_reward_cents || b.estimated_reward_cents || 0) / 100
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 text-[#656d76] dark:text-[#8b949e]">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                          b.status === "paid"
                            ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                            : "border-amber-800 bg-amber-950/60 text-amber-300"
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
