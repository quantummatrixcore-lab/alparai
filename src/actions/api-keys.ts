"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { encryptAtRest, decryptAtRest } from "@/lib/security/vault";

interface DbApiKeyRow {
  provider: string;
  api_key: string;
  tier: string;
  client_type: string;
  created_at: string;
  updated_at: string;
}

export async function getApiKeys() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await (
      admin as unknown as {
        from: (name: string) => {
          select: (cols: string) => {
            order: (col: string) => Promise<{ data: DbApiKeyRow[] | null; error: unknown }>;
          };
        };
      }
    )
      .from("api_keys")
      .select("provider, api_key, tier, client_type, created_at, updated_at")
      .order("provider");

    if (error) throw error;

    // Mask the API keys before returning to the client
    const masked = (data ?? []).map((row) => {
      const decrypted = decryptAtRest(row.api_key);
      let maskedKey = "••••";

      if (row.client_type === "internal") {
        if (decrypted && decrypted.length > 8) {
          maskedKey = `${decrypted.slice(0, 4)}••••${decrypted.slice(-4)}`;
        }
      } else {
        if (decrypted && decrypted.length > 8) {
          maskedKey = `sha256:${decrypted.slice(0, 6)}••••${decrypted.slice(-6)}`;
        }
      }

      return {
        provider: row.provider,
        api_key: maskedKey,
        tier: row.tier,
        client_type: row.client_type,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return { ok: true, data: masked };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch keys";
    return { ok: false, error: msg };
  }
}

export async function saveApiKey(
  provider: string,
  apiKey: string,
  tier: "free" | "developer" | "enterprise" = "developer",
  clientType: "internal" | "external" = "external",
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  if (!provider || !apiKey) {
    return { ok: false, error: "Provider and API Key are required." };
  }

  try {
    const admin = createAdminClient();

    // If external, SHA-256 hash. If internal, AES-256-GCM encrypt at rest.
    let keyToSave = apiKey;
    if (clientType === "external") {
      keyToSave = createHash("sha256").update(apiKey).digest("hex");
    } else {
      keyToSave = encryptAtRest(apiKey);
    }

    const { error } = await (
      admin as unknown as {
        from: (name: string) => {
          upsert: (values: Record<string, unknown>) => Promise<{ error: unknown }>;
        };
      }
    )
      .from("api_keys")
      .upsert({
        provider: provider.toLowerCase(),
        api_key: keyToSave,
        tier,
        client_type: clientType,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    revalidatePath("/[locale]/admin/providers", "page");
    revalidatePath("/[locale]/admin/api-keys", "page");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save key";
    return { ok: false, error: msg };
  }
}

export async function deleteApiKey(provider: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  try {
    const admin = createAdminClient();
    const { error } = await (
      admin as unknown as {
        from: (name: string) => {
          delete: () => {
            eq: (col: string, val: string) => Promise<{ error: unknown }>;
          };
        };
      }
    )
      .from("api_keys")
      .delete()
      .eq("provider", provider.toLowerCase());

    if (error) throw error;

    revalidatePath("/[locale]/admin/providers", "page");
    revalidatePath("/[locale]/admin/api-keys", "page");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete key";
    return { ok: false, error: msg };
  }
}
