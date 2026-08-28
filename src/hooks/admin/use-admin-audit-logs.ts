"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

export interface UseAdminAuditLogsOptions {
  action?: string;
  entityType?: string;
  actorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  autoSubscribe?: boolean;
}

export interface UseAdminAuditLogsResult {
  logs: AuditLogRow[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
  refetch: () => Promise<void>;
}

export function useAdminAuditLogs({
  action = "all",
  entityType = "all",
  actorId,
  search = "",
  page = 1,
  pageSize = 30,
  autoSubscribe = true,
}: UseAdminAuditLogsOptions = {}): UseAdminAuditLogsResult {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("audit_log")
        .select("*", { count: "exact" });

      if (action !== "all") {
        query = query.ilike("action", "%" + action + "%");
      }

      if (entityType !== "all") {
        query = query.eq("entity_type", entityType);
      }

      if (actorId) {
        query = query.eq("actor_id", actorId);
      }

      if (search.trim()) {
        const term = "%" + search.trim() + "%";
        query = query.or("action.ilike." + term + ",entity_type.ilike." + term + ",entity_id.ilike." + term);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error: fetchError } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch audit logs"));
    } finally {
      setLoading(false);
    }
  }, [action, entityType, actorId, search, page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useAdminRealtime<AuditLogRow>({
    table: "audit_log",
    enabled: autoSubscribe,
    onInsert: (payload) => {
      if (page === 1 && payload.new) {
        setLogs((prev) => [payload.new as AuditLogRow, ...prev.slice(0, pageSize - 1)]);
        setTotalCount((prev) => prev + 1);
      } else {
        fetchLogs();
      }
    },
  });

  return {
    logs,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    refetch: fetchLogs,
  };
}
