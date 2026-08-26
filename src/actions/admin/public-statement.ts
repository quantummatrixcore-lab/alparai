"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/auth/session";

const publicStatementSchema = z.object({
  incidentId: z.string().uuid(),
  providerId: z.string().uuid(),
  sourceUrl: z.string().url(),
  statementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  quote: z.string().min(10).max(10000),
});

export async function recordPublicStatement(formData: FormData) {
  try {
    const user = await requireModerator();

    const raw = {
      incidentId: formData.get("incidentId"),
      providerId: formData.get("providerId"),
      sourceUrl: formData.get("sourceUrl"),
      statementDate: formData.get("statementDate"),
      quote: formData.get("quote"),
    };

    const parsed = publicStatementSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Validation failed: " + parsed.error.message };
    }

    const {
      incidentId,
      providerId,
      sourceUrl: _sourceUrl,
      statementDate: _statementDate,
      quote,
    } = parsed.data;

    const supabase = await createServerClient();

    const { error } = await supabase.from("ai_provider_responses").insert({
      incident_id: incidentId,
      ai_provider_id: providerId,
      response_text: quote,
      responder_name: user.email?.split("@")[0] || "Moderator",
      responder_email: user.email || "moderator@alparai.com",
      responder_role: "Public Statement Auditor",
      is_official: true,
      is_published: true,
      published_at: new Date().toISOString(),
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath(`/incidents/${incidentId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
