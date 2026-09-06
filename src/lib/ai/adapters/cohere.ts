import "server-only";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

const COHERE_API_URL = "https://api.cohere.com/v2/chat";
const REQUEST_TIMEOUT_MS = 30_000;

import { resolveApiKey } from "../api-keys";

export class CohereAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("cohere", "COHERE_API_KEY"));
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const apiKey = await resolveApiKey("cohere", "COHERE_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: {
          code: "no_api_key",
          message: "COHERE_API_KEY is not configured.",
          model: request.model.id,
        },
      };
    }

    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(COHERE_API_URL, {
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
            message: `Cohere rate limit hit on model ${request.model.id}`,
            model: request.model.id,
            statusCode: 429,
          },
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: `Cohere API error: ${response.status} ${response.statusText}`,
            model: request.model.id,
            statusCode: response.status,
          },
        };
      }

      const data = await response.json();
      const contentParts = data.message?.content;
      let content = "";
      if (Array.isArray(contentParts)) {
        content = contentParts.map((p) => p.text).join("");
      } else if (typeof contentParts === "string") {
        content = contentParts;
      }

      if (!content) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "Cohere returned empty response content.",
            model: request.model.id,
          },
        };
      }

      const inputTokens = data.usage?.tokens?.input_tokens ?? 0;
      const outputTokens = data.usage?.tokens?.output_tokens ?? 0;

      return {
        ok: true,
        data: {
          content,
          model: request.model.id,
          usage: {
            promptTokens: inputTokens,
            completionTokens: outputTokens,
            totalTokens: inputTokens + outputTokens,
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
            message: `Cohere request timed out on model ${request.model.id}`,
            model: request.model.id,
          },
        };
      }

      logger.error(
        "[CohereAdapter] API call failed",
        { model: request.model.id, latencyMs },
        err instanceof Error ? err : undefined,
      );

      return {
        ok: false,
        error: {
          code: "api_error",
          message: err instanceof Error ? err.message : "Unknown Cohere API error",
          model: request.model.id,
        },
      };
    }
  }
}
