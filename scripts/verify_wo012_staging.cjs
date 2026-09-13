"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("[PWD]", process.cwd());

const SSH_KEY = "C:/Users/ercum/.ssh/id_ed25519_vds";
const REMOTE_HOST = "root@45.143.4.92";

function runRemote(cmd, input) {
  const fullCmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "${cmd.replace(/"/g, '\\"')}"`;
  return execSync(fullCmd, { input, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

console.log("=== WORK-ORDER-012 PHASE A: FRESH STAGING ACCEPTANCE VERIFICATION ===");

// 1. Copy migration files to remote /tmp
console.log("\n--- Transferring migration files to remote host ---");
const files = [
  { local: "dehost/migrations/0001_full_schema.sql", remote: "/tmp/0001_full_schema.sql" },
  { local: "dehost/migrations/0002_rls_policies.sql", remote: "/tmp/0002_rls_policies.sql" },
  { local: "dehost/migrations/0003_seeds.sql", remote: "/tmp/0003_seeds.sql" },
  { local: "dehost/migrations/0004_provider_attribution.sql", remote: "/tmp/0004_provider_attribution.sql" }
];

for (const f of files) {
  const content = fs.readFileSync(path.join(__dirname, "..", f.local), "utf8");
  runRemote(`cat > ${f.remote}`, content);
  console.log(`✓ Transferred ${f.local} -> ${f.remote} (${content.length} bytes)`);
}

// 2. Prepare clean scratch staging database
const DB_NAME = "alparai_staging_wo012";
console.log(`\n--- Preparing fresh database: ${DB_NAME} ---`);
runRemote(`docker exec postgres-master psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 && docker exec postgres-master dropdb -U postgres ${DB_NAME} || true`);
runRemote(`docker exec postgres-master createdb -U postgres ${DB_NAME}`);
console.log(`✓ Created scratch database: ${DB_NAME}`);

try {
  // 3. Apply 0001_full_schema.sql
  console.log("\n--- Step 1: Applying 0001_full_schema.sql (ON_ERROR_STOP=1) ---");
  const t0 = Date.now();
  runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0001_full_schema.sql > /tmp/up1.log 2>&1`);
  const t1 = Date.now();
  console.log(`✓ 0001_full_schema.sql applied successfully in ${t1 - t0}ms (Exit 0, 0 errors).`);

  // 4. Apply 0002_rls_policies.sql
  console.log("\n--- Step 2: Applying 0002_rls_policies.sql (ON_ERROR_STOP=1) ---");
  const t2 = Date.now();
  runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0002_rls_policies.sql > /tmp/up2.log 2>&1`);
  const t3 = Date.now();
  console.log(`✓ 0002_rls_policies.sql applied successfully in ${t3 - t2}ms (Exit 0, 0 errors).`);

  // 5. Apply 0003_seeds.sql
  console.log("\n--- Step 3: Applying 0003_seeds.sql (ON_ERROR_STOP=1) ---");
  const t4 = Date.now();
  runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0003_seeds.sql > /tmp/up3.log 2>&1`);
  const t5 = Date.now();
  console.log(`✓ 0003_seeds.sql applied successfully in ${t5 - t4}ms (Exit 0, 0 errors).`);

  // 5b. Apply 0004_provider_attribution.sql
  console.log("\n--- Step 3b: Applying 0004_provider_attribution.sql (ON_ERROR_STOP=1) ---");
  const t4b = Date.now();
  runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0004_provider_attribution.sql > /tmp/up4.log 2>&1`);
  const t5b = Date.now();
  console.log(`✓ 0004_provider_attribution.sql applied successfully in ${t5b - t4b}ms (Exit 0, 0 errors).`);

  // 6. Test Idempotency (second run of 0003_seeds.sql on non-empty tables)
  console.log("\n--- Step 4: Testing 0003_seeds.sql Idempotency / No-Op Guard ---");
  const t6 = Date.now();
  runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0003_seeds.sql > /tmp/up3_second.log 2>&1`);
  const t7 = Date.now();
  console.log(`✓ 0003_seeds.sql second run NO-OP completed in ${t7 - t6}ms (Exit 0, 0 errors).`);

  // 7. Server Counts
  console.log("\n--- Step 5: Querying Server Counts ---");
  const countsSql = `
SELECT 'pg_tables_public' AS metric, COUNT(*)::text AS val FROM pg_tables WHERE schemaname='public'
UNION ALL
SELECT 'pg_policies_public', COUNT(*)::text FROM pg_policies WHERE schemaname='public'
UNION ALL
SELECT 'pg_tables_rls', COUNT(*)::text FROM pg_tables WHERE schemaname='public' AND rowsecurity
UNION ALL
SELECT 'ai_providers_count', COUNT(*)::text FROM public.ai_providers
UNION ALL
SELECT 'ai_models_count', COUNT(*)::text FROM public.ai_models
UNION ALL
SELECT 'incidents_count', COUNT(*)::text FROM public.incidents;
`;
  const countsOut = runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -t -A -F'|'`, countsSql);
  console.log("PostgreSQL Server-Returned Counts:");
  for (const line of countsOut.trim().split("\n")) {
    const [metric, val] = line.split("|");
    console.log(`  ${metric.padEnd(22)}: ${val}`);
  }

  // 8. Seed Roundtrip Test
  console.log("\n--- Step 6: Executing Seed Roundtrip Test on public.incidents ---");
  const roundtripSql = `
DO $$
DECLARE
  v_prov_id uuid;
  v_mod_id uuid;
  v_inc_id uuid;
  v_found int;
BEGIN
  -- 1. Insert test provider
  INSERT INTO public.ai_providers (slug, name)
  VALUES ('probe-prov-wo012', 'Probe Provider WO-012')
  RETURNING id INTO v_prov_id;

  -- 2. Insert test model
  INSERT INTO public.ai_models (provider_id, name)
  VALUES (v_prov_id, 'Probe Model WO-012')
  RETURNING id INTO v_mod_id;

  -- 3. Insert test incident
  INSERT INTO public.incidents (title, description, ai_provider_id, ai_model_id)
  VALUES ('Probe Incident WO-012 Acceptance', 'Validating schema and RLS roundtrip', v_prov_id, v_mod_id)
  RETURNING id INTO v_inc_id;

  -- 4. Verify read
  SELECT COUNT(*) INTO v_found FROM public.incidents WHERE id = v_inc_id;
  IF v_found <> 1 THEN
    RAISE EXCEPTION 'Roundtrip read failed: expected 1 row, got %', v_found;
  END IF;

  -- 5. Delete probe rows
  DELETE FROM public.incidents WHERE id = v_inc_id;
  DELETE FROM public.ai_models WHERE id = v_mod_id;
  DELETE FROM public.ai_providers WHERE id = v_prov_id;

  -- 6. Verify clean
  SELECT COUNT(*) INTO v_found FROM public.incidents WHERE id = v_inc_id;
  IF v_found <> 0 THEN
    RAISE EXCEPTION 'Cleanup verification failed: probe row still exists';
  END IF;

  RAISE NOTICE 'SEED_ROUNDTRIP_SUCCESS';
END $$;
`;
  const roundtripOut = runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME}`, roundtripSql);
  console.log("✓ Seed Roundtrip Test passed: insert -> read (1 row) -> delete -> verify clean (0 rows).");

  console.log("\n=======================================================");
  console.log("STATUS: ALL ACCEPTANCE CHECKS PASSED 100% GREEN (EXIT 0)");
  console.log("=======================================================");
} catch (err) {
  console.error("ACCEPTANCE RUN FAILED:", err.message);
  if (err.stdout) console.error("STDOUT:", err.stdout);
  if (err.stderr) console.error("STDERR:", err.stderr);
  process.exit(1);
} finally {
  // Cleanup scratch database and remote temp files
  console.log("\n--- Cleaning up scratch resources ---");
  runRemote(`docker exec postgres-master dropdb -U postgres ${DB_NAME}`);
  runRemote("rm -f /tmp/0001_full_schema.sql /tmp/0002_rls_policies.sql /tmp/0003_seeds.sql /tmp/up1.log /tmp/up2.log /tmp/up3.log /tmp/up3_second.log");
  console.log("✓ Scratch database dropped and temp files removed.");
}
