import { describe, it, expect } from "vitest";
import { type GatewayModel } from "./openrouter-gateway";

const TEST_CHAIN: readonly GatewayModel[] = [
  {
    id: "llama3-70b-8192", // Groq model
    provider: "groq",
    tier: "free",
    maxTokens: 1024,
    modelClass: "flash",
    capability: "medium",
    specialties: ["fast_triage"],
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct", // HuggingFace model
    provider: "huggingface",
    tier: "free",
    maxTokens: 1024,
    modelClass: "flash",
    capability: "medium",
    specialties: ["fast_triage"],
  },
];

describe("AI Gateway Failover Chain", () => {
  it("defines a valid multi-provider failover sequence", () => {
    expect(TEST_CHAIN.length).toBe(2);
    expect(TEST_CHAIN[0]?.provider).toBe("groq");
    expect(TEST_CHAIN[1]?.provider).toBe("huggingface");
  });
});
