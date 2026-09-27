/**
 * @file v64_bridge.ts
 * @module AgiBridge/V64
 * @description Next.js App Router TypeScript wrapper for v64_quota_manager (AGI Intelligence Layer).
 * Dynamically binds to D:\001-AGI\engines\v64_quota_manager.js via Node.js CommonJS bridge.
 * Evaluates Agent ROI to steer models: PRO, FLASH-HIGH, FLASH-MED, SLEEP.
 */

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

/**
 * Target AI model tiers governed by DAG-5 AGI Intelligence Specification.
 */
export type AgentModelTier = "PRO" | "FLASH-HIGH" | "FLASH-MED" | "SLEEP";

/**
 * Input options for agent quota evaluation.
 */
export interface AgentQuotaOptions {
  agentId?: string;
  roi: number;
  iqScore?: number;
}

/**
 * Comprehensive quota evaluation result.
 */
export interface AgentQuotaResult {
  agentId: string;
  roi: number;
  iqScore: number;
  model: AgentModelTier;
  rawModel: string;
  tokens: number;
  status: "ACTIVE" | "SLEEP_MODE" | string;
  allocatedAt: number;
}

/**
 * Quota tier definition shape from v64_quota_manager.
 */
export interface V64QuotaTier {
  model: string;
  tokens: number;
  status: string;
  min_roi: number;
  min_iq: number;
}

/**
 * Underlying v64_quota_manager CommonJS module interface.
 */
export interface V64EngineModule {
  allocateQuota: (
    agentId: string,
    roi: number,
    iqScore: number,
    out?: Record<string, unknown> | null | boolean
  ) => {
    agent_id: string;
    roi: number;
    iq_score: number;
    model: string;
    tokens: number;
    status: string;
    allocated_at: number;
  };
  evaluateQuota: (
    agentId: string,
    roi: number,
    iqScore: number,
    out?: Record<string, unknown> | null | boolean
  ) => {
    agent_id: string;
    roi: number;
    iq_score: number;
    model: string;
    tokens: number;
    status: string;
    allocated_at: number;
  };
  getQuotaReport: (
    options?: boolean | { asString?: boolean }
  ) => Record<string, unknown> | string;
  resetQuotaRegistry: () => void;
  QuotaManager: new () => {
    allocateQuota: (agentId: string, roi: number, iqScore: number, out?: unknown) => unknown;
    getAgentQuota: (agentId: string) => unknown;
    hasAgent: (agentId: string) => boolean;
    removeAgent: (agentId: string) => boolean;
    clear: () => void;
    getQuotaReport: (options?: boolean | { asString?: boolean }) => unknown;
  };
  QUOTA_TIERS: Record<string, V64QuotaTier>;
  ZERO_ALLOC_QUOTA: Record<string, unknown>;
}

/**
 * Default absolute path to the v64 quota manager engine.
 */
export const DEFAULT_V64_ENGINE_PATH = "D:\\001-AGI\\engines\\v64_quota_manager.js";

// Cached engine instance
let cachedEngine: V64EngineModule | null = null;

/**
 * Dynamically resolves and requires the v64_quota_manager CommonJS engine.
 * Includes fallback logic to guarantee high-resilience in CI/CD and edge builds.
 */
export function getV64Engine(): V64EngineModule {
  if (cachedEngine) {
    return cachedEngine;
  }

  const req = typeof require !== "undefined" ? require : createRequire(import.meta.url);

  const candidatePaths = [
    process.env.AGI_V64_ENGINE_PATH,
    DEFAULT_V64_ENGINE_PATH,
    path.resolve(process.cwd(), "../001-AGI/engines/v64_quota_manager.js"),
    path.resolve(process.cwd(), "engines/v64_quota_manager.js")
  ].filter(Boolean) as string[];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        cachedEngine = req(candidate) as V64EngineModule;
        return cachedEngine;
      }
    } catch {
      // Continue searching alternate paths
    }
  }

  // Attempt direct require of the primary engine path
  try {
    cachedEngine = req(DEFAULT_V64_ENGINE_PATH) as V64EngineModule;
    return cachedEngine;
  } catch {
    // Graceful autonomous fallback maintaining exact DAG-5 specification if external disk is unmounted
    cachedEngine = createAutonomousFallbackEngine();
    return cachedEngine;
  }
}

/**
 * Normalizes engine model names to canonical AgentModelTier strings.
 */
function normalizeModelTier(engineModelOrTier: string): AgentModelTier {
  const norm = String(engineModelOrTier).trim().toUpperCase().replace("_", "-");
  if (norm === "PRO" || norm.startsWith("PRO")) {
    return "PRO";
  }
  if (norm === "FLASH-HIGH" || norm === "FLASH_HIGH") {
    return "FLASH-HIGH";
  }
  if (norm === "FLASH-MED" || norm === "FLASH_MED") {
    return "FLASH-MED";
  }
  return "SLEEP";
}

/**
 * Evaluates default IQ score based on ROI to satisfy tier requirements when IQ is omitted.
 */
