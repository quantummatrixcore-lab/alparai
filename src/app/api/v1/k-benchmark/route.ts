import { NextResponse } from "next/server";
import { getKBenchmarkScores } from "@/lib/k-benchmark-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("model");

    if (modelId) {
      const sanitizedModel = modelId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
      const models = await getKBenchmarkScores(sanitizedModel);
      const found = models[0];

      if (!found) {
        return NextResponse.json(
          { ok: false, error: "Model not found in K-BENCHMARK index." },
          { status: 404 },
        );
      }
      return NextResponse.json({
        ok: true,
        timestamp: new Date().toISOString(),
        model: found,
      });
    }

    const allModels = await getKBenchmarkScores();

    return NextResponse.json({
      ok: true,
      version: "v1.0.0",
      standard: "K-BENCHMARK EU AI Act Accountability Standard",
      totalModelsIndexed: allModels.length,
      timestamp: new Date().toISOString(),
      models: allModels,
    });
  } catch (error) {
    console.error("K-Benchmark API error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
