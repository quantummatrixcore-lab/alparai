"use strict";
const fs = require("fs");
const path = require("path");

console.log("[PWD]", process.cwd());

const srcPath = "D:/Dev_Root/Temp/opencode/pgtest/demo_seeds.sql";
const content = fs.readFileSync(srcPath, "utf8");

// Extract all clean INSERT statements
const insertRegex = /insert\s+into\s+([a-z0-9_]+\.[a-z0-9_]+)[\s\S]*?;/gi;
const matches = [...content.matchAll(insertRegex)];

const tableMap = new Map();
for (const m of matches) {
  const tbl = m[1].toLowerCase();
  const sql = m[0].trim();
  if (!tableMap.has(tbl)) tableMap.set(tbl, []);
  tableMap.get(tbl).push(sql);
}

console.log(`[EXTRACT] Found ${matches.length} INSERT statements across ${tableMap.size} tables.`);

const orderedTables = [
  "auth.users",
  "public.system_flags",
  "storage.buckets",
  "public.users",
  "public.ai_providers",
  "public.ai_models",
  "public.ai_polls",
  "public.incidents",
  "public.incident_comments",
  "public.bounty_badges",
  "public.ecosystem_news",
  "public.social_templates",
  "public.social_posts",
  "public.strategy_swot_items",
  "public.strategy_risks",
  "public.strategy_metrics_snapshots",
  "public.strategy_milestones",
  "public.strategy_valuations",
  "public.strategy_innovations",
  "public.strategy_state_support",
  "public.autopilot_worker_config",
  "public.email_preferences",
  "public.finance_monthly_costs",
  "public.finance_api_usage",
  "public.k_categories",
  "public.k_model_scores",
  "public.vertical_playbooks",
  "public.jailbreak_samples",
  "public.vendor_trust_rankings",
  "public.bench_tr_evaluations",
  "public.data_retention_policies",
  "public.advisory_board_members",
  "public.linkedin_contacts",
  "public.outreach_queue",
  "public.strategic_questions",
  "public.vendor_quotas",
  "public.cease_and_desist_logs",
  "public.ai_free_models",
  "public.ai_routing_chains",
  "public.grant_applications",
  "public.platform_signups",
  "public.ai_velocity_metrics",
  "public.financial_velocity_projections",
  "public.audit_log"
];

let seedsSql = `-- =============================================================================
-- 0003_seeds.sql — Canonical Seed Migrations (Gated / Idempotent)
-- Generated: ${new Date().toISOString()}
-- Every block is guarded with NOT EXISTS to NO-OP on non-empty tables.
-- Safe for zero prod writes, non-destructive, repeatable on fresh staging.
-- =============================================================================

`;

for (const fullTbl of orderedTables) {
  const stmts = tableMap.get(fullTbl);
  if (!stmts || stmts.length === 0) continue;

  const [schema, tbl] = fullTbl.split(".");

  seedsSql += `-- -----------------------------------------------------------------------------\n`;
  seedsSql += `-- Table: ${fullTbl} (${stmts.length} statements, guarded)\n`;
  seedsSql += `-- -----------------------------------------------------------------------------\n`;

  if (fullTbl === "auth.users") {
    seedsSql += `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'b9a1bb8e-8245-4de6-9134-678e14f80d49') THEN
    INSERT INTO auth.users (id, email) VALUES ('b9a1bb8e-8245-4de6-9134-678e14f80d49', 'owner@alparai.com')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;\n\n`;
    continue;
  }

  seedsSql += `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = '${tbl}') THEN
    IF NOT EXISTS (SELECT 1 FROM ${fullTbl} LIMIT 1) THEN
${stmts.map(s => `      ${s.split("\n").join("\n      ")}`).join("\n\n")}
    END IF;
  END IF;
END $$;\n\n`;
}

const outPath = path.join(__dirname, "..", "dehost", "migrations", "0003_seeds.sql");
fs.writeFileSync(outPath, seedsSql, "utf8");
console.log(`[GEN] Successfully created ${outPath} (${seedsSql.length} bytes, ${seedsSql.split("\n").length} lines).`);
