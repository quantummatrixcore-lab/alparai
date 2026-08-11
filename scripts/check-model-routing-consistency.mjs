#!/usr/bin/env node
/**
 * Routing-chain consistency check (ROUTE-1).
 *
 * The free-tier routing chains live in two places that had no link between
 * them: the escalation tiers in src/lib/audit/model-router.ts, and the
 * ai_routing_chains seed in supabase/migrations/. They drifted apart silently
 * -- at the worst point the seed named 11 model ids of which only 3 existed in
 * the router, leaving two chains pointing at nothing reachable.
 *
 * It failed silently rather than loudly: the router only filtered models
 * flagged inactive, so an id that existed nowhere at all stayed in the chain
 * and was returned as valid. The failure surfaced later, at gateway call time,
 * far from its cause.
 *
 * This check fails when a migration seeds a model id the router does not know.
 * Unlike the baseline-style ratchets in this repo there is nothing to
 * grandfather: a chain pointing at a model that does not exist is never
 * correct, so the allowed count is zero.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ROUTER_PATH = join(ROOT, "src/lib/audit/model-router.ts");
const MIGRATIONS_DIR = join(ROOT, "supabase/migrations");

function routerModelIds() {
  const src = readFileSync(ROUTER_PATH, "utf8");
  const ids = new Set();
  for (const match of src.matchAll(/id:\s*"([^"]+)"/g)) ids.add(match[1]);
  return ids;
}

// Later migrations overwrite earlier ones via ON CONFLICT DO UPDATE, so the
// effective chain for a domain is the one in the newest file that sets it.
function effectiveChains() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const chains = new Map();
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    if (!sql.includes("ai_routing_chains")) continue;

    for (const row of sql.matchAll(/\('([a-z_]+)',\s*'(\[[^']*\])'::jsonb\)/g)) {
      const [, domain, json] = row;
      let models;
      try {
        models = JSON.parse(json);
      } catch {
        continue;
      }
      if (!Array.isArray(models)) continue;
      chains.set(domain, { file, ids: models.map((m) => m.id).filter(Boolean) });
    }
  }
  return chains;
}

const known = routerModelIds();
const chains = effectiveChains();

if (chains.size === 0) {
  console.error("Routing consistency check FAILED — no ai_routing_chains rows found.");
  console.error("Either the seed was removed or this script's parser no longer matches it.");
  process.exit(1);
}

const offenders = [];
for (const [domain, { file, ids }] of chains) {
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length > 0) offenders.push({ domain, file, missing, total: ids.length });
}

if (offenders.length > 0) {
  console.error("Routing consistency check FAILED — chains reference models the router does not define.");
  console.error("Every id in ai_routing_chains must exist in model-router.ts's escalation tiers.");
  console.error("");
  for (const { domain, file, missing, total } of offenders) {
    const dead = missing.length === total ? " [ENTIRE CHAIN UNREACHABLE]" : "";
    console.error(`  ${domain} (${file})${dead}`);
    for (const id of missing) console.error(`      missing: ${id}`);
  }
  console.error("");
  console.error("Fix the seed to name real models, or add the model to the router's tier.");
  process.exit(1);
}

console.log(
  `Routing consistency check passed. ${chains.size} chain(s) verified against ${known.size} known model id(s).`,
);
