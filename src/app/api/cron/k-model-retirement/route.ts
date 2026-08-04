import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

interface OpenRouterModel {
  id: string;
  name: string;
}

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // 1. Fetch active/beta models in our DB
    const { data: dbModels, error: dbModelsErr } = await supabase
      .from("ai_models")
      .select("id, name, status, deprecated_at")
      .neq("status", "deprecated"); // status can be active or beta

    if (dbModelsErr) throw dbModelsErr;

    // 2. Fetch models list from OpenRouter (public metadata endpoint)
    let openRouterModels: string[] = [];
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload && Array.isArray(payload.data)) {
          openRouterModels = payload.data.map((m: OpenRouterModel) => m.id);
        }
      }
    } catch (err) {
      logger.warn("[K-ModelRetirement] Failed to fetch live OpenRouter models list", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const nowStr = new Date().toISOString();
    const updatedModelIds: string[] = [];

    // 3. Check if any active OpenRouter model is missing from the live list -> Deprecate it
    if (openRouterModels.length > 0 && dbModels) {
      for (const model of dbModels) {
        // Only check OpenRouter models (they contain a slash in their ID like google/gemini-1.5-flash or meta-llama/...)
        const isOpenRouterModel = model.id.includes("/");
        if (isOpenRouterModel && !openRouterModels.includes(model.id)) {
          // Model is missing, mark as deprecated in our DB
          const { error } = await supabase
            .from("ai_models")
            .update({
              status: "deprecated",
              deprecated_at: nowStr,
            })
            .eq("id", model.id);

          if (!error) {
            updatedModelIds.push(model.id);
            logger.info(`[K-ModelRetirement] Model marked deprecated: ${model.name} (${model.id})`);
          }
        }
      }
    }

    // 4. Find models that have been deprecated for >= 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: deprecatedModels, error: depErr } = await supabase
      .from("ai_models")
      .select("id, name")
      .lte("deprecated_at", sixtyDaysAgo);

    if (depErr) throw depErr;

    const retiredModelIds: string[] = [];
    if (deprecatedModels && deprecatedModels.length > 0) {
      for (const model of deprecatedModels) {
        const { error } = await supabase
          .from("k_model_scores")
          .update({ status: "retired" })
          .eq("model_id", model.id);

        if (!error) {
          retiredModelIds.push(model.id);
          logger.info(`[K-ModelRetirement] Model scores retired: ${model.name} (${model.id})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      deprecated_count: updatedModelIds.length,
      deprecated_ids: updatedModelIds,
      retired_count: retiredModelIds.length,
      retired_ids: retiredModelIds,
    });
  } catch (error) {
    logger.error("K-ModelRetirement cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("k-model-retirement", getHandler);
