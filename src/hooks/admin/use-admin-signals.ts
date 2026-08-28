"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type SlaAlarmRow = Database["public"]["Tables"]["sla_alarms"]["Row"];
export type RatingAlertRow = Database["public"]["Tables"]["rating_alerts"]["Row"];
export type DoraMetricRow = Database["public"]["Tables"]["dora_metrics"]["Row"];
export type RedactionRequestRow = Database["public"]["Tables"]["redaction_requests"]["Row"];

export interface UseAdminSignalsResult {
  alarms: SlaAlarmRow[];
  ratingAlerts: RatingAlertRow[];
  doraMetrics: DoraMetricRow[];
  redactionRequests: RedactionRequestRow[];
  unresolvedAlarmsCount: number;
  pendingRedactionsCount: number;
  loading: boolean;
  error: Error | null;
  resolveAlarm: (id: string) => Promise<{ ok: boolean; error?: string }>;
  processRedaction: (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminSignals(autoSubscribe = true): UseAdminSignalsResult {
  const [alarms, setAlarms] = useState<SlaAlarmRow[]>([]);
  const [ratingAlerts, setRatingAlerts] = useState<RatingAlertRow[]>([]);
  const [doraMetrics, setDoraMetrics] = useState<DoraMetricRow[]>([]);
  const [redactionRequests, setRedactionRequests] = useState<RedactionRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [alarmsRes, ratingRes, doraRes, redactionRes] = await Promise.all([
        supabase.from("sla_alarms").select("*"),
        supabase.from("rating_alerts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("dora_metrics").select("*").order("metric_date", { ascending: false }).limit(10),
        supabase.from("redaction_requests").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      setAlarms(alarmsRes.data || []);
      setRatingAlerts(ratingRes.data || []);
      setDoraMetrics(doraRes.data || []);
      setRedactionRequests(redactionRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch system signals"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useAdminRealtime<SlaAlarmRow>({
    table: "sla_alarms",
    enabled: autoSubscribe,
    onChange: () => fetchSignals(),
  });

  useAdminRealtime<RedactionRequestRow>({
    table: "redaction_requests",
    enabled: autoSubscribe,
    onChange: () => fetchSignals(),
  });

  const resolveAlarm = async (id: string) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("sla_alarms")
        .update({
          resolved: true,
          resolved_at: now,
        })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? { ...a, resolved: true, resolved_at: now } : a))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to resolve alarm" };
    }
  };

  const processRedaction = async (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("redaction_requests")
        .update({
          status,
          reason: reason || null,
          processed_at: now,
        })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setRedactionRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, reason: reason || null, processed_at: now } : r))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to process redaction" };
    }
  };

  return {
    alarms,
    ratingAlerts,
    doraMetrics,
    redactionRequests,
    unresolvedAlarmsCount: alarms.filter((a) => !a.resolved).length,
    pendingRedactionsCount: redactionRequests.filter((r) => r.status === "pending").length,
    loading,
    error,
    resolveAlarm,
    processRedaction,
    refetch: fetchSignals,
  };
}
