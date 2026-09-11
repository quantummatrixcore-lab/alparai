"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminRealtime } from "./use-admin-realtime";
import {
  getAdminUsers,
  setUserRole,
  toggleUserBanAction,
  reviewExpertAppAction,
  type AdminUserItem,
  type ExpertApplicationItem,
} from "@/actions/admin/users";

export type { AdminUserItem, ExpertApplicationItem };

export interface UseAdminUsersOptions {
  role?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  autoSubscribe?: boolean;
}

export interface UseAdminUsersResult {
  users: AdminUserItem[];
  expertApplications: ExpertApplicationItem[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
  refetch: () => Promise<void>;
  updateUserRole: (userId: string, role: AdminUserItem["role"]) => Promise<{ ok: boolean; error?: string }>;
  toggleUserBan: (userId: string, isBanned: boolean) => Promise<{ ok: boolean; error?: string }>;
  reviewExpertApp: (appId: string, status: "approved" | "rejected") => Promise<{ ok: boolean; error?: string }>;
}

export function useAdminUsers({
  role = "all",
  search = "",
  page = 1,
  pageSize = 20,
  autoSubscribe = true,
}: UseAdminUsersOptions = {}): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [expertApplications, setExpertApplications] = useState<ExpertApplicationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAdminUsers({ role, search, page, pageSize });

      if (!res.ok) {
        throw new Error(res.error || "Failed to fetch users");
      }

      setUsers(res.users || []);
      setTotalCount(res.totalCount || 0);
      setExpertApplications(res.expertApplications || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, [role, search, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAdminRealtime({
    table: "users",
    enabled: autoSubscribe,
    onChange: () => fetchUsers(),
  });

  useAdminRealtime({
    table: "expert_applications",
    enabled: autoSubscribe,
    onChange: () => fetchUsers(),
  });

  const updateUserRole = async (userId: string, newRole: AdminUserItem["role"]) => {
    try {
      // Validate role before casting to match setUserRole accepted union
      if (newRole === "advisor" || newRole === "expert") {
        return { ok: false, error: "Role cannot be assigned directly" };
      }
      const res = await setUserRole({ userId, role: newRole });
      if (!res.ok) return res;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Role update failed" };
    }
  };

  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      const res = await toggleUserBanAction(userId, isBanned);
      if (!res.ok) return res;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: isBanned } : u))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Ban toggle failed" };
    }
  };

  const reviewExpertApp = async (appId: string, status: "approved" | "rejected") => {
    try {
      const res = await reviewExpertAppAction(appId, status);
      if (!res.ok) return res;

      const now = new Date().toISOString();
      setExpertApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status, reviewed_at: now } : a))
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Review failed" };
    }
  };

  return {
    users,
    expertApplications,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    refetch: fetchUsers,
    updateUserRole,
    toggleUserBan,
    reviewExpertApp,
  };
}

