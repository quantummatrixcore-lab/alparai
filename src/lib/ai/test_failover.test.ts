import { callWithFailover, GatewayModel } from "./openrouter-gateway";

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
  }
];

async function runTest() {
  console.log("Starting failover test from Groq -> HuggingFace");
  
  // We'll pass a request. If Groq isn't configured, or throws rate_limit/timeout/etc, it should failover.
  const result = await callWithFailover(
    {
      systemPrompt: "You are a helpful assistant.",
      userMessage: "Test message"
    },
    TEST_CHAIN
  );

  console.log("Result:", JSON.stringify(result, null, 2));
}

runTest().catch(console.error);
