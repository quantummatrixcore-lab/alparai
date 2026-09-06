import "server-only";
import { logger } from "@/lib/utils/logger";
import { resolveApiKey } from "../api-keys";

// Google Veo REST API endpoint format (v1beta)
const VEO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predict";
const REQUEST_TIMEOUT_MS = 180_000; // Video generation can take up to 3 minutes

export class VertexVeoAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("vertex", "VERTEX_API_KEY"));
  }

  /**
   * Generates a video scene based on a prompt.
   */
  async generateVideo(
    prompt: string,
    aspectRatio = "16:9",
    durationSeconds = 5,
  ): Promise<{ ok: true; base64: string; mimeType: string } | { ok: false; error: string }> {
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
      logger.info("[VertexVeoAdapter] Triggering video generation", {
        prompt: prompt.slice(0, 50),
      });
      const response = await fetch(`${VEO_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            durationSeconds,
            outputMimeType: "video/mp4",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[VertexVeoAdapter] API error: ${response.status}`, {
          errorText,
          latencyMs,
        });
        return {
          ok: false,
          error: `Vertex Veo API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      const base64 = data.predictions?.[0]?.bytesBase64Encoded;
      const mimeType = data.predictions?.[0]?.mimeType || "video/mp4";

      if (!base64) {
        return {
          ok: false,
          error: "API did not return base64 video data.",
        };
      }

      logger.info("[VertexVeoAdapter] Video generation completed successfully", {
        latencyMs,
        mimeType,
      });

      return {
        ok: true,
        base64,
        mimeType,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error("[VertexVeoAdapter] Call failed", {}, err instanceof Error ? err : undefined);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown Vertex Veo API error",
      };
    }
  }
}
