import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generateAndSaveProviderToken(
  incidentId: string,
  email: string,
): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("provider_response_tokens").insert({
    incident_id: incidentId,
    token_hash: tokenHash,
    email: email.toLowerCase().trim(),
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to save provider token: ${error.message}`);
  }

  return rawToken;
}

export async function verifyProviderTokenDb(
  incidentId: string,
  email: string,
  token: string,
): Promise<boolean> {
  if (!token || token.length !== 64) {
    return false;
  }

  const tokenHash = hashToken(token);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("provider_response_tokens")
    .select("id")
    .eq("incident_id", incidentId)
    .eq("email", email.toLowerCase().trim())
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

export async function consumeProviderTokenDb(
  incidentId: string,
  email: string,
  token: string,
): Promise<boolean> {
  if (!token || token.length !== 64) {
    return false;
  }

  const tokenHash = hashToken(token);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("provider_response_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("incident_id", incidentId)
    .eq("email", email.toLowerCase().trim())
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}
