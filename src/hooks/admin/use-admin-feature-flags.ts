"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { useAdminRealtime } from "./use-admin-realtime";

export type FeatureFlagRow = Database["public"]["Tables"]["feature_flags"]["Row"];

export interface UseAdminFeatureFlagsResult {
  flags: FeatureFlagRow[];
  flagsMap: Record<string, boolean>;
  loading: boolean;
  error: Error | null;
  isEnabled: (key: string, defaultValue?: boolean) => boolean;
  toggleFlag: (key: string, currentEnabled: boolean) => Promise<{ ok: boolean; error?: string }>;
  setFlag: (key: string, enabled: boolean) => Promise<{ ok: boolean; error?: string }>;
  deleteFlag: (key: string) => Promise<{ ok: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useAdminFeatureFlags(autoSubscribe = true): UseAdminFeatureFlagsResult {
  const [flags, setFlags] = useState<FeatureFlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("feature_flags")
        .select("*")
        .order("key", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setFlags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch feature flags"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  useAdminRealtime<FeatureFlagRow>({
    table: "feature_flags",
    enabled: autoSubscribe,
    onChange: () => {
      fetchFlags();
    },
  });

  const flagsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const flag of flags) {
      map[flag.key] = Boolean(flag.enabled);
    }
    return map;
  }, [flags]);

  const isEnabled = useCallback(
    (key: string, defaultValue = false): boolean => {
      if (key in flagsMap) {
        return Boolean(flagsMap[key]);
      }
      return defaultValue;
    },
    [flagsMap]
  );

  const toggleFlag = async (key: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    const now = new Date().toISOString();

    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: nextState, updated_at: now } : f))
    );

    try {
      const { error: upsertError } = await supabase
        .from("feature_flags")
        .upsert({
          key,
          enabled: nextState,
          updated_at: now,
        });

      if (upsertError) throw new Error(upsertError.message);
      return { ok: true };
    } catch (err) {
      setFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, enabled: currentEnabled } : f))
      );
      return { ok: false, error: err instanceof Error ? err.message : "Failed to toggle flag" };
    }
  };

  const setFlag = async (key: string, enabled: boolean) => {
    const now = new Date().toISOString();

    try {
      const { error: upsertError } = await supabase
        .from("feature_flags")
        .upsert({
          key,
          enabled,
          updated_at: now,
        });

      if (upsertError) throw new Error(upsertError.message);

      setFlags((prev) => {
        const exists = prev.some((f) => f.key === key);
        if (exists) {
          return prev.map((f) => (f.key === key ? { ...f, enabled, updated_at: now } : f));
        }
        return [
          ...prev,
          { key, enabled, updated_at: now, id: key, description: null, rules: null },
        ].sort((a, b) => a.key.localeCompare(b.key));
      });

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to set flag" };
    }
  };

  const deleteFlag = async (key: string) => {
    try {
      const { error: delError } = await supabase
        .from("feature_flags")
        .delete()
        .eq("key", key);

      if (delError) throw new Error(delError.message);

      setFlags((prev) => prev.filter((f) => f.key !== key));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to delete flag" };
    }
  };

  return {
    flags,
    flagsMap,
    loading,
    error,
    isEnabled,
    toggleFlag,
    setFlag,
    deleteFlag,
    refetch: fetchFlags,
  };
}
