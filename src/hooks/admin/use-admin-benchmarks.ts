"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type AiProviderRow = Database["public"]["Tables"]["ai_providers"]["Row"];
export type AiModelRow = Database["public"]["Tables"]["ai_models"]["Row"];
export type KModelScoreRow = Database["public"]["Tables"]["k_model_scores"]["Row"];

export interface UseAdminBenchmarksOptions {
  providerId?: string;
  autoSubscribe?: boolean;
}

export interface UseAdminBenchmarksResult {
  providers: AiProviderRow[];
  models: AiModelRow[];
  scores: KModelScoreRow[];
  loading: boolean;
  error: Error | null;
  toggleVerifiedRespondent: (providerId: string, isVerified: boolean) => Promise<{ ok: boolean; error?: string }>;
  updateProviderTrust: (providerId: string, trustScore: number) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminBenchmarks({
  providerId,
  autoSubscribe = true,
}: UseAdminBenchmarksOptions = {}): UseAdminBenchmarksResult {
  const [providers, setProviders] = useState<AiProviderRow[]>([]);
  const [models, setModels] = useState<AiModelRow[]>([]);
  const [scores, setScores] = useState<KModelScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBenchmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let modelsQuery = supabase.from("ai_models").select("*");
      if (providerId) {
        modelsQuery = modelsQuery.eq("provider_id", providerId);
      }

      const [provRes, modelsRes, scoresRes] = await Promise.all([
        supabase.from("ai_providers").select("*").order("name"),
        modelsQuery.order("name"),
        supabase.from("k_model_scores").select("*").order("score", { ascending: false }),
      ]);

      setProviders(provRes.data || []);
      setModels(modelsRes.data || []);
      setScores(scoresRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch benchmark data"));
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  useAdminRealtime<AiProviderRow>({
    table: "ai_providers",
    enabled: autoSubscribe,
    onChange: () => fetchBenchmarks(),
  });

  useAdminRealtime<KModelScoreRow>({
    table: "k_model_scores",
    enabled: autoSubscribe,
    onChange: () => fetchBenchmarks(),
  });

  const toggleVerifiedRespondent = async (targetProviderId: string, isVerified: boolean) => {
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("ai_providers")
        .update({
          is_verified_respondent: isVerified,
          verified_respondent_at: isVerified ? now : null,
        })
        .eq("id", targetProviderId);

      if (updateError) throw new Error(updateError.message);

      setProviders((prev) =>
        prev.map((p) =>
          p.id === targetProviderId
            ? { ...p, is_verified_respondent: isVerified, verified_respondent_at: isVerified ? now : null }
            : p
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to toggle verified respondent" };
    }
  };

  const updateProviderTrust = async (targetProviderId: string, trustScore: number) => {
    try {
      const { error: updateError } = await supabase
        .from("ai_providers")
        .update({
          trust_score: trustScore,
        })
        .eq("id", targetProviderId);

      if (updateError) throw new Error(updateError.message);

      setProviders((prev) =>
        prev.map((p) => (p.id === targetProviderId ? { ...p, trust_score: trustScore } : p))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to update trust score" };
    }
  };

  return {
    providers,
    models,
    scores,
    loading,
    error,
    toggleVerifiedRespondent,
    updateProviderTrust,
    refetch: fetchBenchmarks,
  };
}
