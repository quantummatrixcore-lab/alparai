"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";

export async function approveQueueItem(id: string): Promise<void> {
  try {
    const dehost = createAdminClient();

    const { data: item, error: fetchError } = await dehost
      .from("external_incidents_queue")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      logger.error("[EcosystemAction] Queue item not found", { id, error: fetchError?.message });
      return;
    }

    const { error: newsError } = await dehost.from("ecosystem_news").insert({
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

    await dehost
      .from("external_incidents_queue")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .eq("id", id);

    revalidatePath("/[locale]/admin/ecosystem", "page");
  } catch (err) {
    console.error("[approveQueueItem] Error:", err);
    throw err;
  }
}

export async function rejectQueueItem(id: string): Promise<void> {
  try {
    const dehost = createAdminClient();

    await dehost
      .from("external_incidents_queue")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id);

    revalidatePath("/[locale]/admin/ecosystem", "page");
  } catch (err) {
    console.error("[rejectQueueItem] Error:", err);
    throw err;
  }
}

export async function archiveEcosystemNews(id: string): Promise<void> {
  try {
    const dehost = createAdminClient();

    await dehost.from("ecosystem_news").update({ is_active: false }).eq("id", id);

    revalidatePath("/[locale]/admin/ecosystem", "page");
  } catch (err) {
    console.error("[archiveEcosystemNews] Error:", err);
    throw err;
  }
}

export async function updateEcosystemCategory(id: string, category: string): Promise<void> {
  try {
    const dehost = createAdminClient();

    await dehost.from("ecosystem_news").update({ category }).eq("id", id);

    revalidatePath("/[locale]/admin/ecosystem", "page");
  } catch (err) {
    console.error("[updateEcosystemCategory] Error:", err);
    throw err;
  }
}

export async function triggerExternalFetch(): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { success: false, message: "Unauthorized access" };
    }

    try {
      const data = await runExternalFetchTask();
      revalidatePath("/[locale]/admin/ecosystem", "page");
      return {
        success: true,
        message: `Completed: ${data.total_fetched || 0} potential incidents, ${data.positive_inserted || 0} positive developments, ${data.ai_verified_published || 0} auto-published`,
      };
    } catch (err) {
      logger.error(
        "[triggerExternalFetch] Execution failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return {
        success: false,
        message: err instanceof Error ? err.message : "An unknown error occurred",
      };
    }
  } catch (err) {
    console.error("[triggerExternalFetch] Error:", err);
    throw err;
  }
}
