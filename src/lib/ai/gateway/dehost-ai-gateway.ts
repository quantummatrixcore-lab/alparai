import "server-only";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

export class DeHostAIGatewayAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    // DeHost AI Gateway requires either an environment variable setup or just defaults if deployed on DeHost
    // For this pilot adapter, we assume it's always configured if the SDK is present
    return true;
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const startTime = performance.now();

    try {
      // DeHost AI Gateway supports routing via model strings like `provider.model` or mapping directly
      // In @ai-sdk/gateway, we just pass the model id, e.g. "openai/gpt-4o"
      const modelIdentifier = request.model.id;

      const { text, usage } = await generateText({
        model: gateway(modelIdentifier) as unknown as Parameters<typeof generateText>[0]["model"],
        system: request.systemPrompt,
        prompt: request.userMessage,
        temperature: request.temperature ?? 0.3,
        ...(request.responseFormat === "json" ? { responseFormat: "json" } : {}),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!text) {
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "DeHost AI Gateway returned empty content.",
            model: request.model.id,
          },
        };
      }

      return {
        ok: true,
        data: {
          content: text,
          model: request.model.id,
          usage: {
            promptTokens: usage
              ? ((usage as unknown as Record<string, number>).promptTokens ?? 0)
              : 0,
            completionTokens: usage
              ? ((usage as unknown as Record<string, number>).completionTokens ?? 0)
              : 0,
            totalTokens: usage?.totalTokens ?? 0,
          },
          latencyMs,
        },
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);

      const errorMessage = err instanceof Error ? err.message : String(err);

      // Generic error handling
      logger.error("[DeHostAIGatewayAdapter] Request failed", {
        error: errorMessage,
        model: request.model.id,
        latencyMs,
      });

      return {
        ok: false,
        error: {
          code: "api_error",
          message: errorMessage || "DeHost AI Gateway error",
          model: request.model.id,
        },
      };
    }
  }
}
