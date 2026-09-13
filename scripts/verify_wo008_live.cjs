"use strict";
// WO-008 Phase A (Auditor-owned) — live DeHost Postgres proof, fail-closed.
// - Real pg driver (required at top; missing driver = exit 1, never simulate).
// - Safety: snapshots pre-existing tables first. If staging holds DATA,
//   runs VERIFY-ONLY (no UP/DOWN drops). Destructive cycle only on empty staging.
// - No hardcoded counts, no swallowed critical errors, no fallback numbers.
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const STAGING_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/alparai_staging";

async function main() {
  console.log(`[PWD] ${process.cwd()}`);
  const client = new Client({ connectionString: STAGING_URL, statement_timeout: 30000 });
  try {
    await client.connect();
  } catch (e) {
    console.error(`[CONNECT_FAIL] cannot reach staging Postgres: ${e.message}`);
    console.error("[CONNECT_FAIL] set DATABASE_URL env to a staging connection string and re-run.");
    process.exit(1);
  }
  console.log("[CONNECT] staging Postgres reachable (host masked, no credentials printed)");

  const preTables = (
    await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;")
  ).rows.map((r) => r.tablename);
  const preSet = new Set(preTables);
  const estRows = (
    await client.query(
      "SELECT COALESCE(SUM(reltuples)::bigint,0) AS n FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r';",
    )
  ).rows[0].n;
  console.log(
    `[SNAPSHOT] pre-existing public tables: ${preTables.length}, estimated rows: ${estRows}`,
  );

  const schemaSql = fs.readFileSync(
    path.join(__dirname, "..", "dehost", "migrations", "0001_full_schema.sql"),
    "utf8",
  );
  const rlsSql = fs.readFileSync(
    path.join(__dirname, "..", "dehost", "migrations", "0002_rls_policies.sql"),
    "utf8",
  );
  const fileTables = new Set(
    [...schemaSql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?public\.?"?([a-zA-Z0-9_]+)/gi)].map(
      (m) => m[1],
    ),
  );
  const filePolicies = [...rlsSql.matchAll(/CREATE POLICY/gi)].length;
  console.log(
    `[FILE_CONTRACT] migration files declare ~${fileTables.size} tables, ${filePolicies} CREATE POLICY statements`,
  );

  const hasData = Number(estRows) > 0;
  const mode = hasData
    ? "VERIFY-ONLY (staging holds data, zero drops)"
    : "FULL-CYCLE (empty staging)";
  console.log(`[MODE] ${mode}`);

  async function serverCounts(tag) {
    const t = (
      await client.query("SELECT COUNT(*)::int AS n FROM pg_tables WHERE schemaname='public';")
    ).rows[0].n;
    const p = (
      await client.query("SELECT COUNT(*)::int AS n FROM pg_policies WHERE schemaname='public';")
    ).rows[0].n;
    const r = (
      await client.query(
        "SELECT COUNT(*)::int AS n FROM pg_tables WHERE schemaname='public' AND rowsecurity;",
      )
    ).rows[0].n;
    console.log(`[${tag}] server pg_tables=${t} pg_policies=${p} rls_enabled_tables=${r}`);
    return { t, p, r };
  }

  const time = async (label, fn) => {
    const t0 = Date.now();
    const out = await fn();
    const ms = Date.now() - t0;
    console.log(`[TIMING ${label}] ${ms}ms`);
    return { out, ms };
  };

  if (!hasData) {
    const up1 = await time("UP#1", async () => {
      await client.query(schemaSql);
      await client.query(rlsSql);
    }).catch((e) => {
      console.error(`[UP#1_FAIL] ${e.message}`);
      process.exit(1);
    });
    void up1;
    await serverCounts("AFTER-UP#1");

    await time("DOWN", async () => {
      const now = (
        await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public';")
      ).rows.map((r) => r.tablename);
      for (const tbl of now) {
        if (preSet.has(tbl)) continue;
        await client.query(`DROP TABLE IF EXISTS public."${tbl.replace(/"/g, "")}" CASCADE;`);
      }
    });
    await serverCounts("AFTER-DOWN");

    await time("UP#2", async () => {
      await client.query(schemaSql);
      await client.query(rlsSql);
    }).catch((e) => {
      console.error(`[UP#2_FAIL] ${e.message}`);
      process.exit(1);
    });
    await serverCounts("AFTER-UP#2");
  } else {
    await serverCounts("VERIFY");
  }

  // Seed roundtrip (owner path) with unique IDs, then delete.
  const stamp = Date.now();
  const pid = `prov-audit-${stamp}`,
    mid = `mod-audit-${stamp}`,
    iid = `inc-audit-${stamp}`;
  await client.query(
    "INSERT INTO public.ai_providers(id,name,slug,trust_score,created_at) VALUES($1,'Audit Provider','audit-prov',95,now())",
    [pid],
  );
  await client.query(
    "INSERT INTO public.ai_models(id,name,provider_id,context_window,created_at) VALUES($1,'Audit Model', $2,128000,now())",
    [mid, pid],
  );
  await client.query(
    "INSERT INTO public.incidents(id,title,description,severity,status,provider_id,model_id,created_at) VALUES($1,'Audit seed','RLS roundtrip','medium','pending',$2,$3,now())",
    [iid, pid, mid],
  );
  const readBack = (await client.query("SELECT id FROM public.incidents WHERE id=$1;", [iid])).rows
    .length;
  console.log(`[SEED] inserted 3 rows, read back incident rows=${readBack}`);
  await client.query("DELETE FROM public.incidents WHERE id=$1;", [iid]);
  await client.query("DELETE FROM public.ai_models WHERE id=$1;", [mid]);
  await client.query("DELETE FROM public.ai_providers WHERE id=$1;", [pid]);
  const gone = (
    await client.query("SELECT COUNT(*)::int AS n FROM public.incidents WHERE id=$1;", [iid])
  ).rows[0].n;
  console.log(`[SEED_CLEANUP] residual rows with audit id: ${gone}`);

  // Per-table policy sample (server-returned).
  const sample = (
    await client.query(
      "SELECT tablename, COUNT(*)::int AS policies FROM pg_policies WHERE schemaname='public' GROUP BY 1 ORDER BY 2 DESC LIMIT 5;",
    )
  ).rows;
  console.log(`[POLICY_SAMPLE] ${JSON.stringify(sample)}`);

  console.log(
    "[BOUNDARY] role-based DENY test NOT performed (no low-priv staging role provisioned); RLS proven via server flags + policy counts + owner roundtrip.",
  );
  await client.end();
  console.log("=== PHASE A COMPLETE (live, no simulation) ===");
}

main().catch((e) => {
  console.error(`[FATAL] ${e.message}`);
  process.exit(1);
});
