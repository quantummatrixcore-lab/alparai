export interface AiProviderConfig {
  slug: string;
  name: string;
  category: "frontier" | "open-weights" | "specialized" | "infrastructure";
}

/**
 * Total active AI Model Providers tracked across ALPAR AI
 * (K-BENCHMARK, incident ingestion, SLA metrics, trust scores)
 */
export const AI_PROVIDERS_COUNT = 47 as const;

export const TRACKED_AI_PROVIDERS: AiProviderConfig[] = [
  { slug: "openai", name: "OpenAI", category: "frontier" },
  { slug: "anthropic", name: "Anthropic", category: "frontier" },
  { slug: "google", name: "Google (Gemini)", category: "frontier" },
  { slug: "meta", name: "Meta (Llama)", category: "open-weights" },
  { slug: "microsoft", name: "Microsoft (Copilot)", category: "frontier" },
  { slug: "xai", name: "xAI (Grok)", category: "frontier" },
  { slug: "mistral", name: "Mistral AI", category: "open-weights" },
  { slug: "cohere", name: "Cohere", category: "frontier" },
  { slug: "deepseek", name: "DeepSeek", category: "open-weights" },
  { slug: "qwen", name: "Alibaba (Qwen)", category: "open-weights" },
  { slug: "nvidia", name: "NVIDIA AI", category: "infrastructure" },
  { slug: "amazon", name: "Amazon (Bedrock/Titan)", category: "infrastructure" },
  { slug: "apple", name: "Apple AI", category: "frontier" },
  { slug: "perplexity", name: "Perplexity AI", category: "specialized" },
  { slug: "character-ai", name: "Character.AI", category: "specialized" },
  { slug: "stability", name: "Stability AI", category: "open-weights" },
  { slug: "groq", name: "Groq", category: "infrastructure" },
  { slug: "ai21", name: "AI21 Labs", category: "specialized" },
  { slug: "reka", name: "Reka AI", category: "specialized" },
  { slug: "inflection", name: "Inflection AI (Pi)", category: "specialized" },
  { slug: "tencent", name: "Tencent (Hunyuan)", category: "open-weights" },
  { slug: "baidu", name: "Baidu (Ernie)", category: "frontier" },
  { slug: "synthesia", name: "Synthesia", category: "specialized" },
  { slug: "heygen", name: "HeyGen", category: "specialized" },
  { slug: "pika", name: "Pika Labs", category: "specialized" },
  { slug: "luma", name: "Luma AI", category: "specialized" },
  { slug: "suno", name: "Suno AI", category: "specialized" },
  { slug: "udio", name: "Udio", category: "specialized" },
  { slug: "runway", name: "Runway ML", category: "specialized" },
  { slug: "midjourney", name: "Midjourney", category: "specialized" },
  { slug: "elevenlabs", name: "ElevenLabs", category: "specialized" },
  { slug: "adobe", name: "Adobe (Firefly)", category: "specialized" },
  { slug: "notion", name: "Notion AI", category: "specialized" },
  { slug: "brave", name: "Brave (Leo)", category: "specialized" },
  { slug: "poe", name: "Poe (Quora)", category: "specialized" },
  { slug: "assemblyai", name: "AssemblyAI", category: "specialized" },
  { slug: "lepton", name: "Lepton AI", category: "infrastructure" },
  { slug: "lightricks", name: "Lightricks", category: "specialized" },
  { slug: "leonardo", name: "Leonardo.Ai", category: "specialized" },
  { slug: "adept", name: "Adept AI", category: "specialized" },
  { slug: "cognition", name: "Cognition (Devin)", category: "specialized" },
  { slug: "harvey", name: "Harvey AI", category: "specialized" },
  { slug: "phind", name: "Phind", category: "specialized" },
  { slug: "poolside", name: "Poolside AI", category: "specialized" },
  { slug: "magic", name: "Magic AI", category: "specialized" },
  { slug: "sambanova", name: "SambaNova", category: "infrastructure" },
  { slug: "cerebras", name: "Cerebras Systems", category: "infrastructure" },
];
