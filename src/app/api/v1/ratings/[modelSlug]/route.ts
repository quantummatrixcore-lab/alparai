import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ modelSlug: string }> }) {
  try {
    const { modelSlug } = await context.params;
    const supabase = await createServerClient();

    let modelQuery = supabase.from("ai_models").select("id, name, status");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      modelSlug,
    );

    if (isUuid) {
      modelQuery = modelQuery.eq("id", modelSlug);
    } else {
      modelQuery = modelQuery.ilike("name", `%${modelSlug}%`);
    }

    const { data: models, error: modelError } = await modelQuery;
    if (modelError || !models || models.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = models[0];
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const { data: scores, error: scoresError } = await supabase
      .from("k_model_scores")
      .select(
        `
        score,
        wilson_lower,
        wilson_upper,
        sample_size,
        last_audited_at,
        k_categories (
          id,
          name,
          description
        )
      `,
      )
      .eq("model_id", model.id);

    if (scoresError) {
      return NextResponse.json({ error: scoresError.message }, { status: 500 });
    }

    interface DBScoreRecord {
      score: number | string;
      wilson_lower: number | string | null;
      wilson_upper: number | string | null;
      sample_size: number;
      last_audited_at: string;
      k_categories: {
        id: string;
        name: string;
        description: string;
      } | null;
    }

    const formattedScores = ((scores ?? []) as unknown as DBScoreRecord[]).map((s) => ({
      category_id: s.k_categories?.id,
      category_name: s.k_categories?.name,
      score: Number(s.score),
      wilson_interval: {
        lower: s.wilson_lower ? Number(s.wilson_lower) : null,
        upper: s.wilson_upper ? Number(s.wilson_upper) : null,
      },
      sample_size: s.sample_size,
      last_audited_at: s.last_audited_at,
    }));

    const totalScore =
      formattedScores.length > 0
        ? Math.round(
            formattedScores.reduce((sum, item) => sum + item.score, 0) / formattedScores.length,
          )
        : 0;

    return NextResponse.json({
      model_id: model.id,
      model_name: model.name,
      status: model.status,
      composite_score: totalScore,
      ratings: formattedScores,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
