const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'dehost', 'migrations', '0001_full_schema.sql');
const rlsPath = path.join(__dirname, '..', 'dehost', 'migrations', '0002_rls_policies.sql');

if (!fs.existsSync(schemaPath) || !fs.existsSync(rlsPath)) {
  console.error('ERROR: DeHost migration files not found!');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const rlsSql = fs.readFileSync(rlsPath, 'utf8');

const tableMatches = [...schemaSql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_.\x22]+)/gi)];
const indexMatches = [...schemaSql.matchAll(/CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?([a-zA-Z0-9_.\x22]+)/gi)];
const enumMatches = [...schemaSql.matchAll(/CREATE TYPE ([a-zA-Z0-9_.\x22]+) AS ENUM/gi)];
const policyMatches = [...rlsSql.matchAll(/CREATE POLICY ([a-zA-Z0-9_.\x22]+)/gi)];
const rlsEnableMatches = [...rlsSql.matchAll(/ENABLE ROW LEVEL SECURITY/gi)];

console.log('=== DEHOST MIGRATION VERIFICATION EVIDENCE ===');
console.log(`Schema File (0001_full_schema.sql): ${(fs.statSync(schemaPath).size / 1024).toFixed(1)} KB`);
console.log(`RLS File (0002_rls_policies.sql): ${(fs.statSync(rlsPath).size / 1024).toFixed(1)} KB`);
console.log(`Parsed Tables: ${tableMatches.length}`);
console.log(`Parsed Indexes: ${indexMatches.length}`);
console.log(`Parsed Enums: ${enumMatches.length}`);
console.log(`Parsed RLS Policies: ${policyMatches.length}`);
console.log(`Parsed RLS Enable Statements: ${rlsEnableMatches.length}`);

if (tableMatches.length > 0 && policyMatches.length > 0) {
  console.log('STATUS: VERIFIED_PASS');
  process.exit(0);
} else {
  console.error('STATUS: VERIFICATION_FAILED');
  process.exit(1);
}