function getDefaultIqForRoi(roi: number): number {
  if (roi >= 2.0) return 120;
  if (roi >= 1.0) return 100;
  if (roi >= 0.5) return 80;
  return 0;
}

/**
 * Normalizes overloaded input parameters into a standardized tuple.
 */
function parseEvaluationArgs(
  agentIdOrRoiOrOptions: string | number | AgentQuotaOptions,
  maybeRoi?: number,
  maybeIq?: number
): { agentId: string; roi: number; iqScore: number } {
  let agentId = "default_agent";
  let roi = 0;
  let iqScore: number | undefined;

  if (typeof agentIdOrRoiOrOptions === "object" && agentIdOrRoiOrOptions !== null) {
    agentId = agentIdOrRoiOrOptions.agentId || "default_agent";
    roi = typeof agentIdOrRoiOrOptions.roi === "number" ? agentIdOrRoiOrOptions.roi : 0;
    iqScore = agentIdOrRoiOrOptions.iqScore;
  } else if (typeof agentIdOrRoiOrOptions === "number") {
    roi = agentIdOrRoiOrOptions;
    if (typeof maybeRoi === "string") {
      agentId = maybeRoi;
    }
    iqScore = maybeIq;
  } else if (typeof agentIdOrRoiOrOptions === "string") {
    agentId = agentIdOrRoiOrOptions;
    roi = typeof maybeRoi === "number" ? maybeRoi : 0;
    iqScore = maybeIq;
  }

  const finalIq = typeof iqScore === "number" && !Number.isNaN(iqScore)
    ? iqScore
    : getDefaultIqForRoi(roi);

  return { agentId, roi, iqScore: finalIq };
}

/**
 * Core Next.js App Router helper: Evaluates agent quota based on ROI and returns target AI model.
 * 
 * Model Allocation Matrix:
 * - ROI >= 2.0 (IQ >= 120) => PRO
 * - ROI >= 1.0 (IQ >= 100) => FLASH-HIGH
 * - ROI >= 0.5 (IQ >= 80)  => FLASH-MED
 * - ROI <  0.5             => SLEEP
 *
 * @param roi Direct ROI number
 * @returns AgentModelTier ("PRO" | "FLASH-HIGH" | "FLASH-MED" | "SLEEP")
 */
export function evaluateAgentQuota(roi: number): AgentModelTier;
export function evaluateAgentQuota(
  agentId: string,
  roi: number,
  iqScore?: number
): AgentModelTier;
export function evaluateAgentQuota(options: AgentQuotaOptions): AgentModelTier;
export function evaluateAgentQuota(
  agentIdOrRoiOrOptions: string | number | AgentQuotaOptions,
  maybeRoi?: number,
  maybeIq?: number
): AgentModelTier {
  const { agentId, roi, iqScore } = parseEvaluationArgs(
    agentIdOrRoiOrOptions,
    maybeRoi,
    maybeIq
  );

  const engine = getV64Engine();
  const rawResult = engine.evaluateQuota(agentId, roi, iqScore);
  return normalizeModelTier(rawResult.model);
}

/**
 * Evaluates agent quota and returns detailed evaluation metadata.
 */
export function evaluateAgentQuotaDetails(
  agentIdOrRoiOrOptions: string | number | AgentQuotaOptions,
  maybeRoi?: number,
  maybeIq?: number
): AgentQuotaResult {
  const { agentId, roi, iqScore } = parseEvaluationArgs(
    agentIdOrRoiOrOptions,
    maybeRoi,
    maybeIq
  );

  const engine = getV64Engine();
  const rawResult = engine.evaluateQuota(agentId, roi, iqScore);

  return {
    agentId: rawResult.agent_id,
    roi: rawResult.roi,
    iqScore: rawResult.iq_score,
    model: normalizeModelTier(rawResult.model),
    rawModel: rawResult.model,
    tokens: rawResult.tokens,
    status: rawResult.status,
    allocatedAt: rawResult.allocated_at
  };
}

/**
 * Allocates quota in the v64 engine registry and returns the detailed result.
 */
export function allocateAgentQuota(
  agentIdOrOptions: string | AgentQuotaOptions,
  maybeRoi?: number,
  maybeIq?: number
): AgentQuotaResult {
  const { agentId, roi, iqScore } = parseEvaluationArgs(
    agentIdOrOptions,
    maybeRoi,
    maybeIq
  );

  const engine = getV64Engine();
  const rawResult = engine.allocateQuota(agentId, roi, iqScore);

  return {
    agentId: rawResult.agent_id,
    roi: rawResult.roi,
    iqScore: rawResult.iq_score,
    model: normalizeModelTier(rawResult.model),
    rawModel: rawResult.model,
    tokens: rawResult.tokens,
    status: rawResult.status,
    allocatedAt: rawResult.allocated_at
  };
}

/**
 * Retrieves the aggregated JSON quota report from the v64 registry.
 */
export function getQuotaReport(
  options: boolean | { asString?: boolean } = false
): Record<string, unknown> | string {
  const engine = getV64Engine();
  return engine.getQuotaReport(options);
}

/**
 * Resets the in-memory registry of the v64 engine.
 */
