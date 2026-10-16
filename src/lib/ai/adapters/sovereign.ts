let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import OpenAI from "openai";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";


// Sovereign ErcuOS & DeHost Internal Bridge:
// Env precedence: ERCUOS_API_URL -> AI_GATEWAY_URL -> default local Ollama/ErcuOS on DeHost container network
const SOVEREIGN_BASE_URL =
  (vault.read('ERCUOS_API_URL') ?? process.env.ERCUOS_API_URL) ||
  (vault.read('AI_GATEWAY_URL') ?? process.env.AI_GATEWAY_URL) ||
  "http://127.0.0.1:11434/v1";
const SOVEREIGN_API_KEY =
  (vault.read('ERCUOS_API_KEY') ?? process.env.ERCUOS_API_KEY) ||
  (vault.read('AI_GATEWAY_KEY') ?? process.env.AI_GATEWAY_KEY) ||
  "sovereign-internal";
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 0;

export class SovereignAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    return true;
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const client = new OpenAI({
      baseURL: SOVEREIGN_BASE_URL,
      apiKey: SOVEREIGN_API_KEY,
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
        max_tokens: Math.min(request.model.maxTokens, 2048),
        temperature: request.temperature ?? 0.3,
        ...(request.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const content = completion.choices[0]?.message?.content ?? "";
      if (!content) {
        return {
          ok: false,
          error: { code: "api_error", message: "Sovereign (Ollama) returned empty content.", model: request.model.id },
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
      logger.warn(`[Sovereign] Yerel model hatasi (${request.model.id}) [${latencyMs}ms]: ${(err as Error).message}`);
      return {
        ok: false,
        error: {
          code: "api_error",
          message: `Sovereign unreachable: ${(err as Error).message}`,
          model: request.model.id,
        },
      };
    }
  }
}
