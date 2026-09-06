import "server-only";
import OpenAI from "openai";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

const BLACKBOX_BASE_URL = "https://api.blackbox.ai/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

import { resolveApiKey } from "../api-keys";

export class BlackboxAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    return !!(await resolveApiKey("blackbox", "BLACKBOX_API_KEY"));
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const apiKey = await resolveApiKey("blackbox", "BLACKBOX_API_KEY");
    if (!apiKey) {
      return {
        ok: false,
        error: {
          code: "no_api_key",
          message: "BLACKBOX_API_KEY is not configured.",
          model: request.model.id,
        },
      };
    }

    const client = new OpenAI({
      baseURL: BLACKBOX_BASE_URL,
      apiKey,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: MAX_RETRIES,
    });

    const startTime = performance.now();

    try {
      const completion = await client.chat.completions.create({
        model: request.model.id,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userMessage },
        ],
        max_tokens: request.model.maxTokens,
        temperature: request.temperature ?? 0.3,
        ...(request.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const choice = completion.choices[0];
      const content = choice?.message?.content ?? "";

      if (!content) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "Blackbox AI returned empty content.",
            model: request.model.id,
          },
        };
      }

      return {
        ok: true,
        data: {
          content,
          model: completion.model ?? request.model.id,
          usage: {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
          },
          latencyMs,
        },
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);

      if (err instanceof OpenAI.RateLimitError) {
        return {
          ok: false,
          error: {
            code: "rate_limit",
            message: `Rate limited on Blackbox AI: ${request.model.id}`,
            model: request.model.id,
            statusCode: 429,
          },
        };
      }

      if (err instanceof OpenAI.APIConnectionTimeoutError) {
        return {
          ok: false,
          error: {
            code: "timeout",
            message: `Timeout on Blackbox AI: ${request.model.id}`,
            model: request.model.id,
          },
        };
      }

      const statusCode = err instanceof OpenAI.APIError ? err.status : undefined;
      logger.error(
        "[BlackboxAdapter] API call failed",
        { model: request.model.id, latencyMs, statusCode },
        err instanceof Error ? err : undefined,
      );

      return {
        ok: false,
        error: {
          code: "api_error",
          message: err instanceof Error ? err.message : "Unknown Blackbox AI API error",
          model: request.model.id,
          statusCode,
        },
      };
    }
  }
}
