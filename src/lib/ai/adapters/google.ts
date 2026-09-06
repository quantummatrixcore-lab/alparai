import "server-only";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

const GOOGLE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 30_000;

import { resolveApiKey } from "../api-keys";

export class GoogleAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("google", "GEMINI_API_KEY"));
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const apiKey = await resolveApiKey("google", "GEMINI_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: {
          code: "no_api_key",
          message: "GEMINI_API_KEY or GOOGLE_API_KEY is not configured.",
          model: request.model.id,
        },
      };
    }

    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    // Google Gemini REST endpoint format
    // POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
    const model = request.model.id.replace(/^models\//, ""); // Strip models/ prefix if present
    const url = `${GOOGLE_BASE_URL}/${model}:generateContent?key=${apiKey}`;

    const systemInstruction = request.systemPrompt
      ? { parts: [{ text: request.systemPrompt }] }
      : undefined;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.userMessage }] }],
          ...(systemInstruction ? { systemInstruction } : {}),
          generationConfig: {
            maxOutputTokens: request.model.maxTokens,
            temperature: request.temperature ?? 0.3,
            ...(request.responseFormat === "json" ? { responseMimeType: "application/json" } : {}),
          },
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
            message: `Google Gemini rate limit hit on model ${request.model.id}`,
            model: request.model.id,
            statusCode: 429,
          },
        };
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        logger.error("[GoogleAdapter] API error", {
          model: request.model.id,
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
        return {
          ok: false,
          error: {
            code: "api_error",
            message: `Google Gemini API error: ${response.status} ${response.statusText}${errorBody ? ` — ${errorBody.slice(0, 200)}` : ""}`,
            model: request.model.id,
            statusCode: response.status,
          },
        };
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!content) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "Google Gemini returned empty response content.",
            model: request.model.id,
          },
        };
      }

      // Gemini usage metadata
      const promptTokens = data.usageMetadata?.promptTokenCount ?? 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
      const totalTokens = data.usageMetadata?.totalTokenCount ?? promptTokens + completionTokens;

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
            message: `Google Gemini request timed out on model ${request.model.id}`,
            model: request.model.id,
          },
        };
      }

      logger.error(
        "[GoogleAdapter] API call failed",
        { model: request.model.id, latencyMs },
        err instanceof Error ? err : undefined,
      );

      return {
        ok: false,
        error: {
          code: "api_error",
          message: err instanceof Error ? err.message : "Unknown Google Gemini API error",
          model: request.model.id,
        },
      };
    }
  }
}