export function resetQuotaRegistry(): void {
  const engine = getV64Engine();
  engine.resetQuotaRegistry();
}

/**
 * TypeScript Wrapper Class for Next.js App Router integration.
 */
export class V64AgiBridge {
  private engine: V64EngineModule;

  constructor(customEnginePath?: string) {
    if (customEnginePath) {
      const req = typeof require !== "undefined" ? require : createRequire(import.meta.url);
      this.engine = req(customEnginePath) as V64EngineModule;
    } else {
      this.engine = getV64Engine();
    }
  }

  /**
   * Evaluates the quota for an agent and returns the target AI model.
   */
  public evaluateAgentQuota(
    agentIdOrRoiOrOptions: string | number | AgentQuotaOptions,
    maybeRoi?: number,
    maybeIq?: number
  ): AgentModelTier {
    return evaluateAgentQuota(
      agentIdOrRoiOrOptions as any,
      maybeRoi as any,
      maybeIq as any
    );
  }

  /**
   * Returns complete quota details for the agent.
   */
  public evaluateDetails(
    agentIdOrRoiOrOptions: string | number | AgentQuotaOptions,
    maybeRoi?: number,
    maybeIq?: number
  ): AgentQuotaResult {
    return evaluateAgentQuotaDetails(
      agentIdOrRoiOrOptions as any,
      maybeRoi as any,
      maybeIq as any
    );
  }

  /**
   * Persists allocation in the quota manager registry.
   */
  public allocateQuota(
    agentId: string,
    roi: number,
    iqScore?: number
  ): AgentQuotaResult {
    return allocateAgentQuota(agentId, roi, iqScore);
  }

  /**
   * Fetches the overall quota registry report.
   */
  public getReport(asString: boolean = false): Record<string, unknown> | string {
    return this.engine.getQuotaReport(asString);
  }

  /**
   * Resets registry cache.
   */
  public reset(): void {
    this.engine.resetQuotaRegistry();
  }

  /**
   * Direct access to the raw underlying v64 CommonJS engine module.
   */
  public getRawEngine(): V64EngineModule {
    return this.engine;
  }
}

/**
 * Pre-instantiated singleton instance for Next.js App Router routes and Server Actions.
 */
export const v64Bridge = new V64AgiBridge();

/**
 * Creates autonomous fallback engine instance in zero-dependency environments.
 */
function createAutonomousFallbackEngine(): V64EngineModule {
  const TIERS: Record<string, V64QuotaTier> = {
    PRO: { model: "pro", tokens: 1000000, status: "ACTIVE", min_roi: 2.0, min_iq: 120 },
    FLASH_HIGH: { model: "flash-high", tokens: 500000, status: "ACTIVE", min_roi: 1.0, min_iq: 100 },
    FLASH_MED: { model: "flash-med", tokens: 100000, status: "ACTIVE", min_roi: 0.5, min_iq: 80 },
    SLEEP: { model: "sleep", tokens: 0, status: "SLEEP_MODE", min_roi: 0.0, min_iq: 0 }
  };

  const registry = new Map<string, any>();

  function evalQuota(agentId: string, roi: number, iqScore: number) {
    const cleanRoi = typeof roi === "number" && !Number.isNaN(roi) ? roi : 0;
    const cleanIq = typeof iqScore === "number" && !Number.isNaN(iqScore) ? iqScore : 0;
    let tier = TIERS.SLEEP!;
    if (cleanRoi >= 2.0 && cleanIq >= 120) {
      tier = TIERS.PRO!;
    } else if (cleanRoi >= 1.0 && cleanIq >= 100) {
      tier = TIERS.FLASH_HIGH!;
    } else if (cleanRoi >= 0.5 && cleanIq >= 80) {
      tier = TIERS.FLASH_MED!;
    }
    return {
      agent_id: agentId || "unknown_agent",
      roi: cleanRoi,
      iq_score: cleanIq,
      model: tier.model,
      tokens: tier.tokens,
      status: tier.status,
      allocated_at: Date.now()
    };
  }

  return {
    allocateQuota: (agentId, roi, iq) => {
      const res = evalQuota(agentId, roi, iq);
      registry.set(res.agent_id, res);
      return res;
    },
    evaluateQuota: evalQuota,
    getQuotaReport: (options) => {
      const asString = typeof options === "boolean" ? options : !!(options && options.asString);
      const rep = {
        timestamp: Date.now(),
        total_agents: registry.size,
        agents: Object.fromEntries(registry.entries())
      };
      return asString ? JSON.stringify(rep, null, 2) : rep;
    },
    resetQuotaRegistry: () => registry.clear(),
    QuotaManager: class {
      allocateQuota(id: string, r: number, q: number) { return evalQuota(id, r, q); }
      getAgentQuota(id: string) { return registry.get(id) || null; }
      hasAgent(id: string) { return registry.has(id); }
      removeAgent(id: string) { return registry.delete(id); }
      clear() { registry.clear(); }
      getQuotaReport() { return Object.fromEntries(registry.entries()); }
    } as any,
    QUOTA_TIERS: TIERS,
    ZERO_ALLOC_QUOTA: {}
  };
}
