"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type IncidentRow = Database["public"]["Tables"]["incidents"]["Row"];
export type IncidentStatus = Database["public"]["Enums"]["incident_status"];
export type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];

export interface UseAdminModerationOptions {
  status?: IncidentStatus | "all";
  severity?: IncidentSeverity | "all";
  search?: string;
  page?: number;
  pageSize?: number;
  autoSubscribe?: boolean;
}

export interface UseAdminModerationResult {
  incidents: IncidentRow[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
  refetch: () => Promise<void>;
  approveIncident: (id: string, note?: string) => Promise<{ ok: boolean; error?: string }>;
  rejectIncident: (id: string, note?: string) => Promise<{ ok: boolean; error?: string }>;
  bulkApprove: (ids: string[]) => Promise<{ ok: boolean; error?: string }>;
  bulkReject: (ids: string[], note?: string) => Promise<{ ok: boolean; error?: string }>;
}

export function useAdminModeration({
  status = "pending_review",
  severity = "all",
  search = "",
  page = 1,
  pageSize = 20,
  autoSubscribe = true,
}: UseAdminModerationOptions = {}): UseAdminModerationResult {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from("incidents")
        .select("*", { count: "exact" });

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (severity !== "all") {
        query = query.eq("severity", severity);
      }

      if (search.trim()) {
        const term = "%" + search.trim() + "%";
        query = query.or("title.ilike." + term + ",description.ilike." + term);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error: fetchError } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setIncidents((data as IncidentRow[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch moderation incidents"));
    } finally {
      setLoading(false);
    }
  }, [status, severity, search, page, pageSize]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useAdminRealtime<IncidentRow>({
    table: "incidents",
    enabled: autoSubscribe,
    onChange: () => {
      fetchIncidents();
    },
  });

  const approveIncident = async (id: string, note?: string) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("incidents")
        .update({
          status: "published",
          moderation_note: note || null,
          moderated_at: now,
          published_at: now,
          reviewed_at: now,
        } as Partial<IncidentRow>)
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setIncidents((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "published", moderation_note: note || null, moderated_at: now }
            : item
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Approve failed" };
    }
  };

  const rejectIncident = async (id: string, note?: string) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("incidents")
        .update({
          status: "rejected",
          moderation_note: note || null,
          moderated_at: now,
          reviewed_at: now,
        } as Partial<IncidentRow>)
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setIncidents((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "rejected", moderation_note: note || null, moderated_at: now }
            : item
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Reject failed" };
    }
  };

  const bulkApprove = async (ids: string[]) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("incidents")
        .update({
          status: "published",
          moderated_at: now,
          published_at: now,
          reviewed_at: now,
        } as Partial<IncidentRow>)
        .in("id", ids);

      if (updateError) throw new Error(updateError.message);

      setIncidents((prev) =>
        prev.map((item) =>
          ids.includes(item.id)
            ? { ...item, status: "published", moderated_at: now }
            : item
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Bulk approve failed" };
    }
  };

  const bulkReject = async (ids: string[], note?: string) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("incidents")
        .update({
          status: "rejected",
          moderation_note: note || null,
          moderated_at: now,
          reviewed_at: now,
        } as Partial<IncidentRow>)
        .in("id", ids);

      if (updateError) throw new Error(updateError.message);

      setIncidents((prev) =>
        prev.map((item) =>
          ids.includes(item.id)
            ? { ...item, status: "rejected", moderation_note: note || null, moderated_at: now }
            : item
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Bulk reject failed" };
    }
  };

  return {
    incidents,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    refetch: fetchIncidents,
    approveIncident,
    rejectIncident,
    bulkApprove,
    bulkReject,
  };
}
