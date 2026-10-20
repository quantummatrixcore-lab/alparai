/**
 * ALPAR AI — Actuarial TrustScore Recalculation (operational)
 * ============================================================================
 * Recomputes the actuarial TrustScore for every provider and writes it to BOTH
 *   1. `vendor_trust_rankings`  — the actuarial ledger
 *   2. `ai_providers.trust_score` — the column every public consumer reads
 *      (leaderboard, /api/v1/stats, /api/widget/trust-score, /api/badge,
 *      provider detail pages)
 *
 * It uses `src/lib/trust/compute-metric.ts`, the SAME pure module the
 * Server Action uses, so the published score and the dashboard score can never
 * diverge.
 *
 * Usage:
 *   npx tsx scripts/recalculate-trust-scores.ts --dry-run
 *   npx tsx scripts/recalculate-trust-scores.ts --execute
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { createRequire } from "node:module";

import { createDeHostAdapterClient } from "../src/lib/dehost/dehost-adapter";
import { computeTrustMetric, type TrustIncidentRecord } from "../src/lib/trust/compute-metric";
import { calculateRankingTier } from "../src/lib/ranking/calculate-tier";

interface ProviderRow {
  id: string;
  slug: string;
  name: string;
  is_verified: boolean;
}

function loadEnv(): void {
  // 1) Matrix vault (DPAPI) — the canonical secret source on this workstation.
  try {
    const requireCjs = createRequire(path.join(process.cwd(), "package.json"));
    const loader = requireCjs("D:/00_MATRIX/vault_loader.js");
    loader(process.cwd());
  } catch (error) {
    console.warn(
      "[recalculate] Vault loader unavailable:",
      error instanceof Error ? error.message : String(error),
    );
  }

  // 2) Local env files.
  for (const candidate of [".env.local", ".env.production.local", ".env"]) {
    const envPath = path.resolve(process.cwd(), candidate);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      if (line.startsWith("#") || !line.trim()) continue;
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2] ?? "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }

  // 3) Explicit connection overrides (applied AFTER the vault so they win).
  //    Used to reach the database through an SSH tunnel:
  //      ssh -p 18222 -L 55432:127.0.0.1:5432 root@<host>
  //      npx tsx scripts/recalculate-trust-scores.ts --db-port 55432
  const args = process.argv.slice(2);
  const hostIdx = args.indexOf("--db-host");
  const portIdx = args.indexOf("--db-port");
  if (hostIdx >= 0 && args[hostIdx + 1]) {
    process.env.DEHOST_HOST = args[hostIdx + 1];
    delete process.env.DATABASE_URL;
  }
  if (portIdx >= 0 && args[portIdx + 1]) {
    process.env.DEHOST_PORT = args[portIdx + 1];
    delete process.env.DATABASE_URL;
  }
}

loadEnv();

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const client = createDeHostAdapterClient();

  console.log("=== ALPAR AI — Actuarial TrustScore Recalculation ===");
  console.log(`mode: ${execute ? "EXECUTE" : "DRY-RUN"}`);

  const { data: providers, error: providersErr } = await client
    .from("ai_providers")
    .select("id, slug, name, is_verified");

  if (providersErr || !providers) {
    throw new Error(`Failed to load providers: ${providersErr?.message ?? "unknown"}`);
  }
  const providerRows = providers as unknown as ProviderRow[];
  console.log(`providers: ${providerRows.length}`);

  const { data: incidentRows, error: incidentsErr } = await client
    .from("incidents")
    .select("id, ai_provider_id, severity, created_at, vendor_response_at, status");

  if (incidentsErr) {
    throw new Error(`Failed to load incidents: ${incidentsErr.message}`);
  }

  const published = (
    incidentRows as unknown as Array<
      TrustIncidentRecord & { ai_provider_id: string | null; status: string }
    >
  ).filter((i) => i.status === "published" && i.ai_provider_id);

  const byProvider = new Map<string, TrustIncidentRecord[]>();
  for (const incident of published) {
    const list = byProvider.get(incident.ai_provider_id!) ?? [];
    list.push(incident);
    byProvider.set(incident.ai_provider_id!, list);
  }
  console.log(`published incidents: ${published.length}`);

  const now = Date.now();
  const metrics = providerRows.map((provider) => {
    const metric = computeTrustMetric(
      {
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        is_verified: !!provider.is_verified,
      },
      byProvider.get(provider.id) ?? [],
      now,
    );
    return { ...metric, ranking_tier: calculateRankingTier(metric.composite_score) };
  });

  const withIncidents = metrics.filter((m) => m.total_incidents > 0);
  console.log(`providers with incidents: ${withIncidents.length}`);

  console.log("\n--- Top 12 by incident volume ---");
  for (const metric of [...metrics]
    .sort((a, b) => b.total_incidents - a.total_incidents)
    .slice(0, 12)) {
    console.log(
      `  ${metric.provider_name.padEnd(22)} inc=${String(metric.total_incidents).padEnd(5)} ` +
        `resolved=${String(metric.resolved_incidents).padEnd(5)} ` +
        `penalty=${String(metric.incident_penalty).padEnd(8)} ` +
        `score=${String(metric.composite_score).padEnd(6)} tier=${metric.ranking_tier}`,
    );
  }

  if (!execute) {
    console.log("\n[DRY-RUN] No writes performed. Re-run with --execute to persist.");
    return;
  }

  const upsertPayload = metrics.map((m) => ({
    provider_slug: m.provider_slug,
    provider_name: m.provider_name,
    composite_score: m.composite_score,
    incident_penalty: m.incident_penalty,
    response_rate_bonus: m.response_rate_bonus,
    ranking_tier: m.ranking_tier,
    last_evaluated_at: new Date().toISOString(),
  }));

  const { error: upsertErr } = await (
    client.from("vendor_trust_rankings" as never) as unknown as {
      upsert: (
        data: Record<string, unknown>[],
        options: { onConflict: string },
      ) => Promise<{ error: { message: string } | null }>;
    }
  ).upsert(upsertPayload, { onConflict: "provider_slug" });

  if (upsertErr) {
    throw new Error(`vendor_trust_rankings upsert failed: ${upsertErr.message}`);
  }
  console.log(`\nvendor_trust_rankings : ${upsertPayload.length} rows upserted`);

  const idsBySlug = new Map(providerRows.map((p) => [p.slug, p.id]));
  let mirrored = 0;
  for (const metric of metrics) {
    const providerId = idsBySlug.get(metric.provider_slug);
    if (!providerId) continue;
    const { error } = await client
      .from("ai_providers")
      .update({ trust_score: metric.composite_score })
      .eq("id", providerId);
    if (error) {
      console.error(`  [FAIL] ${metric.provider_slug}: ${error.message}`);
    } else {
      mirrored += 1;
    }
  }
  console.log(`ai_providers.trust_score : ${mirrored} providers updated`);
  console.log("\nDone. The public leaderboard now serves data-derived scores.");
}

main().catch((error) => {
  console.error("FATAL:", error);
  process.exit(1);
});
