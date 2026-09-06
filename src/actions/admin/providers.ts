"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";

export async function toggleVerifiedRespondent(
  providerId: string,
  isVerified: boolean,
  contactEmail?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("ai_providers")
      .update({
        is_verified_respondent: isVerified,
        verified_respondent_at: isVerified ? new Date().toISOString() : null,
        respondent_contact_email: isVerified ? contactEmail || null : null,
        respondent_verified_by: isVerified ? adminUser.id : null,
      })
      .eq("id", providerId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/[locale]/admin", "layout");
    revalidatePath("/[locale]/leaderboard", "page");
    revalidatePath("/", "page");
    return { ok: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, error: msg };
  }
}

export async function getVerifiedRespondentProviders(): Promise<{
  ok: boolean;
  error?: string;
  data: Array<{
    id: string;
    name: string;
    slug: string;
    is_verified_respondent: boolean | null;
    respondent_contact_email: string | null;
    verified_respondent_at: string | null;
  }>;
}> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("ai_providers")
      .select(
        "id, name, slug, is_verified_respondent, respondent_contact_email, verified_respondent_at",
      )
      .order("name");

    if (error) return { ok: false, error: error.message, data: [] };
    return {
      ok: true,
      data:
        (data as unknown as Array<{
          id: string;
          name: string;
          slug: string;
          is_verified_respondent: boolean | null;
          respondent_contact_email: string | null;
          verified_respondent_at: string | null;
        }>) || [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg, data: [] };
  }
}
