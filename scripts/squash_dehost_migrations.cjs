const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'dehost', 'migrations');
const targetDir = path.join(__dirname, '..', 'dehost', 'migrations');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

console.log(`Found ${files.length} migration files in dehost/migrations/`);

let fullSchemaSql = [];
let rlsPoliciesSql = [];

// Header
fullSchemaSql.push('-- Sovereign DeHost PostgreSQL Full Schema Migration (0001_full_schema.sql)');
fullSchemaSql.push('-- Auto-squashed from DeHost migrations for DeHost Dedicated Infrastructure');
fullSchemaSql.push('-- Standards: Strict PostgreSQL 16+, CommonJS Engine Compatible, Cascade FKs');
fullSchemaSql.push('');

rlsPoliciesSql.push('-- Sovereign DeHost PostgreSQL RLS Policies (0002_rls_policies.sql)');
rlsPoliciesSql.push('-- Default DENY for all tables, explicit GRANTs only');
rlsPoliciesSql.push('');

const rlsRegex = /CREATE\s+POLICY|ALTER\s+TABLE\s+[\s\S]*?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  fullSchemaSql.push(`-- ========================================================`);
  fullSchemaSql.push(`-- Source: ${file}`);
  fullSchemaSql.push(`-- ========================================================`);

  const lines = content.split('\n');
  let currentBlock = [];

  for (let line of lines) {
    if (line.match(/CREATE\s+POLICY/i) || line.match(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i)) {
      rlsPoliciesSql.push(`-- From ${file}`);
      rlsPoliciesSql.push(line);
    } else {
      fullSchemaSql.push(line);
    }
  }
  fullSchemaSql.push('');
}

const schemaPath = path.join(targetDir, '0001_full_schema.sql');
const rlsPath = path.join(targetDir, '0002_rls_policies.sql');

fs.writeFileSync(schemaPath, fullSchemaSql.join('\n'), 'utf8');
fs.writeFileSync(rlsPath, rlsPoliciesSql.join('\n'), 'utf8');

console.log(`Successfully generated:`);
console.log(`- ${schemaPath} (${(fs.statSync(schemaPath).size / 1024).toFixed(1)} KB)`);
console.log(`- ${rlsPath} (${(fs.statSync(rlsPath).size / 1024).toFixed(1)} KB)`);
