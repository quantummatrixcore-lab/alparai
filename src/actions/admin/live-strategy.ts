"use server";

import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";

export async function runLiveStrategyAnalysis(context: {
  strengths: number;
  weaknesses: number;
  opportunities: number;
  threats: number;
  highRisks: number;
  activeRisks: number;
  doneMilestones: number;
  totalMilestones: number;
}) {
  try {
    const prompt = `
    Sen ALPAR AI platformunun 'Strateji Danışmanı' (Strategy AI) olarak hareket eden bir yapay zeka modelisin.
    Mevcut strateji metrikleri şunlardır:
    - SWOT: Güçlü Yönler: ${context.strengths}, Zayıf Yönler: ${context.weaknesses}, Fırsatlar: ${context.opportunities}, Tehditler: ${context.threats}
    - Riskler: Yüksek Risk: ${context.highRisks}, Aktif Risk: ${context.activeRisks}
    - Kilometre Taşları: Tamamlanan: ${context.doneMilestones} / Toplam: ${context.totalMilestones}

    Lütfen bu gerçek verileri ve metrikleri derinlemesine analiz ederek gerçekçi ve eyleme dönüştürülebilir profesyonel bir stratejik durum raporu oluştur.
    
    Lütfen şu 4 ana başlıkta bir JSON çıktısı dön:
    - health_score (0-100 arası bir sayı)
    - executive_summary (Kısa bir özet)
    - strategic_gaps (Tespit edilen 2-3 stratejik boşluk veya zayıflık)
    - recommendations (Tavsiye edilen 2 stratejik hamle)
    
    Çıktın SADECE geçerli bir JSON olmalıdır. Başka hiçbir açıklama yazma.
    `;

    const result = await callWithFailover(
      {
        systemPrompt:
          "Sen ALPAR AI platformunun 'Strateji Danışmanı' (Strategy AI) olarak hareket eden bir uzman modelisin. Lütfen çıktıyı yalnızca JSON formatında ver.",
        userMessage: prompt,
        temperature: 0.7,
        responseFormat: "json",
      },
      await selectModelByCapability("math_logic"),
    );

    if (!result.ok) {
      logger.error("Live Strategy API key missing or gateway error", {
        error: result.error,
      });
      return {
        success: false,
        error:
          "Yapay zeka analizi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin veya API bağlantılarını kontrol edin.",
      };
    }

    const rawText = result.data.content.trim();
    const cleanText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanText);
    return { success: true, data: parsed };
  } catch (err: unknown) {
    logger.error("Live Strategy Error:", undefined, err instanceof Error ? err : undefined);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.",
    };
  }
}
