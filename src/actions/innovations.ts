"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { ExternalIncidentQueueItem, StrategyInnovation } from "@/types";
import type { Database } from "@/types/database";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";

export async function getExternalQueue(): Promise<ExternalIncidentQueueItem[]> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("external_incidents_queue")
      .select(
        "id, title, body, source, external_url, status, fetched_at, source_score, created_at, updated_at",
      )
      .order("fetched_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as ExternalIncidentQueueItem[];
  } catch (err) {
    console.error("[getExternalQueue] Error:", err);
    throw err;
  }
}

export async function updateExternalQueueStatus(
  id: string,
  status: "pending" | "accepted" | "rejected" | "duplicate",
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("external_incidents_queue")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/[locale]/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("[updateExternalQueueStatus] Error:", err);
    throw err;
  }
}

export async function acceptExternalIncident(
  queueItemId: string,
  category: string,
  severity: string,
): Promise<{ success: boolean; incidentId: string }> {
  try {
    const user = await requireAdmin();
    const supabase = createAdminClient();

    // 1. Fetch from queue
    const { data: queueItem, error: fetchError } = await supabase
      .from("external_incidents_queue")
      .select("*")
      .eq("id", queueItemId)
      .single();

    if (fetchError || !queueItem) {
      throw new Error(fetchError?.message || "Queue item not found");
    }

    // 2. Insert into incidents
    const { data: incident, error: insertError } = await supabase
      .from("incidents")
      .insert({
        user_id: user.id,
        title: queueItem.title,
        title_masked: queueItem.title,
        description: queueItem.body ?? "",
        description_masked: queueItem.body ?? "",
        category: category as Database["public"]["Enums"]["incident_category"],
        severity: severity as Database["public"]["Enums"]["incident_severity"],
        source_url: queueItem.external_url,
        incident_date: new Date().toISOString(),
        language: "en",
        is_anonymous: false,
        is_expert: false,
        contains_pii: false,
        pii_categories: [],
        status: "published", // Since admin/ceo is accepting it directly
      })
      .select("id")
      .single();

    if (insertError || !incident) {
      throw new Error(insertError?.message || "Failed to insert incident");
    }

    // 3. Mark queue item as accepted
    const { error: updateError } = await supabase
      .from("external_incidents_queue")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", queueItemId);

    if (updateError) {
      logger.error(
        "Failed to update queue item status",
        undefined,
        updateError instanceof Error ? updateError : undefined,
      );
    }

    revalidatePath("/[locale]/admin", "layout");
    revalidatePath("/[locale]/incidents", "layout");
    return { success: true, incidentId: incident.id };
  } catch (err) {
    console.error("[acceptExternalIncident] Error:", err);
    throw err;
  }
}

export async function triggerManualFetch(): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
    try {
      const data = await runExternalFetchTask();
      revalidatePath("/[locale]/admin", "layout");
      return {
        success: true,
        message: `Fetched: ${data.total_fetched}, Inserted: ${data.inserted_or_updated}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  } catch (err) {
    console.error("[triggerManualFetch] Error:", err);
    throw err;
  }
}

export async function getConnectorStatuses(): Promise<
  Array<{
    name: string;
    source: string;
    last_fetch: string;
    pending_count: number;
  }>
> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Count pending items by source
    const { data: counts } = await supabase
      .from("external_incidents_queue")
      .select("source, status");

    const sources = ["reddit", "hn", "github", "hackerone", "rss"];
    const sourceNames: Record<string, string> = {
      reddit: "Reddit Connector (r/ChatGPT, r/artificial...)",
      hn: "Hacker News Algolia",
      github: "GitHub Security Issues",
      hackerone: "HackerOne Public Security Reports",
      rss: "RSS Feeds (MIT Tech, Wired...)",
    };

    return sources.map((src) => {
      const srcItems = counts?.filter((c) => c.source === src) || [];
      const pending = srcItems.filter((c) => c.status === "pending").length;
      return {
        name: sourceNames[src] || src,
        source: src,
        last_fetch: new Date().toISOString(), // Mock, or can get max(fetched_at)
        pending_count: pending,
      };
    });
  } catch (err) {
    console.error("[getConnectorStatuses] Error:", err);
    throw err;
  }
}

export async function getInnovations(): Promise<StrategyInnovation[]> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("strategy_innovations")
      .select("id, title, description, priority, status, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as StrategyInnovation[];
  } catch (err) {
    console.error("[getInnovations] Error:", err);
    throw err;
  }
}

export async function createInnovation(
  title: string,
  description: string,
  priority: "low" | "medium" | "high" | "critical",
): Promise<{ success: boolean; id: string }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("strategy_innovations")
      .insert({
        title,
        description,
        priority,
        status: "idea",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/[locale]/admin", "layout");
    return { success: true, id: data.id };
  } catch (err) {
    console.error("[createInnovation] Error:", err);
    throw err;
  }
}

export async function updateInnovationStatus(
  id: string,
  status: "idea" | "in_progress" | "done",
): Promise<{ success: boolean }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("strategy_innovations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/[locale]/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("[updateInnovationStatus] Error:", err);
    throw err;
  }
}

export async function autoReviewAllPending(): Promise<{
  success: boolean;
  message: string;
  processed: number;
}> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: pendingItems, error } = await supabase
      .from("external_incidents_queue")
      .select("id, title, body")
      .eq("status", "pending")
      .limit(10); // Process 10 at a time to prevent timeout/rate limit issues

    if (error) {
      throw new Error(error.message);
    }

    if (!pendingItems || pendingItems.length === 0) {
      return { success: true, message: "Kuyrukta bekleyen olay yok.", processed: 0 };
    }

    let processed = 0;

    for (const item of pendingItems) {
      try {
        const res = await callWithFailover(
          {
            systemPrompt: `You are an AI Incident Reviewer for ALPAR AI. Analyze the following incident report and decide whether it should be accepted, rejected, or marked as a duplicate.
Output strictly in JSON format:
{
  "action": "accept" | "reject" | "duplicate",
  "category": "hallucination" | "data_leak" | "bias" | "security_flaw" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "reason": "short explanation"
}
Criteria: If the text describes a genuine AI incident (hallucination, data leak, bias, etc.), "accept" it. If it is spam, unrelated news, or just random chatter, "reject" it.`,
            userMessage: `Title: ${item.title}\n\nBody:\n${item.body}`,
            temperature: 0.1,
            responseFormat: "json",
          },
          await selectModelByCapability("fast_triage"),
        );

        if (!res.ok) continue;

        const cleanText = res.data.content
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const result = JSON.parse(cleanText) as {
          action: string;
          category: string;
          severity: string;
        };

        if (result.action === "accept") {
          await acceptExternalIncident(item.id, result.category, result.severity);
        } else if (result.action === "reject" || result.action === "duplicate") {
          await updateExternalQueueStatus(item.id, result.action as "rejected" | "duplicate");
        }
        processed++;
      } catch (err) {
        logger.error(
          "Failed to auto-review queue item",
          { id: item.id },
          err instanceof Error ? err : undefined,
        );
      }
    }

    revalidatePath("/[locale]/admin", "layout");
    return { success: true, message: `${processed} olay başarıyla incelendi.`, processed };
  } catch (err) {
    console.error("[autoReviewAllPending] Error:", err);
    throw err;
  }
}
