import "server-only";
import { logger } from "@/lib/utils/logger";
import { resolveApiKey } from "../api-keys";

const IMAGEN_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";
const REQUEST_TIMEOUT_MS = 60_000;

export class VertexImagenAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("vertex", "VERTEX_API_KEY"));
  }

  async generateImage(
    prompt: string,
    aspectRatio = "1:1",
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
      const response = await fetch(`${IMAGEN_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            outputMimeType: "image/jpeg",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[VertexImagenAdapter] API error: ${response.status}`, {
          errorText,
          latencyMs,
        });
        return {
          ok: false,
          error: `Vertex Imagen API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      const base64 = data.predictions?.[0]?.bytesBase64Encoded;
      const mimeType = data.predictions?.[0]?.mimeType || "image/jpeg";

      if (!base64) {
        return {
          ok: false,
          error: "API did not return base64 image data.",
        };
      }

      return {
        ok: true,
        base64,
        mimeType,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error("[VertexImagenAdapter] Call failed", {}, err instanceof Error ? err : undefined);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown Vertex Imagen API error",
      };
    }
  }
}
