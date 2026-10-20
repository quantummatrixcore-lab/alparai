"use client";

import { useState, useEffect, useCallback } from "react";
import { dehost } from "@/lib/dehost/client";

export interface VisualSampleRow {
  severity?: string | null;
  category?: string | null;
  created_at?: string | null;
}

export interface VisualSampleResult {
  rows: VisualSampleRow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SAMPLE_LIMIT = 500;

// Sınırlı canlı örnek: son 500 yayınlanmış vaka (şiddet/kategori/tarih).
// Grafikler bu örnekten beslenir; başlıkta kapsam açıkça yazılır.
export function useAdminVisualSample(): VisualSampleResult {
  const [rows, setRows] = useState<VisualSampleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSample = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: qerr } = await dehost
        .from("incidents")
        .select("severity,category,created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(SAMPLE_LIMIT);
      if (qerr) throw new Error(qerr.message);
      setRows((data ?? []) as VisualSampleRow[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("sample fetch failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSample();
  }, [fetchSample]);

  return { rows, loading, error, refetch: fetchSample };
}
