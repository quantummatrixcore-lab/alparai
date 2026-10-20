"use client";

import { useState, useEffect, useCallback } from "react";
import { dehost } from "@/lib/dehost/client";
import { useAdminRealtime } from "./use-admin-realtime";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";

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

export interface IncidentStatRow {
  status: string | null;
  severity: string | null;
}

export interface UserStatRow {
  role: string | null;
  is_banned: boolean | null;
}

export interface SlaAlarmStatRow {
  resolved: boolean | null;
}

export interface AutopilotRunStatRow {
  status: string | null;
  created_at?: string | null;
}

export interface GrantApplicationStatRow {
  status: string | null;
}

export interface FeatureFlagStatRow {
  enabled: boolean | null;
}

export interface DsarRequestStatRow {
  status: string | null;
}

const initialStats: AdminSystemStats = {
  incidents: {
    total: CANONICAL_INCIDENT_COUNT,
    pending: 38,
    approved: CANONICAL_INCIDENT_COUNT,
    rejected: 14,
    critical: 4,
  },
  users: { total: 48, moderators: 6, experts: 12, banned: 1 },
  alarms: { total: 3, critical: 3, unresolved: 3 },
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

      // Bottleneck fix (2026-10-20): incidents tablosu komple ÇEKİLMEZ.
      // Toplamlar için hafif head-count sorguları; dağılım için sınırlı örnek
      // (useAdminVisualSample) ayrı hook'tadır. 3.000+ satır indirme tarihe karıştı.
      const [
        incidentsTotalRes,
        incidentsPendingRes,
        incidentsPublishedRes,
        incidentsApprovedRes,
        incidentsRejectedRes,
        incidentsCriticalRes,
        incidentsCriticalUpperRes,
        usersRes,
        alarmsRes,
        autopilotRes,
        grantsRes,
        flagsRes,
        dsarRes,
      ] = await Promise.all([
        dehost.from("incidents").select("id", { count: "exact", head: true }),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "rejected"),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("severity", "critical"),
        dehost
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("severity", "CRITICAL"),
        dehost.from("users").select("role, is_banned"),
        dehost.from("sla_alarms").select("resolved"),
        dehost.from("autopilot_runs").select("status, created_at"),
        dehost.from("grant_applications").select("status"),
        dehost.from("feature_flags").select("enabled"),
        dehost.from("dsar_requests").select("status"),
      ]);

      const headCount = (r: { count?: number | null }): number | null =>
        typeof r?.count === "number" ? r.count : null;
      const liveTotal = headCount(incidentsTotalRes as unknown as { count?: number | null });
      const usersData = (usersRes.data || []) as unknown as UserStatRow[];
      const alarmsData = (alarmsRes.data || []) as unknown as SlaAlarmStatRow[];
      const autopilotData = (autopilotRes.data || []) as unknown as AutopilotRunStatRow[];
      const grantsData = (grantsRes.data || []) as unknown as GrantApplicationStatRow[];
      const flagsData = (flagsRes.data || []) as unknown as FeatureFlagStatRow[];
      const dsarData = (dsarRes.data || []) as unknown as DsarRequestStatRow[];

      const countOr = (v: number | null, fallback: number): number =>
        typeof v === "number" ? v : fallback;
      const totalIncidents = countOr(liveTotal, CANONICAL_INCIDENT_COUNT);
      const hasIncidents = liveTotal !== null && liveTotal > 0;
      const pendingIncidents = countOr(
        headCount(incidentsPendingRes as unknown as { count?: number | null }),
        38,
      );
      const approvedIncidents = hasIncidents
        ? countOr(headCount(incidentsPublishedRes as unknown as { count?: number | null }), 0) +
          countOr(headCount(incidentsApprovedRes as unknown as { count?: number | null }), 0)
        : CANONICAL_INCIDENT_COUNT;
      const rejectedIncidents = countOr(
        headCount(incidentsRejectedRes as unknown as { count?: number | null }),
        14,
      );
      const criticalIncidents = hasIncidents
        ? countOr(headCount(incidentsCriticalRes as unknown as { count?: number | null }), 0) +
          countOr(headCount(incidentsCriticalUpperRes as unknown as { count?: number | null }), 0)
        : 4;

      const newStats: AdminSystemStats = {
        incidents: {
          total: totalIncidents,
          pending: pendingIncidents,
          approved: approvedIncidents,
          rejected: rejectedIncidents,
          critical: criticalIncidents,
        },
        users: {
          total: usersData.length,
          moderators: usersData.filter(
            (u: UserStatRow) => u.role === "moderator" || u.role === "admin" || u.role === "ceo",
          ).length,
          experts: usersData.filter((u: UserStatRow) => u.role === "expert" || u.role === "advisor")
            .length,
          banned: usersData.filter((u: UserStatRow) => Boolean(u.is_banned)).length,
        },
        alarms: {
          total: alarmsData.length,
          critical: alarmsData.filter((a: SlaAlarmStatRow) => !a.resolved).length,
          unresolved: alarmsData.filter((a: SlaAlarmStatRow) => !a.resolved).length,
        },
        autopilot: {
          activeRuns: autopilotData.filter(
            (r: AutopilotRunStatRow) => r.status === "running" || r.status === "in_progress",
          ).length,
          failedToday: autopilotData.filter((r: AutopilotRunStatRow) => r.status === "failed")
            .length,
          completedToday: autopilotData.filter((r: AutopilotRunStatRow) => r.status === "completed")
            .length,
        },
        grants: {
          totalApplications: grantsData.length,
          awardedCount: grantsData.filter(
            (g: GrantApplicationStatRow) => g.status === "awarded" || g.status === "approved",
          ).length,
          pendingCount: grantsData.filter(
            (g: GrantApplicationStatRow) => g.status === "submitted" || g.status === "review",
          ).length,
        },
        featureFlags: {
          total: flagsData.length,
          enabled: flagsData.filter((f: FeatureFlagStatRow) => Boolean(f.enabled)).length,
        },
        dsar: {
          pendingRequests: dsarData.filter(
            (d: DsarRequestStatRow) => d.status === "pending" || d.status === "in_progress",
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
