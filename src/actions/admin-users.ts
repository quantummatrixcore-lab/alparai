"use server";

import { createAdminClient } from "@/lib/dehost/admin";
import { createServerClient } from "@/lib/dehost/server";
import { logger } from "@/lib/utils/logger";

import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  role: z.enum(["user", "moderator", "admin", "ceo"]),
});

export async function createUserByAdmin(data: {
  email: string;
  fullName: string;
  role: "user" | "moderator" | "admin" | "ceo";
}) {
  const dehostAdmin = createAdminClient();
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input data" };
  }
  const validData = parsed.data;
  try {
    // 1. Verify caller is admin
    const dehost = await createServerClient();
    const {
      data: { user },
    } = await dehost.auth.getUser();

    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const { data: profile } = await dehost
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "ceo")) {
      return { ok: false, error: "Forbidden: Admins only" };
    }

    try {
      // 2. Create the user in DeHost Auth
      const { data: authData, error: authError } = await dehostAdmin.auth.admin.createUser({
        email: validData.email,
        email_confirm: true,
        user_metadata: {
          full_name: validData.fullName,
        },
      });

      if (authError) {
        logger.error(
          "Auth creation error in createUserByAdmin",
          { role: validData.role },
          authError,
        );
        return { ok: false, error: authError.message };
      }

      if (!authData.user) {
        return { ok: false, error: "User creation failed in Auth" };
      }

      // 3. Update the role in public.users (triggers usually create the row, we just update it)
      const { error: dbError } = await dehostAdmin
        .from("users")
        .update({
          role: validData.role,
          is_verified: true,
        })
        .eq("id", authData.user.id);

      if (dbError) {
        logger.error(
          "DB role update error in createUserByAdmin",
          { role: validData.role, userId: authData.user.id },
          new Error(dbError.message),
        );
        // Even if this fails, the user was created, but role might be default 'user'
      }

      return { ok: true, userId: authData.user.id };
    } catch (error: unknown) {
      logger.error(
        "Unexpected error in createUserByAdmin",
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      return { ok: false, error: errorMessage };
    }
  } catch (err) {
    console.error("[createUserByAdmin] Error:", err);
    throw err;
  }
}
