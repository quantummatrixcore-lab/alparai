let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import { createAdminClient } from "@/lib/dehost/admin";


interface DbApiKeyResult {
  api_key: string;
}

function isValidKeyFormat(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 8) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("placeholder") ||
    lower.includes("your_api_key") ||
    lower.includes("dummy") ||
    lower.includes("change_me") ||
    lower.includes("sk-xxx") ||
    lower.includes("xxxx")
  ) {
    return false;
  }
  return true;
}

export async function resolveApiKey(provider: string, envVar: string): Promise<string | null> {
  // 1. Try primary env var (checking vault first)
  const envVal = (vault.read(envVar) ?? process.env[envVar]);
  if (isValidKeyFormat(envVal)) {
    return envVal!;
  }

  // 2. Special fallbacks
  if (provider === "google") {
    if (isValidKeyFormat((vault.read('GEMINI_API_KEY') ?? process.env.GEMINI_API_KEY))) return (vault.read('GEMINI_API_KEY') ?? process.env.GEMINI_API_KEY)!;
    if (isValidKeyFormat((vault.read('GOOGLE_API_KEY') ?? process.env.GOOGLE_API_KEY))) return (vault.read('GOOGLE_API_KEY') ?? process.env.GOOGLE_API_KEY)!;
  }
  if (provider === "nvidia") {
    if (isValidKeyFormat((vault.read('NVIDIA_API_KEY') ?? process.env.NVIDIA_API_KEY))) return (vault.read('NVIDIA_API_KEY') ?? process.env.NVIDIA_API_KEY)!;
    if (isValidKeyFormat((vault.read('NGC_API_KEY') ?? process.env.NGC_API_KEY))) return (vault.read('NGC_API_KEY') ?? process.env.NGC_API_KEY)!;
  }
  if (provider === "openrouter" && isValidKeyFormat((vault.read('OPENROUTER_API_KEY') ?? process.env.OPENROUTER_API_KEY))) {
    return (vault.read('OPENROUTER_API_KEY') ?? process.env.OPENROUTER_API_KEY)!;
  }
  if (provider === "huggingface" && isValidKeyFormat((vault.read('HF_API_KEY') ?? process.env.HF_API_KEY))) {
    return (vault.read('HF_API_KEY') ?? process.env.HF_API_KEY)!;
  }
  if (provider === "groq" && isValidKeyFormat((vault.read('GROQ_API_KEY') ?? process.env.GROQ_API_KEY))) {
    return (vault.read('GROQ_API_KEY') ?? process.env.GROQ_API_KEY)!;
  }
  if (
    (provider === "vertex" || provider === "google_vertex") &&
    isValidKeyFormat((vault.read('VERTEX_API_KEY') ?? process.env.VERTEX_API_KEY))
  ) {
    return (vault.read('VERTEX_API_KEY') ?? process.env.VERTEX_API_KEY)!;
  }

  // 3. Try to read from the public.api_keys table using admin client (bypasses RLS)
  try {
    const admin = createAdminClient();
    const dbProvider = provider === "vertex" ? "google_vertex" : provider;
    const { data } = await (
      admin as unknown as {
        from: (name: string) => {
          select: (cols: string) => {
            eq: (
              col: string,
              val: string,
            ) => {
              single: () => Promise<{ data: DbApiKeyResult | null; error: unknown }>;
            };
          };
        };
      }
    )
      .from("api_keys")
      .select("api_key")
      .eq("provider", dbProvider)
      .single();

    if (data && isValidKeyFormat(data.api_key)) {
      return data.api_key;
    }
  } catch (_err) {
    // Database table query error, fallback to null
  }

  return null;
}
