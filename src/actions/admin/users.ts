"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/dehost/admin";
import { requireAdmin } from "@/lib/auth/session";

const userRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "moderator", "admin", "ceo"]),
});

const ROLE_RANK: Record<string, number> = {
  user: 0,
  advisor: 1,
  instructor: 1,
  moderator: 2,
  admin: 3,
  ceo: 4,
};

function canAssignRole(actorRole: string, targetRole: string): boolean {
  if (actorRole === "ceo") return true;
  if (actorRole === "admin") return targetRole !== "ceo" && targetRole !== "admin";
  return false;
}

export async function setUserRole(
  input: z.infer<typeof userRoleSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: "Forbidden" };

    const parsed = userRoleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input" };

    if (!canAssignRole(admin.role, parsed.data.role)) {
      return { ok: false, error: "Insufficient privileges to assign this role" };
    }

    const db = createAdminClient();

    const { data: before } = await db
      .from("users")
      .select("id, role, email")
      .eq("id", parsed.data.userId)
      .maybeSingle();

    if (!before) return { ok: false, error: "User not found" };

    if (before.role === parsed.data.role) {
      return { ok: true };
    }

    if (
      before.role === "ceo" &&
      admin.role !== "ceo" &&
      (ROLE_RANK[admin.role] ?? 0) < (ROLE_RANK.ceo as number)
    ) {
      return { ok: false, error: "Cannot modify a CEO" };
    }

    const { error } = await db
      .from("users")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.userId);

    if (error) return { ok: false, error: "Failed to update" };

    await db.from("audit_log").insert({
      actor_id: admin.id,
      action: "user.role.change",
      entity_type: "user",
      entity_id: parsed.data.userId,
      before_data: { role: before.role },
      after_data: { role: parsed.data.role, target_email: before.email },
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    console.error("[setUserRole] Error:", err);
    throw err;
  }
}

export async function promoteUser(
  email: string,
  role: "user" | "advisor" | "moderator" | "admin" | "ceo",
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: "Forbidden" };

    const emailSchema = z.string().email();
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return { ok: false, error: "Invalid email" };

    const parsedRole = z.enum(["user", "advisor", "moderator", "admin", "ceo"]).safeParse(role);
    if (!parsedRole.success) return { ok: false, error: "Invalid role" };

    if (!canAssignRole(admin.role, parsedRole.data)) {
      return { ok: false, error: "Insufficient privileges to assign this role" };
    }

    const db = createAdminClient();

    const { data: target, error: lookupError } = await db
      .from("users")
      .select("id, role, email")
      .eq("email", parsedEmail.data)
      .maybeSingle();

    if (lookupError) return { ok: false, error: "Lookup failed" };
    if (!target) return { ok: false, error: "User not found" };

    if (
      target.role === "ceo" &&
      admin.role !== "ceo" &&
      (ROLE_RANK[admin.role] ?? 0) < (ROLE_RANK.ceo as number)
    ) {
      return { ok: false, error: "Cannot modify a CEO" };
    }

    if (target.role === parsedRole.data) {
      return { ok: true, userId: target.id };
    }

    const { error: updateError } = await db
      .from("users")
      .update({ role: parsedRole.data as "user" | "moderator" | "admin" | "ceo" })
      .eq("id", target.id);

    if (updateError) return { ok: false, error: "Failed to update" };

    await db.from("audit_log").insert({
      actor_id: admin.id,
      action: "user.promote",
      entity_type: "user",
      entity_id: target.id,
      before_data: { role: target.role },
      after_data: { role: parsedRole.data, target_email: target.email, method: "promote_by_email" },
    });

    revalidatePath("/admin/users");
    return { ok: true, userId: target.id };
  } catch (err) {
    console.error("[promoteUser] Error:", err);
    throw err;
  }
}

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

export async function getAdminUsers(options?: {
  role?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  ok: boolean;
  error?: string;
  users: AdminUserItem[];
  totalCount: number;
  expertApplications: ExpertApplicationItem[];
}> {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { ok: false, error: "Forbidden", users: [], totalCount: 0, expertApplications: [] };
    }

    const db = createAdminClient();
    const role = options?.role || "all";
    const search = options?.search || "";
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;

    let query = db
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
      db
        .from("expert_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (usersRes.error) {
      console.error("[getAdminUsers] Error fetching users:", usersRes.error);
      return { ok: false, error: usersRes.error.message, users: [], totalCount: 0, expertApplications: [] };
    }

    return {
      ok: true,
      users: (usersRes.data as AdminUserItem[]) || [],
      totalCount: usersRes.count || 0,
      expertApplications: (expertRes.data as ExpertApplicationItem[]) || [],
    };
  } catch (err) {
    console.error("[getAdminUsers] Error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Internal error", users: [], totalCount: 0, expertApplications: [] };
  }
}

export async function toggleUserBanAction(
  userId: string,
  isBanned: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: "Forbidden" };

    const db = createAdminClient();
    const { error } = await db
      .from("users")
      .update({ is_deleted: isBanned })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Ban toggle failed" };
  }
}

export async function reviewExpertAppAction(
  appId: string,
  status: "approved" | "rejected"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: "Forbidden" };

    const db = createAdminClient();
    const now = new Date().toISOString();
    const { error } = await db
      .from("expert_applications")
      .update({
        status,
        reviewed_at: now,
        reviewed_by: admin.id,
      })
      .eq("id", appId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Review failed" };
  }
}

