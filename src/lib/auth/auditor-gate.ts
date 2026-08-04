import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function isAuthorizedAuditor(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const apiKey = authHeader.split(" ")[1];
  if (!apiKey) {
    return false;
  }

  // Check env key first
  const auditorEnvKey = process.env.AUDITOR_API_KEY;
  if (auditorEnvKey && apiKey === auditorEnvKey) {
    return true;
  }

  // Check DB keys
  const hashedKey = createHash("sha256").update(apiKey).digest("hex");
  const adminClient = createAdminClient();
  const { data: dbKey } = await adminClient
    .from("api_keys")
    .select("tier")
    .eq("api_key", hashedKey)
    .eq("client_type", "external")
    .maybeSingle();

  if (
    dbKey &&
    (dbKey.tier === "enterprise" || dbKey.tier === "auditor" || dbKey.tier === "developer")
  ) {
    return true;
  }

  return false;
}
