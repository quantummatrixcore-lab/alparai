import "server-only";

export type ContextTier = "xs" | "s" | "m" | "l" | "xl";
export type IncidentSeverity = "P0" | "P1" | "P2";

export class ArbitrageEngine {
  /**
   * Routes task to the most cost-effective and high-capability model available.
   * Prioritizes high-throughput free models with graceful fallback.
   */
  static async routeTask(contextSize: ContextTier | string = "m"): Promise<string> {
    const size = contextSize.toLowerCase();

    switch (size) {
      case "xl":
      case "deep":
        // For large context or strategic depth (Atatürk, Turing, Da Vinci)
        return process.env.DEFAULT_LLM_MODEL || "google/gemini-2.0-flash-exp:free";
      case "l":
      case "code":
        return "deepseek/deepseek-chat";
      case "s":
      case "fast":
        return "google/gemini-2.0-flash";
      default:
        return process.env.DEFAULT_LLM_MODEL || "google/gemini-2.0-flash-exp:free";
    }
  }

  /**
   * Resolves optimal model chain based on capability domain.
   */
  static async getOptimalChain(domain: string = "general"): Promise<string[]> {
    if (domain === "security" || domain === "crypto") {
      return [
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-chat",
        "meta-llama/llama-3.3-70b-instruct:free",
      ];
    }
    return [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash",
      "deepseek/deepseek-chat",
    ];
  }

  /**
   * Determines how many Omni-Oracle tabs should be spawned concurrently
   * based on incident severity to prevent RAM exhaustion.
   */
  static getAllocationCount(severity: IncidentSeverity): number {
    switch (severity) {
      case "P0":
        return 16; // Full Swarm Consensus
      case "P1":
        return 5; // Core Committee Consensus
      case "P2":
        return 3; // Fast Triage
      default:
        return 3;
    }
  }
}
