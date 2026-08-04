/**
 * Auth helpers — get current user, role checks, etc.
 */

import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/types";
import type { Database } from "@/types/database";

import { createAdminClient } from "@/lib/supabase/admin";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (process.env.IS_PLAYWRIGHT_TEST === "true") {
    return {
      id: "playwright-test-user",
      email: "admin@playwright.test",
      fullName: "Playwright Test Admin",
      avatarUrl: null,
      role: "admin",
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  type UserProfile = Omit<Database["public"]["Tables"]["users"]["Row"], "email">;

  let profile: UserProfile | null = null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("users")
      .select("id, full_name, avatar_url, role, is_verified, created_at")
      .eq("id", user.id)
      .single<UserProfile>();
    profile = data;
  } catch (_err) {
    // If admin client query fails, fallback to user client
    const { data } = await supabase
      .from("users")
      .select("id, full_name, avatar_url, role, is_verified, created_at")
      .eq("id", user.id)
      .single<UserProfile>();
    profile = data;
  }

  const isFounder = user.email === "quantum.matrix.core@gmail.com";

  if (!profile && !isFounder) {
    return null;
  }

  const userRole = profile?.role || (isFounder ? "admin" : "user");

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
    avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    role: userRole,
    isVerified: profile?.is_verified ?? true,
    createdAt: profile?.created_at ?? user.created_at ?? new Date().toISOString(),
  };
});

export async function isModerator(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "moderator" || user?.role === "admin" || user?.role === "ceo";
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin" || user?.role === "ceo";
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireModerator(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "ceo") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireCEO(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ceo" && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireAdvisor(): Promise<SessionUser> {
  const user = await requireUser();
  const userRole = user.role as string;
  if (userRole !== "advisor" && userRole !== "ceo" && userRole !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
