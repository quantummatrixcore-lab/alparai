"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/dehost/admin";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { encryptAtRest, decryptAtRest } from "@/lib/security/vault-server";

interface DbApiKeyRow {
  provider: string;
  api_key: string;
  tier: string;
  client_type: string;
  created_at: string;
  updated_at: string;
}

export async function getApiKeys() {
  try {
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
  } catch (err) {
    console.error("[getApiKeys] Error:", err);
    throw err;
  }
}

export async function saveApiKey(
  provider: string,
  apiKey: string,
  tier: "free" | "developer" | "enterprise" = "developer",
  clientType: "internal" | "external" = "external",
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    if (!provider || !apiKey) {
      return { ok: false, error: "Provider and API Key are required." };
    }

    try {
      const admin = createAdminClient();

      // Query existing key to capture revocation/rotation history (safe check for mock/staging adapters)
      let existingKey: Record<string, unknown> | null = null;
      try {
        const query = (admin as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle?: () => Promise<{ data: Record<string, unknown> | null }> } } } })
          .from("api_keys")
          ?.select?.("id, provider, tier, client_type, updated_at, created_at")
          ?.eq?.("provider", provider.toLowerCase());
        if (query && typeof query.maybeSingle === "function") {
          const res = await query.maybeSingle();
          existingKey = res?.data ?? null;
        }
      } catch {
        // Safe query fallback for minimal test harnesses
      }

      // If external, SHA-256 hash. If internal, AES-256-GCM encrypt at rest.
      let keyToSave = apiKey;
      if (clientType === "external") {
        keyToSave = createHash("sha256").update(apiKey).digest("hex");
      } else {
        keyToSave = encryptAtRest(apiKey);
      }

      if (existingKey) {
        // Record prior key revocation in audit_log to prevent silent rotation
        try {
          const auditTable = (admin as unknown as { from: (t: string) => { insert?: (v: Record<string, unknown>) => Promise<{ error: unknown }> } })
            .from("audit_log");
          if (auditTable && typeof auditTable.insert === "function") {
            await auditTable.insert({
              action: "API_KEY_ROTATED_REVOCATION",
              actor_id: user.id || null,
              entity_type: "api_keys",
              entity_id: String(existingKey.id || provider.toLowerCase()),
              before_data: {
                provider: existingKey.provider,
                tier: existingKey.tier,
                client_type: existingKey.client_type,
                revoked_at: new Date().toISOString(),
                reason: "ROTATION_SUPERSEDED",
              },
              after_data: {
                provider: provider.toLowerCase(),
                tier,
                client_type: clientType,
                rotated_at: new Date().toISOString(),
              },
            });
          }
        } catch {
          // Non-blocking audit fallback
        }
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
  } catch (err) {
    console.error("[saveApiKey] Error:", err);
    throw err;
  }
}

export async function deleteApiKey(provider: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    try {
      const admin = createAdminClient();

      // Record explicit revocation before deletion in audit_log
      try {
        const auditTable = (admin as unknown as { from: (t: string) => { insert?: (v: Record<string, unknown>) => Promise<{ error: unknown }> } })
          .from("audit_log");
        if (auditTable && typeof auditTable.insert === "function") {
          await auditTable.insert({
            action: "API_KEY_REVOKED",
            actor_id: user.id || null,
            entity_type: "api_keys",
            entity_id: provider.toLowerCase(),
            before_data: {
              provider: provider.toLowerCase(),
              revoked_at: new Date().toISOString(),
              reason: "ADMIN_EXPLICIT_REVOCATION",
            },
            after_data: null,
          });
        }
      } catch {
        // Non-blocking audit fallback for minimal test harnesses
      }

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
  } catch (err) {
    console.error("[deleteApiKey] Error:", err);
    throw err;
  }
}

export async function generateInboundClientKey(
  clientName: string,
  tier: "free" | "developer" | "enterprise" | "auditor" = "auditor",
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    if (!clientName.trim()) {
      return { ok: false, error: "Client name is required." };
    }

    const { randomBytes } = await import("crypto");
    const rawKey = `alp_live_${randomBytes(24).toString("hex")}`;
    const providerId = `client_${clientName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "_")}`;
    const hashedKey = createHash("sha256").update(rawKey).digest("hex");

    const admin = createAdminClient();
    const { error } = await (
      admin as unknown as {
        from: (name: string) => {
          upsert: (values: Record<string, unknown>) => Promise<{ error: unknown }>;
        };
      }
    )
      .from("api_keys")
      .upsert({
        provider: providerId,
        api_key: hashedKey,
        tier,
        client_type: "external",
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    revalidatePath("/[locale]/admin/api-keys", "page");
    return { ok: true, rawKey, provider: providerId, clientName };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate inbound key";
    return { ok: false, error: msg };
  }
}
