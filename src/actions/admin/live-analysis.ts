"use server";

import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";

export async function runLiveSystemAnalysis(): Promise<{
  success: boolean;
  data?: {
    overall_score: number;
    [key: string]: unknown;
  };
  error?: string;
}> {
  try {
    // Fetch real context for the LLM
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data: runs } = await supabase
      .from("cross_audit_runs")
      .select("model, latency_ms, score, verdict")
      .limit(5)
      .order("created_at", { ascending: false });
    const { data: costs } = await supabase
      .from("finance_monthly_costs")
      .select("service, budget_usd, amount_usd")
      .limit(5)
      .order("month", { ascending: false });

    const prompt = `
    Sen ALPAR AI platformunun 'Acımasız Testçisi' (QA Architect) olarak hareket eden bir yapay zeka modelisin.
    Senden şu anki sistem metriklerini analiz edip sistem inceleme raporu oluşturmanı istiyorum.
    
    Güncel Performans (Son 5 Denetim):
    ${JSON.stringify(runs, null, 2)}
    
    Güncel Maliyet (Son 5 Bütçe Kaydı):
    ${JSON.stringify(costs, null, 2)}
    
    Lütfen şu 4 ana başlıkta bir JSON çıktısı dön:
    - overall_score (0-100 arası bir sayı)
    - executive_summary (Kısa bir özet)
    - security_flaws (Tespit edilen 2-3 açık veya risk)
    - recommendations (Tavsiye edilen 2 çözüm)
    
    Çıktın SADECE geçerli bir JSON olmalıdır. Başka hiçbir açıklama yazma.
    `;

    const result = await callWithFailover(
      {
        systemPrompt: "You are an expert AI QA Architect. Output valid JSON only.",
        userMessage: prompt,
        temperature: 0.7,
        responseFormat: "json",
      },
      await selectModelByCapability("risk_audit"),
    );

    if (!result.ok) {
      logger.warn(
        "Live System Analysis API key missing or gateway error, returning architecture fallback",
        { error: result.error },
      );
      return {
        success: false,
        error: "Live System Analysis API key missing or gateway error.",
      };
    }

    const rawText = result.data.content.trim();
    const cleanText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanText);
      return { success: true, data: parsed };
    } catch (_parseErr) {
      logger.warn("Live Analysis JSON parse warning, structuring text output", { rawText });
      return {
        success: false,
        error: "Live Analysis JSON parse failed.",
      };
    }
  } catch (err: unknown) {
    logger.error("Live Analysis Error:", undefined, err instanceof Error ? err : undefined);
    return {
      success: false,
      error: "Live Analysis Error: " + (err instanceof Error ? err.message : "Unknown error"),
    };
  }
}
