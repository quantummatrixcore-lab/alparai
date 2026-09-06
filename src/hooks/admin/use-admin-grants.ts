"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type GrantApplicationRow = Database["public"]["Tables"]["grant_applications"]["Row"];

export interface UseAdminGrantsOptions {
  status?: string;
  category?: string;
  phase?: number;
  autoSubscribe?: boolean;
}

export interface UseAdminGrantsResult {
  applications: GrantApplicationRow[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  metrics: {
    totalApplications: number;
    awardedCount: number;
    pendingReviewCount: number;
    phaseDistribution: Record<number, number>;
  };
  updateGrantStatus: (
    id: string,
    status: string,
    notes?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  createGrant: (
    data: Database["public"]["Tables"]["grant_applications"]["Insert"]
  ) => Promise<{ ok: boolean; error?: string; id?: string }>;
  deleteGrant: (id: string) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminGrants({
  status = "all",
  category = "all",
  phase,
  autoSubscribe = true,
}: UseAdminGrantsOptions = {}): UseAdminGrantsResult {
  const [applications, setApplications] = useState<GrantApplicationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("grant_applications")
        .select("*", { count: "exact" });

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (typeof phase === "number") {
        query = query.eq("phase", phase);
      }

      const { data, count, error: fetchError } = await query.order("created_at", {
        ascending: false,
      });

      if (fetchError) throw new Error(fetchError.message);

      setApplications(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch grant applications"));
    } finally {
      setLoading(false);
    }
  }, [status, category, phase]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  useAdminRealtime<GrantApplicationRow>({
    table: "grant_applications",
    enabled: autoSubscribe,
    onChange: () => fetchGrants(),
  });

  const metrics = useMemo(() => {
    const phaseMap: Record<number, number> = {};
    let awarded = 0;
    let pending = 0;

    for (const app of applications) {
      phaseMap[app.phase] = (phaseMap[app.phase] || 0) + 1;
      if (app.status === "awarded" || app.status === "approved") awarded++;
      if (app.status === "submitted" || app.status === "review") pending++;
    }

    return {
      totalApplications: applications.length,
      awardedCount: awarded,
      pendingReviewCount: pending,
      phaseDistribution: phaseMap,
    };
  }, [applications]);

  const updateGrantStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      const now = new Date().toISOString();
      const payload: Partial<GrantApplicationRow> = {
        status: newStatus,
        notes: notes || null,
      };

      if (newStatus === "awarded" || newStatus === "approved") {
        payload.approved_at = now;
      } else if (newStatus === "completed") {
        payload.completed_at = now;
      }

      const { error: updateError } = await supabase
        .from("grant_applications")
        .update(payload)
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...payload } : app))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to update grant status" };
    }
  };

  const createGrant = async (data: Database["public"]["Tables"]["grant_applications"]["Insert"]) => {
    try {
      const { data: inserted, error: insertError } = await supabase
        .from("grant_applications")
        .insert(data)
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      await fetchGrants();
      return { ok: true, id: inserted?.id };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to create grant application" };
    }
  };

  const deleteGrant = async (id: string) => {
    try {
      const { error: delError } = await supabase
        .from("grant_applications")
        .delete()
        .eq("id", id);

      if (delError) throw new Error(delError.message);

      setApplications((prev) => prev.filter((app) => app.id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to delete grant" };
    }
  };

  return {
    applications,
    totalCount,
    loading,
    error,
    metrics,
    updateGrantStatus,
    createGrant,
    deleteGrant,
    refetch: fetchGrants,
  };
}
