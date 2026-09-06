"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type DsarRequestRow = Database["public"]["Tables"]["dsar_requests"]["Row"];
export type ConsentLogRow = Database["public"]["Tables"]["consent_log"]["Row"];

export interface UseAdminDsarOptions {
  status?: string;
  autoSubscribe?: boolean;
}

export interface UseAdminDsarResult {
  requests: DsarRequestRow[];
  consentLogs: ConsentLogRow[];
  pendingCount: number;
  loading: boolean;
  error: Error | null;
  updateDsarStatus: (id: string, status: string, dueDate?: string) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminDsar({
  status = "all",
  autoSubscribe = true,
}: UseAdminDsarOptions = {}): UseAdminDsarResult {
  const [requests, setRequests] = useState<DsarRequestRow[]>([]);
  const [consentLogs, setConsentLogs] = useState<ConsentLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDsar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("dsar_requests").select("*");
      if (status !== "all") {
        query = query.eq("status", status);
      }

      const [requestsRes, consentRes] = await Promise.all([
        query.order("created_at", { ascending: false }),
        supabase.from("consent_log").select("*").order("created_at", { ascending: false }).limit(25),
      ]);

      if (requestsRes.error) throw new Error(requestsRes.error.message);

      setRequests(requestsRes.data || []);
      setConsentLogs(consentRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch DSAR compliance requests"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchDsar();
  }, [fetchDsar]);

  useAdminRealtime<DsarRequestRow>({
    table: "dsar_requests",
    enabled: autoSubscribe,
    onChange: () => fetchDsar(),
  });

  const updateDsarStatus = async (id: string, newStatus: string, dueDate?: string) => {
    try {
      const payload: Partial<DsarRequestRow> = { status: newStatus };
      if (dueDate) payload.due_date = dueDate;

      const { error: updateError } = await supabase
        .from("dsar_requests")
        .update(payload)
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...payload } : r))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to update DSAR status" };
    }
  };

  return {
    requests,
    consentLogs,
    pendingCount: requests.filter((r) => r.status === "pending" || r.status === "in_progress").length,
    loading,
    error,
    updateDsarStatus,
    refetch: fetchDsar,
  };
}
