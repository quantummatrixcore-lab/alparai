"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/dehost/server";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["published", "investigating", "resolved"]),
});

export type UpdateB2BIncidentStatusInput = z.infer<typeof updateStatusSchema>;

export async function updateB2BIncidentStatus(
  input: unknown,
  statusArg?: "published" | "investigating" | "resolved",
): Promise<{ ok: boolean; error?: string }> {
  const payload =
    typeof input === "string" && statusArg
      ? { id: input, status: statusArg }
      : input;

  const parseResult = updateStatusSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      ok: false,
      error: parseResult.error.issues[0]?.message || "VALIDATION_FAILED",
    };
  }

  const user = await getCurrentUser();
  const allowedRoles = ["admin", "ceo", "moderator"];
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  const { id, status } = parseResult.data;
  const dehost = await createServerClient();

  const { error } = await dehost
    .from("incidents")
    .update({ status: status as never })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
