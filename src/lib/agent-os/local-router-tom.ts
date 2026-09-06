import { z } from "zod";

/**
 * ENGINE TOM - Local/Edge Orchestration Router
 * Dış LLM API'leri yerine yerel model (Qwen vb.) kullanılarak
 * katı şemalar (Zod) ile niyet (intent) ayrıştıran yönlendirici motor.
 */

// Katı Pydantic/Zod Şema Sözleşmesi
export const TomIntentSchema = z.object({
  intentType: z.enum(["REFACTOR", "BUGFIX", "FEATURE", "SECURITY_AUDIT"]),
  complexity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  targetEngine: z.enum(["HEPHAESTUS", "TCSFL", "DIRECT_BYPASS"]),
  contextPayload: z.record(z.any()),
  estimatedTokens: z.number().optional(),
});

export type TomIntent = z.infer<typeof TomIntentSchema>;

/**
 * Gelen kullanıcı isteğini (prompt) ayrıştırıp hedef motoru belirler.
 * Simüle edilmiş Local LLM / gRPC isteği mantığı içerir.
 */
export async function routeRequestLocal(prompt: string): Promise<TomIntent> {
  console.info(`[TOM Router] Analyzing prompt locally: ${prompt.slice(0, 50)}...`);

  // Burada yerel vLLM (Qwen-7B) çağrısı yapılır ve JSON formatlama zorlanır.
  // Prototip amaçlı deterministik kural seti:

  const isSyntaxFix =
    prompt.toLowerCase().includes("syntax") || prompt.toLowerCase().includes("lint");

  if (isSyntaxFix) {
    // Zero-LLM Bypass (TCSFL Short-Circuit)
    return {
      intentType: "BUGFIX",
      complexity: "LOW",
      targetEngine: "DIRECT_BYPASS",
      contextPayload: { requiresCodeSynth: false },
    };
  }

  // Varsayılan Hephaestus Kod Sentezi Hattı
  return {
    intentType: "FEATURE",
    complexity: "HIGH",
    targetEngine: "HEPHAESTUS",
    contextPayload: { requiresCodeSynth: true, astValidationRequired: true },
  };
}
