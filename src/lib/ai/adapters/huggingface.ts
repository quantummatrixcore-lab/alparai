import "server-only";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

const HF_CHAT_URL = "https://api-inference.huggingface.co/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 35_000; // HuggingFace serverless startup might take a bit longer

import { resolveApiKey } from "../api-keys";

export class HuggingFaceAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("huggingface", "HUGGINGFACE_API_KEY"));
  }

  async generateImage(
    prompt: string,
    _aspectRatio: string = "1:1",
  ): Promise<{ ok: boolean; base64?: string; mimeType?: string; error?: string }> {
    const apiKey = await resolveApiKey("huggingface", "HUGGINGFACE_API_KEY");
    if (!apiKey) {
      return { ok: false, error: "HUGGINGFACE_API_KEY is not configured." };
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("[HuggingFaceAdapter] generateImage failed", {
          status: response.status,
          errorText,
        });
        return { ok: false, error: `HF Image API error: ${response.status} ${errorText}` };
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      // Default to jpeg if huggingface didn't specify exactly, or pass the header
      const mimeType = response.headers.get("content-type") || "image/jpeg";

      return { ok: true, base64, mimeType };
    } catch (error) {
      logger.error(
        "[HuggingFaceAdapter] generateImage exception",
        undefined,
        error instanceof Error ? error : undefined,
      );
      return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const apiKey = await resolveApiKey("huggingface", "HUGGINGFACE_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: {
          code: "no_api_key",
          message: "HUGGINGFACE_API_KEY is not configured.",
          model: request.model.id,
        },
      };
    }

    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(HF_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: request.model.id,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userMessage },
          ],
          max_tokens: request.model.maxTokens,
          temperature: request.temperature ?? 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.status === 429) {
        return {
          ok: false,
          error: {
            code: "rate_limit",
            message: `HuggingFace rate limit hit on model ${request.model.id}`,
            model: request.model.id,
            statusCode: 429,
          },
        };
      }

      // Handle serverless cold starts (503 Service Unavailable)
      if (response.status === 503) {
        return {
          ok: false,
          error: {
            code: "rate_limit", // Treat 503 as rate_limit so the failover cycles to the next model
            message: `HuggingFace model is currently loading (503): ${request.model.id}`,
            model: request.model.id,
            statusCode: 503,
          },
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: `HuggingFace API error: ${response.status} ${response.statusText}`,
            model: request.model.id,
            statusCode: response.status,
          },
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      if (!content) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "HuggingFace returned empty response content.",
            model: request.model.id,
          },
        };
      }

      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;
      const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens;

      return {
        ok: true,
        data: {
          content,
          model: request.model.id,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens,
          },
          latencyMs,
        },
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          ok: false,
          error: {
            code: "timeout",
            message: `HuggingFace request timed out on model ${request.model.id}`,
            model: request.model.id,
          },
        };
      }

      logger.error(
        "[HuggingFaceAdapter] API call failed",
        { model: request.model.id, latencyMs },
        err instanceof Error ? err : undefined,
      );

      return {
        ok: false,
        error: {
          code: "api_error",
          message: err instanceof Error ? err.message : "Unknown HuggingFace API error",
          model: request.model.id,
        },
      };
    }
  }
}
