"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, Clock, Mail, ShieldCheck, Zap } from "lucide-react";
import { getOutreachStats, processOutreachQueueAction } from "@/actions/admin/outreach";
import { toast } from "sonner";

export function OutreachAutopilot() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    sent: 0,
    failed: 0,
    limit: 50,
  });

  const loadStats = async () => {
    try {
      const data = await getOutreachStats();
      setStats(data);
    } catch {
      // Keep initial stats
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await processOutreachQueueAction();
      if (res?.success && "sent" in res) {
        toast.success(`Processed ${res.sent ?? 0} outreach items.`);
      } else {
        toast.info("Outreach queue processed.");
      }
      await loadStats();
    } catch {
      toast.error("Failed to execute outreach campaign.");
    } finally {
      setIsExecuting(false);
    }
  };

  const percentage = Math.min(
    100,
    Math.round(((stats.sent + stats.approved) / (stats.limit || 50)) * 100),
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-border-subtle rounded-2xl border bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="h-4 w-4" />
            <p className="text-xs font-semibold">Pending</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="border-border-subtle rounded-2xl border bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-xs font-semibold">Approved</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="border-border-subtle rounded-2xl border bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-cyan-400">
            <Send className="h-4 w-4" />
            <p className="text-xs font-semibold">Sent (24h)</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{stats.sent}</p>
        </div>
        <div className="border-border-subtle relative overflow-hidden rounded-2xl border bg-white/[0.03] p-4">
          <div
            className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="h-4 w-4" />
            <p className="text-xs font-semibold">Limit Usage</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {stats.sent + stats.approved} / {stats.limit}
          </p>
        </div>
      </div>

      {/* Outbound Guardian & Action */}
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Outbound Guardian: ACTIVE</h4>
            <p className="text-xs text-zinc-400">
              Anti-leak scanning is enabled. All emails are verified against tone and context rules
              before execution.
            </p>
          </div>
        </div>
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:hover:bg-indigo-500"
        >
          <Mail className={`h-4 w-4 ${isExecuting ? "animate-bounce" : ""}`} />
          {isExecuting ? "Executing Campaign..." : "Execute Campaign"}
        </button>
      </div>
    </div>
  );
}
