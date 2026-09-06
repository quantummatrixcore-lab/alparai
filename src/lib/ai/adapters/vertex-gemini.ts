import "server-only";
import { logger } from "@/lib/utils/logger";
import { resolveApiKey } from "../api-keys";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const REQUEST_TIMEOUT_MS = 60_000;

export class VertexGeminiAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("vertex", "VERTEX_API_KEY"));
  }

  async generateJson(
    prompt: string,
  ): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
    const apiKey = await resolveApiKey("google_vertex", "VERTEX_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: "Google Vertex key is not configured.",
      };
    }

    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[VertexGeminiAdapter] API error: ${response.status}`, {
          status: response.status,
          error: errorText,
        });
        return {
          ok: false,
          error: `Vertex Gemini API error: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();
      const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        return { ok: false, error: "Empty response from Vertex Gemini." };
      }

      const parsedData = JSON.parse(textContent);

      logger.info("[VertexGeminiAdapter] Text generation completed successfully", {
        latencyMs: Math.round(performance.now() - startTime),
      });

      return {
        ok: true,
        data: parsedData,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error("[VertexGeminiAdapter] Call failed", {}, err instanceof Error ? err : undefined);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown Vertex Gemini API error",
      };
    }
  }
}
