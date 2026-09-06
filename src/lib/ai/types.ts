/**
 * Unified AI Provider & Model Types.
 * Allows adding multiple API providers (OpenRouter, Cohere, HuggingFace, etc.)
 * by implementing a simple ProviderAdapter interface.
 */

export type TaskDomain =
  | "math_logic"
  | "creative_copy"
  | "risk_audit"
  | "fast_triage"
  | "code_generation"
  | "ethics_audit";

export interface GatewayModel {
  id: string; // The raw model identifier for the provider API
  provider: string; // e.g. "openrouter", "cohere", "huggingface", "google", "nvidia"
  tier: "free" | "premium";
  maxTokens: number;
  modelClass?: "flash" | "pro";
  capability?: "low" | "medium" | "high";
  specialties?: TaskDomain[];
}

export interface GatewayRequest {
  systemPrompt: string;
  userMessage: string;
  model: GatewayModel;
  temperature?: number;
  responseFormat?: "json" | "text";
  imageUrl?: string;
}

export interface GatewayResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export interface GatewayError {
  code:
    | "rate_limit"
    | "timeout"
    | "api_error"
    | "no_api_key"
    | "parse_error"
    | "unsupported_provider"
    | "cost_kill_switch_active";
  message: string;
  model: string;
  statusCode?: number;
}

export type GatewayResult =
  { ok: true; data: GatewayResponse } | { ok: false; error: GatewayError };

export interface ProviderAdapter {
  call(request: GatewayRequest): Promise<GatewayResult>;
  isConfigured(): Promise<boolean>;
}
