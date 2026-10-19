/**
 * ALPAR AI — Model Attribution Backfill Engine
 * ============================================================================
 * Closes the "Data Moat" gap: a large share of registry incidents carry no
 * `ai_provider_id`, which means the actuarial TrustScore engine cannot see
 * them and the leaderboard degrades to static baseline scores.
 *
 * Pipeline per incident (cheapest signal first):
 *   1. Deterministic alias match  (free, offline)  -> attribution_method = 'alias'
 *   2. LLM judge                  (optional, --judge) -> attribution_method = 'model'
 *   3. Nothing                    -> needs_provider_review = true (honest, no fabrication)
 *
 * Safety contract:
 *   - Dry-run by default. Writes require an explicit `--execute`.
 *   - Only `ai_provider_id IS NULL` rows are touched. Existing attributions
 *     are never overwritten (use `--force` to reconsider them).
 *   - Every write records the method, the decisive keyword and the confidence
 *     so the attribution remains auditable and reversible.
 *
 * Usage:
 *   npx tsx scripts/model-attribution-backfill.ts --dry-run
 *   npx tsx scripts/model-attribution-backfill.ts --execute --limit 500
 *   npx tsx scripts/model-attribution-backfill.ts --execute --judge
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadEnv(): void {
  try {
    const loader = require("D:/00_MATRIX/vault_loader.js");
    loader("D:/03_ALPARAI");
  } catch (e) {
    console.error("[Vault] Failed to load vault_loader:", e);
  }

  for (const candidate of [".env.local", ".env.production.local", ".env"]) {
    const envPath = path.resolve(process.cwd(), candidate);
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
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
}

loadEnv();

import { createDeHostAdapterClient } from "../src/lib/dehost/dehost-adapter";
import { matchProviderAlias } from "../src/lib/import/provider-alias-map";
import { judgeProviderAttribution } from "../src/lib/import/provider-attribution-judge";

interface IncidentRow {
  id: string;
  title: string | null;
  description: string | null;
  source_url: string | null;
  ai_provider_id: string | null;
  provider_custom_name: string | null;
  model_custom_name: string | null;
}

interface ProviderRow {
  id: string;
  slug: string;
  name: string | null;
}

interface BackfillDecision {
  incidentId: string;
  providerId: string | null;
  providerSlug: string | null;
  modelCustomName: string | null;
  method: "alias" | "model" | null;
  keyword: string | null;
  confidence: number | null;
  needsReview: boolean;
  title: string;
}

const BATCH_SIZE = 25;

function parseArgs(): {
  execute: boolean;
  judge: boolean;
  force: boolean;
  limit: number;
  batchSize: number;
} {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const parsedLimit = limitIdx >= 0 ? Number.parseInt(args[limitIdx + 1] ?? "", 10) : NaN;
  const batchIdx = args.indexOf("--batch");
  const parsedBatch = batchIdx >= 0 ? Number.parseInt(args[batchIdx + 1] ?? "", 10) : NaN;

  return {
    // Writes require an explicit --execute. Everything else is a dry run.
    execute: args.includes("--execute"),
    judge: args.includes("--judge"),
    force: args.includes("--force"),
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 5000,
    batchSize: Number.isFinite(parsedBatch) && parsedBatch > 0 ? parsedBatch : BATCH_SIZE,
  };
}

async function fetchProviders(
  client: ReturnType<typeof createDeHostAdapterClient>,
): Promise<Map<string, { id: string; slug: string; name?: string }>> {
  const { data, error } = await client.from("ai_providers").select("id, slug, name");

  if (error || !data) {
    throw new Error(`Failed to load ai_providers: ${error?.message ?? "unknown error"}`);
  }

  const map = new Map<string, { id: string; slug: string; name?: string }>();
  for (const row of data as unknown as ProviderRow[]) {
    map.set(row.slug, { id: row.id, slug: row.slug, name: row.name ?? undefined });
  }
  return map;
}

async function fetchUnattributed(
  client: ReturnType<typeof createDeHostAdapterClient>,
  limit: number,
  force: boolean,
): Promise<IncidentRow[]> {
  let query = client
    .from("incidents")
    .select(
      "id, title, description, source_url, ai_provider_id, provider_custom_name, model_custom_name",
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!force) {
    query = query.is("ai_provider_id", null);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load incidents: ${error?.message ?? "unknown error"}`);
  }
  return (data as unknown as IncidentRow[]) ?? [];
}

function decide(
  incident: IncidentRow,
  providerMap: Map<string, { id: string; slug: string; name?: string }>,
): BackfillDecision {
  const alias = matchProviderAlias(
    {
      affectedProvider: incident.provider_custom_name ?? incident.model_custom_name ?? null,
      title: incident.title ?? "",
      description: incident.description ?? "",
      sourceUrl: incident.source_url ?? null,
    },
    providerMap,
  );

  if (alias.matched && alias.providerId) {
    const modelCustomName =
      incident.model_custom_name && incident.model_custom_name.trim().length > 0
        ? incident.model_custom_name
        : (alias.attributionKeyword || alias.providerSlug || "AI Model");
    return {
      incidentId: incident.id,
      providerId: alias.providerId,
      providerSlug: alias.providerSlug,
      modelCustomName,
      method: "alias",
      keyword: alias.attributionKeyword,
      confidence: alias.attributionConfidence,
      needsReview: false,
      title: incident.title ?? "",
    };
  }

  return {
    incidentId: incident.id,
    providerId: null,
    providerSlug: null,
    modelCustomName: null,
    method: null,
    keyword: null,
    confidence: null,
    needsReview: true,
    title: incident.title ?? "",
  };
}

async function applyJudge(
  decision: BackfillDecision,
  incident: IncidentRow,
  knownSlugs: string[],
  providerMap: Map<string, { id: string; slug: string; name?: string }>,
): Promise<BackfillDecision> {
  const result = await judgeProviderAttribution(
    {
      title: incident.title ?? "",
      description: incident.description ?? "",
      sourceUrl: incident.source_url ?? null,
    },
    knownSlugs,
    providerMap,
  );

  if (result.matched && result.providerId) {
    return {
      ...decision,
      providerId: result.providerId,
      providerSlug: result.providerSlug,
      method: "model",
      keyword: result.attributionKeyword,
      confidence: result.attributionConfidence,
      needsReview: false,
    };
  }

  return {
    ...decision,
    confidence: result.attributionConfidence ?? decision.confidence,
    needsReview: true,
  };
}

async function writeDecisions(
  client: ReturnType<typeof createDeHostAdapterClient>,
  decisions: BackfillDecision[],
  batchSize: number,
): Promise<{ written: number; failed: number }> {
  let written = 0;
  let failed = 0;

  for (let i = 0; i < decisions.length; i += batchSize) {
    const chunk = decisions.slice(i, i + batchSize);
    for (const decision of chunk) {
      const payload: Record<string, unknown> = {
        ai_provider_id: decision.providerId,
        attribution_method: decision.method,
        attribution_keyword: decision.keyword,
        attribution_confidence: decision.confidence,
        needs_provider_review: decision.needsReview,
        updated_at: new Date().toISOString(),
      };
      if (decision.providerId && decision.modelCustomName) {
        payload.model_custom_name = decision.modelCustomName;
      }

      const { error } = await client
        .from("incidents")
        .update(payload)
        .eq("id", decision.incidentId);

      if (error) {
        failed += 1;
        console.error(`  [FAIL] ${decision.incidentId}: ${error.message}`);
      } else {
        written += 1;
      }
    }
    process.stdout.write(`  ...${Math.min(i + batchSize, decisions.length)}/${decisions.length}\r`);
  }

  return { written, failed };
}

async function main(): Promise<void> {
  const { execute, judge, force, limit, batchSize } = parseArgs();

  const client = createDeHostAdapterClient();

  console.log("=== ALPAR AI — Model Attribution Backfill ===");
  console.log(`mode        : ${execute ? "EXECUTE" : "DRY-RUN"}`);
  console.log(`judge       : ${judge ? "enabled" : "disabled"}`);
  console.log(`force       : ${force ? "yes (reconsider attributed rows)" : "no"}`);
  console.log(`limit       : ${limit}`);
  console.log(`batch size  : ${batchSize}`);

  const providerMap = await fetchProviders(client);
  console.log(`providers   : ${providerMap.size} loaded`);

  const knownSlugs = Array.from(providerMap.keys());
  const incidents = await fetchUnattributed(client, limit, force);
  console.log(`incidents   : ${incidents.length} candidates\n`);

  const decisions: BackfillDecision[] = [];
  for (const incident of incidents) {
    const decision = decide(incident, providerMap);
    if (!decision.needsReview && judge) {
      decisions.push(await applyJudge(decision, incident, knownSlugs, providerMap));
    } else {
      decisions.push(decision);
    }
  }

  const resolved = decisions.filter((d) => d.providerId !== null);
  const aliasResolved = resolved.filter((d) => d.method === "alias");
  const modelResolved = resolved.filter((d) => d.method === "model");
  const unresolved = decisions.filter((d) => d.providerId === null);

  console.log("\n--- Attribution plan ---");
  console.log(`candidates            : ${decisions.length}`);
  console.log(`resolved (alias)      : ${aliasResolved.length}`);
  console.log(`resolved (model)      : ${modelResolved.length}`);
  console.log(`unresolved (review)   : ${unresolved.length}`);
  console.log(
    `coverage              : ${decisions.length ? ((resolved.length / decisions.length) * 100).toFixed(1) : "0.0"}%`,
  );

  const bySlug = new Map<string, number>();
  for (const decision of resolved) {
    const slug = decision.providerSlug ?? "unknown";
    bySlug.set(slug, (bySlug.get(slug) ?? 0) + 1);
  }
  console.log("\n--- Distribution by provider ---");
  for (const [slug, count] of Array.from(bySlug.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug.padEnd(18)} ${count}`);
  }

  if (!execute) {
    console.log("\n[DRY-RUN] No writes performed. Re-run with --execute to persist.");
    console.log("[DRY-RUN] Sample of the first 10 decisions:");
    for (const decision of decisions.slice(0, 10)) {
      console.log(
        `  ${decision.incidentId.slice(0, 8)}  ${(decision.providerSlug ?? "UNRESOLVED").padEnd(16)} ` +
          `${(decision.method ?? "-").padEnd(6)} conf=${decision.confidence ?? "-"}  ${decision.title.slice(0, 60)}`,
      );
    }
    return;
  }

  console.log("\n--- Writing ---");
  const { written, failed } = await writeDecisions(client, decisions, batchSize);
  console.log(`\nwritten  : ${written}`);
  console.log(`failed   : ${failed}`);
  console.log(
    `coverage : ${decisions.length ? ((resolved.length / decisions.length) * 100).toFixed(1) : "0.0"}% of the scanned candidates now carry a provider`,
  );
}

main().catch((error) => {
  console.error("Fatal backfill error:", error);
  process.exit(1);
});
