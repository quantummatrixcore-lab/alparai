"use server";

import { VertexGeminiAdapter } from "@/lib/ai/adapters/vertex-gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export async function scoutNewAIIncidents() {
  const user = await getCurrentUser();
  const rateLimitKey = `${RATE_LIMIT_KEYS.vertex_scout}:${user?.id ?? "anonymous"}`;
  const rateCheck = await checkRateLimit(rateLimitKey);
  if (!rateCheck.ok) {
    logger.warn("[scoutNewAIIncidents] Rate limit exceeded", {
      userId: user?.id,
      retryAfter: rateCheck.retryAfter,
    });
    return {
      success: false,
      error: `Rate limit exceeded. Retry after ${rateCheck.retryAfter ?? 60}s.`,
    };
  }

  const admin = createAdminClient();
  const adapter = new VertexGeminiAdapter();
  const startMs = Date.now();

  const prompt = `You are an AI Incident scout. Your job is to simulate fetching the latest cutting-edge AI news and incidents happening right now.
Generate an array of exactly 2 recent, highly realistic AI incidents involving global AI providers (e.g., OpenAI, Google, Anthropic, xAI).
Return ONLY a raw JSON array (no markdown blocks, no formatting).
Format of each object in the array:
{
  "title": "String, max 100 chars, clickbaity but professional",
  "description": "String, detailed technical description of the incident, min 150 chars",
  "severity": "low", "medium", "high", or "critical",
  "category": "String, e.g. Data Leak, Bias, Jailbreak, Copyright",
  "ai_provider_name": "String, the name of the provider"
}`;

  const response = await adapter.generateJson(prompt);
  const latencyMs = Date.now() - startMs;

  if (!response.ok) {
    logger.error("[scoutNewAIIncidents] Vertex Gemini generation failed", {
      error: response.error,
      latencyMs,
    });
    return { success: false, error: response.error };
  }

  // Estimate cost: Gemini 1.5 Flash ~$0.00015/1k input tokens, ~$0.0006/1k output tokens
  // Rough estimate: 300 input tokens + 400 output tokens per scout call
  const estimatedCostUsd = (300 / 1000) * 0.00015 + (400 / 1000) * 0.0006;
  logger.info("[scoutNewAIIncidents] Vertex Gemini call completed", {
    latencyMs,
    estimatedCostUsd: estimatedCostUsd.toFixed(6),
    userId: user?.id,
  });

  try {
    const incidents = Array.isArray(response.data) ? response.data : [response.data];

    const { data: users } = await admin.from("users").select("id").eq("role", "admin").limit(1);
    const userId = users?.[0]?.id;

    for (const item of incidents) {
      let providerId = null;
      if (item.ai_provider_name) {
        const { data: provider } = await admin
          .from("ai_providers")
          .select("id")
          .ilike("name", `%${item.ai_provider_name}%`)
          .limit(1)
          .single();

        if (provider) {
          providerId = provider.id;
        } else {
          const { data: newProvider } = await admin
            .from("ai_providers")
            .insert({
              name: item.ai_provider_name,
              slug: item.ai_provider_name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              website_url: `https://${item.ai_provider_name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
              trust_score: 80,
            })
            .select()
            .single();
          providerId = newProvider?.id;
        }
      }

      await admin.from("incidents").insert({
        title: item.title,
        title_masked: item.title,
        description: item.description,
        description_masked: item.description,
        severity: item.severity || "medium",
        category: item.category || "AI Event",
        status: "published",
        is_anonymous: false,
        incident_date: new Date().toISOString().split("T")[0],
        ai_provider_id: providerId,
        user_id: userId,
      });
    }

    revalidatePath("/", "layout");
    return { success: true, count: incidents.length };
  } catch (err) {
    logger.error("[scoutNewAIIncidents] Failed to parse or insert scouted data", { error: err });
    return { success: false, error: "Failed to process Vertex data" };
  }
}
