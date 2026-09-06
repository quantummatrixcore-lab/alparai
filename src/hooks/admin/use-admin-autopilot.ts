"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type AutopilotRunRow = Database["public"]["Tables"]["autopilot_runs"]["Row"];
export type WorkerConfigRow = Database["public"]["Tables"]["autopilot_worker_config"]["Row"];
export type CrossAuditRunRow = Database["public"]["Tables"]["cross_audit_runs"]["Row"];

export interface UseAdminAutopilotOptions {
  status?: string;
  action?: string;
  page?: number;
  pageSize?: number;
  autoSubscribe?: boolean;
}

export interface UseAdminAutopilotResult {
  runs: AutopilotRunRow[];
  workers: WorkerConfigRow[];
  crossAudits: CrossAuditRunRow[];
  totalRunsCount: number;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: {
    totalCostCents: number;
    avgDurationMs: number;
    totalTokens: number;
    successRate: number;
  };
  toggleWorker: (workerName: string, enabled: boolean) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminAutopilot({
  status = "all",
  action = "all",
  page = 1,
  pageSize = 25,
  autoSubscribe = true,
}: UseAdminAutopilotOptions = {}): UseAdminAutopilotResult {
  const [runs, setRuns] = useState<AutopilotRunRow[]>([]);
  const [workers, setWorkers] = useState<WorkerConfigRow[]>([]);
  const [crossAudits, setCrossAudits] = useState<CrossAuditRunRow[]>([]);
  const [totalRunsCount, setTotalRunsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let runsQuery = supabase
        .from("autopilot_runs")
        .select("*", { count: "exact" });

      if (status !== "all") {
        runsQuery = runsQuery.eq("status", status);
      }

      if (action !== "all") {
        runsQuery = runsQuery.eq("action", action);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const [runsRes, workersRes, crossRes] = await Promise.all([
        runsQuery.order("created_at", { ascending: false }).range(from, to),
        supabase.from("autopilot_worker_config").select("*").order("worker_name"),
        supabase.from("cross_audit_runs").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      if (runsRes.error) throw new Error(runsRes.error.message);

      setRuns(runsRes.data || []);
      setTotalRunsCount(runsRes.count || 0);
      setWorkers(workersRes.data || []);
      setCrossAudits(crossRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch autopilot data"));
    } finally {
      setLoading(false);
    }
  }, [status, action, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useAdminRealtime<AutopilotRunRow>({
    table: "autopilot_runs",
    enabled: autoSubscribe,
    onChange: () => fetchData(),
  });

  useAdminRealtime<WorkerConfigRow>({
    table: "autopilot_worker_config",
    enabled: autoSubscribe,
    onChange: () => fetchData(),
  });

  const metrics = useMemo(() => {
    if (!runs.length) {
      return { totalCostCents: 0, avgDurationMs: 0, totalTokens: 0, successRate: 100 };
    }

    let totalCost = 0;
    let totalDuration = 0;
    let durationCount = 0;
    let totalTokens = 0;
    let successCount = 0;

    for (const run of runs) {
      if (run.cost_cents) totalCost += run.cost_cents;
      if (run.duration_ms) {
        totalDuration += run.duration_ms;
        durationCount++;
      }
      if (run.token_count) totalTokens += run.token_count;
      if (run.status === "completed" || run.status === "success") successCount++;
    }

    return {
      totalCostCents: totalCost,
      avgDurationMs: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
      totalTokens,
      successRate: Math.round((successCount / runs.length) * 100),
    };
  }, [runs]);

  const toggleWorker = async (workerName: string, enabled: boolean) => {
    try {
      const now = new Date().toISOString();
      const { error: upsertError } = await supabase
        .from("autopilot_worker_config")
        .upsert({
          worker_name: workerName,
          enabled,
          updated_at: now,
        });

      if (upsertError) throw new Error(upsertError.message);

      setWorkers((prev) =>
        prev.map((w) => (w.worker_name === workerName ? { ...w, enabled, updated_at: now } : w))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to update worker config" };
    }
  };

  return {
    runs,
    workers,
    crossAudits,
    totalRunsCount,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil(totalRunsCount / pageSize) || 1,
    metrics,
    toggleWorker,
    refetch: fetchData,
  };
}
