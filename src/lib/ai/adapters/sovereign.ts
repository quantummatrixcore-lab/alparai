let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}
import "server-only";
import OpenAI from "openai";
import { logger } from "@/lib/utils/logger";
import type { ProviderAdapter, GatewayRequest, GatewayResult } from "../types";

// Sovereign ErcuOS & DeHost Internal Bridge:
// Env precedence: ERCUOS_API_URL -> AI_GATEWAY_URL
function getSovereignConfig(): { baseUrl: string | null; apiKey: string | null } {
  const baseUrl =
    (vault.read("ERCUOS_API_URL") ?? process.env.ERCUOS_API_URL) ||
    (vault.read("AI_GATEWAY_URL") ?? process.env.AI_GATEWAY_URL) ||
    ((vault.read("NODE_ENV") ?? process.env.NODE_ENV) === "production"
      ? null
      : "http://127.0.0.1:11434/v1");

  const apiKey =
    (vault.read("ERCUOS_API_KEY") ?? process.env.ERCUOS_API_KEY) ||
    (vault.read("AI_GATEWAY_KEY") ?? process.env.AI_GATEWAY_KEY) ||
    ((vault.read("NODE_ENV") ?? process.env.NODE_ENV) === "production"
      ? null
      : "sovereign-dev-token");

  return { baseUrl, apiKey };
}

// Socrates Hardened Gate Limits:
const REQUEST_TIMEOUT_MS = 8_000; // P0 fix: reduced from 60s to prevent edge starvation
const MAX_RETRIES = 1; // 1 idempotent retry

// Circuit Breaker State (RAM In-Memory)
let consecutiveFailures = 0;
let circuitOpenUntil = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 30_000;

// Probe result cache (60s TTL): isConfigured() sits on hot paths; a live
// 1s fetch per call would queue requests behind probe latency.
let probeCache: { value: boolean; expiresAt: number } | null = null;
const PROBE_CACHE_TTL_MS = 60_000;

export class SovereignAdapter implements ProviderAdapter {
  async isConfigured(): Promise<boolean> {
    const { baseUrl, apiKey } = getSovereignConfig();
    if (!baseUrl || !apiKey) return false;

    // Check circuit breaker
    if (Date.now() < circuitOpenUntil) {
      return false;
    }

    const now = Date.now();
    if (probeCache && probeCache.expiresAt > now) {
      return probeCache.value;
    }

    // Active lightweight probe (1s timeout)
    try {
      const probeUrl = baseUrl.replace(/\/v1\/?$/, "") + "/api/tags";
      const res = await fetch(probeUrl, {
        method: "GET",
        signal: AbortSignal.timeout(1000),
      });
      probeCache = { value: res.ok, expiresAt: now + PROBE_CACHE_TTL_MS };
      return res.ok;
    } catch {
      // Fallback: If root probe fails or path is custom, return false if unreachable
      probeCache = { value: false, expiresAt: now + PROBE_CACHE_TTL_MS };
      return false;
    }
  }

  async call(request: GatewayRequest): Promise<GatewayResult> {
    const { baseUrl, apiKey } = getSovereignConfig();
    if (!baseUrl || !apiKey) {
      return {
        ok: false,
        error: {
          code: "no_api_key",
          message: "Sovereign bridge unconfigured: missing ERCUOS_API_URL or ERCUOS_API_KEY.",
          model: request.model.id,
        },
      };
    }

    if (Date.now() < circuitOpenUntil) {
      return {
        ok: false,
        error: {
          code: "api_error",
          message: `Sovereign bridge circuit breaker open until ${new Date(circuitOpenUntil).toISOString()}`,
          model: request.model.id,
        },
      };
    }

    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
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
        consecutiveFailures++;
        if (consecutiveFailures >= FAILURE_THRESHOLD) {
          circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
          logger.error("[Sovereign] Circuit breaker opened due to repeated empty contents.");
        }
        return {
          ok: false,
          error: {
            code: "api_error",
            message: "Sovereign (Ollama) returned empty content.",
            model: request.model.id,
          },
        };
      }

      // Reset on success
      consecutiveFailures = 0;

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
      consecutiveFailures++;
      if (consecutiveFailures >= FAILURE_THRESHOLD) {
        circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
        logger.error(
          `[Sovereign] Circuit breaker opened due to consecutive failures (${consecutiveFailures}).`,
        );
      }

      logger.warn(
        `[Sovereign] Bridge call failed (${request.model.id}) [${latencyMs}ms]: ${(err as Error).message}`,
      );
      return {
        ok: false,
        error: {
          code: "api_error",
          message: `Sovereign unreachable or timed out: ${(err as Error).message}`,
          model: request.model.id,
        },
      };
    }
  }
}
