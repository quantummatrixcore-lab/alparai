"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SSH_KEY = "C:/Users/ercum/.ssh/id_ed25519_vds";
const REMOTE_HOST = "-p 18222 root@45.143.4.92";
const DB_NAME = "alparai_staging_wo012";

function runRemote(cmd, input) {
  const fullCmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "${cmd.replace(/"/g, '\\"')}"`;
  return execSync(fullCmd, { input, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

// Read local 0003_seeds.sql
const content = fs.readFileSync(path.join(__dirname, "..", "dehost", "migrations", "0003_seeds.sql"), "utf8");

// Split by blocks
const blocks = content.split(/-- -----------------------------------------------------------------------------\r?\n/);
console.log(`Found ${blocks.length} sections to test.`);

// Ensure DB exists with schema 0001 and 0002
runRemote(`docker exec postgres-master psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 && docker exec postgres-master dropdb -U postgres ${DB_NAME} || true`);
runRemote(`docker exec postgres-master createdb -U postgres ${DB_NAME}`);
console.log("Created scratch database.");

runRemote(`cat > /tmp/0001_full_schema.sql`, fs.readFileSync(path.join(__dirname, "..", "dehost", "migrations", "0001_full_schema.sql"), "utf8"));
runRemote(`cat > /tmp/0002_rls_policies.sql`, fs.readFileSync(path.join(__dirname, "..", "dehost", "migrations", "0002_rls_policies.sql"), "utf8"));
runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0001_full_schema.sql > /dev/null`);
runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1 < /tmp/0002_rls_policies.sql > /dev/null`);
console.log("Schema and RLS applied.");

for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i].trim();
  if (!block || !block.includes("DO $$")) continue;

  const firstLine = block.split("\n")[0] || "";
  console.log(`Testing block ${i}: ${firstLine}`);

  try {
    runRemote(`docker exec -i postgres-master psql -U postgres -d ${DB_NAME} -v ON_ERROR_STOP=1`, block);
    console.log(`  ✓ Block ${i} passed`);
  } catch (err) {
    console.error(`  ✗ BLOCK ${i} FAILED:`, firstLine);
    const errText = (err.stderr || err.stdout || err.message).split("\n").filter(l => l.includes("ERROR:") || l.includes("DETAIL:") || l.includes("HINT:")).join("\n");
    console.error("EXACT ERROR:\n" + errText);
    process.exit(1);
  }
}

console.log("ALL BLOCKS PASSED INDIVIDUALLY!");
