import { createAdminClient } from "@/lib/supabase/admin";

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
  // 1. Try primary env var
  const envVal = process.env[envVar];
  if (isValidKeyFormat(envVal)) {
    return envVal!;
  }

  // 2. Special fallbacks
  if (provider === "google") {
    if (isValidKeyFormat(process.env.GEMINI_API_KEY)) return process.env.GEMINI_API_KEY!;
    if (isValidKeyFormat(process.env.GOOGLE_API_KEY)) return process.env.GOOGLE_API_KEY!;
  }
  if (provider === "nvidia") {
    if (isValidKeyFormat(process.env.NVIDIA_API_KEY)) return process.env.NVIDIA_API_KEY!;
    if (isValidKeyFormat(process.env.NGC_API_KEY)) return process.env.NGC_API_KEY!;
  }
  if (provider === "openrouter" && isValidKeyFormat(process.env.OPENROUTER_API_KEY)) {
    return process.env.OPENROUTER_API_KEY!;
  }
  if (provider === "huggingface" && isValidKeyFormat(process.env.HF_API_KEY)) {
    return process.env.HF_API_KEY!;
  }
  if (
    (provider === "vertex" || provider === "google_vertex") &&
    isValidKeyFormat(process.env.VERTEX_API_KEY)
  ) {
    return process.env.VERTEX_API_KEY!;
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
