import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { calculateWilsonInterval } from "@/lib/utils/wilson-score";

export const dynamic = "force-dynamic";

interface ScoreRecord {
  category_id: string;
  model_id: string;
  score: number;
}

interface IncidentRecord {
  ai_model_id: string | null;
  severity: "low" | "medium" | "high" | "critical";
  upvotes_count: number;
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
    // 1. Fetch active models and categories
    const { data: models, error: modelsErr } = await supabase
      .from("ai_models")
      .select("id, name")
      .eq("status", "active");

    if (modelsErr) throw modelsErr;

    const { data: categories, error: categoriesErr } = await supabase
      .from("k_categories")
      .select("id");

    if (categoriesErr) throw categoriesErr;

    if (!models || models.length === 0 || !categories || categories.length === 0) {
      return NextResponse.json({ message: "No active models or categories found." });
    }

    // 2. Fetch current scores to establish base scores
    const { data: currentScores, error: scoresErr } = await supabase
      .from("k_model_scores")
      .select("category_id, model_id, score");

    if (scoresErr) throw scoresErr;

    const scoreMap = new Map<string, number>();
    if (currentScores) {
      for (const s of currentScores as ScoreRecord[]) {
        scoreMap.set(`${s.model_id}:${s.category_id}`, Number(s.score));
      }
    }

    // 3. Fetch incidents from the last 90 days to calculate penalties
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: incidents, error: incidentsErr } = await supabase
      .from("incidents")
      .select("ai_model_id, severity, upvotes_count")
      .eq("status", "published")
      .gte("reviewed_at", ninetyDaysAgo);

    if (incidentsErr) throw incidentsErr;

    // Group incidents by model_id
    const modelIncidents = new Map<string, IncidentRecord[]>();
    if (incidents) {
      for (const inc of incidents as IncidentRecord[]) {
        if (inc.ai_model_id) {
          const list = modelIncidents.get(inc.ai_model_id) || [];
          list.push(inc);
          modelIncidents.set(inc.ai_model_id, list);
        }
      }
    }

    // 4. Calculate new scores
    const upsertRows = [];
    const nowStr = new Date().toISOString();

    for (const model of models) {
      const modelId = model.id;
      const incidentsList = modelIncidents.get(modelId) || [];

      // Calculate total penalty for Ethics & Safety (K5)
      let totalPenalty = 0;
      for (const inc of incidentsList) {
        let severityPenalty = 1;
        if (inc.severity === "low") severityPenalty = 0.5;
        else if (inc.severity === "high") severityPenalty = 3;
        else if (inc.severity === "critical") severityPenalty = 5;

        // Engagement penalty modifier: +10% per log unit of upvotes
        const engagementModifier = 1 + 0.1 * Math.log1p(inc.upvotes_count || 0);
        totalPenalty += severityPenalty * engagementModifier;
      }

      for (const cat of categories) {
        const catId = cat.id;
        const key = `${modelId}:${catId}`;

        // Base score default if not already in DB
        const baseScore = scoreMap.get(key) ?? 80;

        let newScore = baseScore;
        if (catId === "K5") {
          // Ethics & Safety: Apply incident penalty
          newScore = Math.max(30, Math.min(99, Math.round(baseScore - totalPenalty)));
        }

        const sampleSize = 100 + incidentsList.length;
        const { wilsonLower, wilsonUpper } = calculateWilsonInterval(newScore, sampleSize);

        upsertRows.push({
          category_id: catId,
          model_id: modelId,
          score: newScore,
          wilson_lower: wilsonLower,
          wilson_upper: wilsonUpper,
          sample_size: sampleSize,
          last_audited_at: nowStr,
        });
      }
    }

    // 5. Bulk upsert new scores in public.k_model_scores
    const { error: upsertErr } = await supabase
      .from("k_model_scores")
      .upsert(upsertRows, { onConflict: "category_id,model_id" });

    if (upsertErr) throw upsertErr;

    logger.info(`[K-WeeklyRefresh] Successfully refreshed scores for ${models.length} models.`);

    return NextResponse.json({
      success: true,
      models_processed: models.length,
      rows_updated: upsertRows.length,
    });
  } catch (error) {
    logger.error("K-WeeklyRefresh cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("k-weekly-refresh", getHandler);
