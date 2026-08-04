"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";

export async function approveQueueItem(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: item, error: fetchError } = await supabase
    .from("external_incidents_queue")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    logger.error("[EcosystemAction] Queue item not found", { id, error: fetchError?.message });
    return;
  }

  const { error: newsError } = await supabase.from("ecosystem_news").insert({
    title_en: item.title,
    title_tr: item.title,
    summary_en: item.body ?? "",
    summary_tr: item.body ?? "",
    category: "incident",
    severity: "medium",
    source: item.source,
    url: item.external_url,
    status: "accepted",
    is_active: true,
    published_at: new Date().toISOString(),
  });

  if (newsError) {
    logger.error("[EcosystemAction] Failed to insert ecosystem_news", {
      id,
      error: newsError.message,
    });
    return;
  }

  await supabase
    .from("external_incidents_queue")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/[locale]/admin/ecosystem", "page");
}

export async function rejectQueueItem(id: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("external_incidents_queue")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/[locale]/admin/ecosystem", "page");
}

export async function archiveEcosystemNews(id: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("ecosystem_news").update({ is_active: false }).eq("id", id);

  revalidatePath("/[locale]/admin/ecosystem", "page");
}

export async function updateEcosystemCategory(id: string, category: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("ecosystem_news").update({ category }).eq("id", id);

  revalidatePath("/[locale]/admin/ecosystem", "page");
}

export async function triggerExternalFetch(): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return { success: false, message: "Yetkisiz erişim (Unauthorized)" };
  }

  try {
    const data = await runExternalFetchTask();
    revalidatePath("/[locale]/admin/ecosystem", "page");
    return {
      success: true,
      message: `Tamamlandı: ${data.total_fetched || 0} potansiyel olay, ${data.positive_inserted || 0} olumlu gelişme, ${data.ai_verified_published || 0} otomatik yayınlandı`,
    };
  } catch (err) {
    logger.error(
      "[triggerExternalFetch] Execution failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return {
      success: false,
      message: err instanceof Error ? err.message : "Bilinmeyen hata oluştu",
    };
  }
}
