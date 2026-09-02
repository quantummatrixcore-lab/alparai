"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAdminRealtime } from "./use-admin-realtime";

export interface AdminUserItem {
  id: string;
  email: string;
  role: "user" | "advisor" | "moderator" | "admin" | "ceo" | "expert";
  full_name?: string | null;
  is_banned?: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
}

export interface ExpertApplicationItem {
  id: string;
  name: string;
  email: string | null;
  expertise: string;
  expertise_area: string | null;
  title_institution: string;
  linkedin_url: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from("users")
        .select("id, email, role, full_name, created_at, is_verified", { count: "exact" });

      if (role !== "all") {
        query = query.eq("role", role);
      }

      if (search.trim()) {
        const term = "%" + search.trim() + "%";
        query = query.or("email.ilike." + term + ",full_name.ilike." + term);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const [usersRes, expertRes] = await Promise.all([
        query.order("created_at", { ascending: false }).range(from, to),
        supabase
          .from("expert_applications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (usersRes.error) {
        throw new Error(usersRes.error.message);
      }

      setUsers((usersRes.data as AdminUserItem[]) || []);
      setTotalCount(usersRes.count || 0);
      setExpertApplications((expertRes.data as ExpertApplicationItem[]) || []);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (updateError) throw new Error(updateError.message);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("users")
        .update({ is_banned: isBanned })
        .eq("id", userId);

      if (updateError) throw new Error(updateError.message);

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
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("expert_applications")
        .update({
          status,
          reviewed_at: now,
        })
        .eq("id", appId);

      if (updateError) throw new Error(updateError.message);

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
