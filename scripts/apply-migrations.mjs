#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF;
const PASS = process.env.SUPABASE_DB_PASSWORD;

if (!TOKEN || !REF || !PASS) {
  console.error("Missing SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF / SUPABASE_DB_PASSWORD");
  process.exit(1);
}

const MIGRATIONS = [
  "20260605000001_initial_schema.sql",
  "20260605000002_rls_policies.sql",
  "20260605000003_storage_buckets.sql",
  "20260605000004_incidents_timeline.sql",
  "20260605000005_takedown_fields.sql",
  "20260607000001_autopilot_runs.sql",
  "20260608000001_incident_votes.sql",
  "20260608000002_incidents_pii_columns.sql",
  "20260727000003_methodology_committee.sql",
  "20260727000004_role_view.sql",
  "20260727000005_k_product_scaffold.sql",
  "20260727000006_instructor_tier.sql",
  "20260727000007_fellowship_applications.sql",
  "20260727000008_student_ambassadors.sql",
  "20260727000009_art73_tracker.sql",
];

async function apply(name) {
  const path = join("supabase/migrations", name);
  const sql = readFileSync(path, "utf8");
  console.log(`\n→ ${name} (${sql.length} bytes)`);
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      dbPassword: PASS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error(`  ✗ ${r.status}: ${t.slice(0, 400)}`);
    return false;
  }
  const d = await r.json();
  if (d.message) {
    console.log(`  ✓ ${d.message.slice(0, 200)}`);
  } else {
    console.log(`  ✓ OK`);
  }
  return true;
}

let allOk = true;
for (const m of MIGRATIONS) {
  const ok = await apply(m);
  if (!ok) {
    console.error(`\nFAILED at ${m}`);
    allOk = false;
    break;
  }
}
console.log(allOk ? "\n✅ All migrations applied" : "\n❌ Migration failed");
process.exit(allOk ? 0 : 1);
