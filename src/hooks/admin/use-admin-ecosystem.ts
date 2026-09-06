"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type EcosystemNewsRow = Database["public"]["Tables"]["ecosystem_news"]["Row"];
export type AdvisoryBoardMemberRow = Database["public"]["Tables"]["advisory_board_members"]["Row"];
export type FellowshipApplicationRow = Database["public"]["Tables"]["fellowship_applications"]["Row"];
export type RevenueMetricRow = Database["public"]["Tables"]["finance_revenue_metrics"]["Row"];

export interface UseAdminEcosystemResult {
  news: EcosystemNewsRow[];
  advisoryBoard: AdvisoryBoardMemberRow[];
  fellowshipApplications: FellowshipApplicationRow[];
  revenueMetrics: RevenueMetricRow[];
  loading: boolean;
  error: Error | null;
  toggleNewsActive: (id: string, isActive: boolean) => Promise<{ ok: boolean; error?: string }>;
  updateFellowshipStatus: (id: string, status: string) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminEcosystem(autoSubscribe = true): UseAdminEcosystemResult {
  const [news, setNews] = useState<EcosystemNewsRow[]>([]);
  const [advisoryBoard, setAdvisoryBoard] = useState<AdvisoryBoardMemberRow[]>([]);
  const [fellowshipApplications, setFellowshipApplications] = useState<FellowshipApplicationRow[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEcosystem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [newsRes, boardRes, fellowshipRes, revenueRes] = await Promise.all([
        supabase.from("ecosystem_news").select("*").order("published_at", { ascending: false }).limit(20),
        supabase.from("advisory_board_members").select("*").order("display_order", { ascending: true }),
        supabase.from("fellowship_applications").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("finance_revenue_metrics").select("*").order("month", { ascending: false }).limit(12),
      ]);

      setNews(newsRes.data || []);
      setAdvisoryBoard(boardRes.data || []);
      setFellowshipApplications(fellowshipRes.data || []);
      setRevenueMetrics(revenueRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch ecosystem data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcosystem();
  }, [fetchEcosystem]);

  useAdminRealtime<EcosystemNewsRow>({
    table: "ecosystem_news",
    enabled: autoSubscribe,
    onChange: () => fetchEcosystem(),
  });

  useAdminRealtime<FellowshipApplicationRow>({
    table: "fellowship_applications",
    enabled: autoSubscribe,
    onChange: () => fetchEcosystem(),
  });

  const toggleNewsActive = async (id: string, isActive: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("ecosystem_news")
        .update({ is_active: isActive })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setNews((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_active: isActive } : n))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to toggle news status" };
    }
  };

  const updateFellowshipStatus = async (id: string, status: string) => {
    try {
      const { error: updateError } = await supabase
        .from("fellowship_applications")
        .update({ status })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setFellowshipApplications((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to update fellowship status" };
    }
  };

  return {
    news,
    advisoryBoard,
    fellowshipApplications,
    revenueMetrics,
    loading,
    error,
    toggleNewsActive,
    updateFellowshipStatus,
    refetch: fetchEcosystem,
  };
}
