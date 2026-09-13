const fs = require('fs');
const path = require('path');

const ALPARAI_DIR = 'D:\\AlparAi';
const ARCHIVE_DIR = 'D:\\01_SaaS_Products\\Alparai\\supabase\\migrations';
const DEHOST_MIGRATIONS = path.join(ALPARAI_DIR, 'dehost', 'migrations');

console.log('--- MIGRATION REPAIR ANALYSIS ---');

// 1. Read pristine reference migration files from archive
const archiveFiles = fs.readdirSync(ARCHIVE_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${archiveFiles.length} SQL migration files in reference archive.`);

// Collect all CREATE POLICY statements from pristine files
let fullPristineSql = '';
for (const file of archiveFiles) {
  const content = fs.readFileSync(path.join(ARCHIVE_DIR, file), 'utf8');
  fullPristineSql += `\n-- Source: ${file}\n` + content;
}

// Extract all valid CREATE POLICY statements from pristine SQL
// A policy in Postgres can span multiple lines ending with a semicolon
const policyRegex = /create\s+policy\s+"([^"]+)"[\s\S]*?;/gi;
const pristinePolicies = [];
let match;

while ((match = policyRegex.exec(fullPristineSql)) !== null) {
  pristinePolicies.push({
    name: match[1],
    fullSql: match[0].trim()
  });
}

console.log(`Extracted ${pristinePolicies.length} pristine CREATE POLICY statements from reference archive.`);

// Extract all ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements
const enableRlsRegex = /alter\s+table\s+([^\s;]+)\s+enable\s+row\s+level\s+security;/gi;
const enableRlsStatements = new Set();

while ((match = enableRlsRegex.exec(fullPristineSql)) !== null) {
  enableRlsStatements.add(match[0].toLowerCase().trim());
}

console.log(`Extracted ${enableRlsStatements.size} unique ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements.`);

// Inspect current 0001_full_schema.sql and 0002_rls_policies.sql
const schemaPath = path.join(DEHOST_MIGRATIONS, '0001_full_schema.sql');
const rlsPath = path.join(DEHOST_MIGRATIONS, '0002_rls_policies.sql');

let schemaSql = fs.readFileSync(schemaPath, 'utf8');
let rlsSql = fs.readFileSync(rlsPath, 'utf8');

console.log(`Current 0001_full_schema.sql size: ${schemaSql.length} bytes`);
console.log(`Current 0002_rls_policies.sql size: ${rlsSql.length} bytes`);
