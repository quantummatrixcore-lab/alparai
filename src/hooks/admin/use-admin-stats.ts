"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAdminRealtime } from "./use-admin-realtime";

export interface AdminSystemStats {
  incidents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    critical: number;
  };
  users: {
    total: number;
    moderators: number;
    experts: number;
    banned: number;
  };
  alarms: {
    total: number;
    critical: number;
    unresolved: number;
  };
  autopilot: {
    activeRuns: number;
    failedToday: number;
    completedToday: number;
  };
  grants: {
    totalApplications: number;
    awardedCount: number;
    pendingCount: number;
  };
  featureFlags: {
    total: number;
    enabled: number;
  };
  dsar: {
    pendingRequests: number;
  };
}

const initialStats: AdminSystemStats = {
  incidents: { total: 0, pending: 0, approved: 0, rejected: 0, critical: 0 },
  users: { total: 0, moderators: 0, experts: 0, banned: 0 },
  alarms: { total: 0, critical: 0, unresolved: 0 },
  autopilot: { activeRuns: 0, failedToday: 0, completedToday: 0 },
  grants: { totalApplications: 0, awardedCount: 0, pendingCount: 0 },
  featureFlags: { total: 0, enabled: 0 },
  dsar: { pendingRequests: 0 },
};

export interface UseAdminStatsResult {
  stats: AdminSystemStats;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsResult {
  const [stats, setStats] = useState<AdminSystemStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        incidentsRes,
        usersRes,
        alarmsRes,
        autopilotRes,
        grantsRes,
        flagsRes,
        dsarRes,
      ] = await Promise.all([
        supabase.from("incidents").select("status, severity"),
        supabase.from("users").select("role, is_banned"),
        supabase.from("sla_alarms").select("resolved"),
        supabase.from("autopilot_runs").select("status, created_at"),
        supabase.from("grant_applications").select("status"),
        supabase.from("feature_flags").select("enabled"),
        supabase.from("dsar_requests").select("status"),
      ]);

      const newStats: AdminSystemStats = {
        incidents: {
          total: incidentsRes.data?.length || 0,
          pending: (incidentsRes.data || []).filter((i: any) => i.status === "pending").length,
          approved: (incidentsRes.data || []).filter((i: any) => i.status === "published" || i.status === "approved").length,
          rejected: (incidentsRes.data || []).filter((i: any) => i.status === "rejected").length,
          critical: (incidentsRes.data || []).filter(
            (i: any) => i.severity === "critical" || i.severity === "CRITICAL"
          ).length,
        },
        users: {
          total: usersRes.data?.length || 0,
          moderators: (usersRes.data || []).filter((u: any) => u.role === "moderator" || u.role === "admin" || u.role === "ceo").length,
          experts: (usersRes.data || []).filter((u: any) => u.role === "expert" || u.role === "advisor").length,
          banned: (usersRes.data || []).filter((u: any) => Boolean(u.is_banned)).length,
        },
        alarms: {
          total: alarmsRes.data?.length || 0,
          critical: (alarmsRes.data || []).filter((a: any) => !a.resolved).length,
          unresolved: (alarmsRes.data || []).filter((a: any) => !a.resolved).length,
        },
        autopilot: {
          activeRuns: (autopilotRes.data || []).filter(
            (r: any) => r.status === "running" || r.status === "in_progress"
          ).length,
          failedToday: (autopilotRes.data || []).filter((r: any) => r.status === "failed").length,
          completedToday: (autopilotRes.data || []).filter((r: any) => r.status === "completed").length,
        },
        grants: {
          totalApplications: grantsRes.data?.length || 0,
          awardedCount: (grantsRes.data || []).filter((g: any) => g.status === "awarded" || g.status === "approved").length,
          pendingCount: (grantsRes.data || []).filter((g: any) => g.status === "submitted" || g.status === "review").length,
        },
        featureFlags: {
          total: flagsRes.data?.length || 0,
          enabled: (flagsRes.data || []).filter((f: any) => f.enabled).length,
        },
        dsar: {
          pendingRequests: (dsarRes.data || []).filter(
            (d: any) => d.status === "pending" || d.status === "in_progress"
          ).length,
        },
      };

      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch admin statistics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useAdminRealtime({ table: "incidents", onChange: () => fetchStats() });
  useAdminRealtime({ table: "sla_alarms", onChange: () => fetchStats() });
  useAdminRealtime({ table: "autopilot_runs", onChange: () => fetchStats() });
  useAdminRealtime({ table: "feature_flags", onChange: () => fetchStats() });

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
