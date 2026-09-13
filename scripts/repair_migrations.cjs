const fs = require('fs');
const path = require('path');

const ALPARAI_DIR = 'D:\\AlparAi';
const ARCHIVE_DIR = 'D:\\01_SaaS_Products\\Alparai\\supabase\\migrations';
const DEHOST_MIGRATIONS = path.join(ALPARAI_DIR, 'dehost', 'migrations');

console.log('=== STARTING MIGRATION REPAIR ===');

// 1. Read pristine reference archive migration files
const archiveFiles = fs.readdirSync(ARCHIVE_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

let pristineSql = '';
for (const file of archiveFiles) {
  const content = fs.readFileSync(path.join(ARCHIVE_DIR, file), 'utf8');
  pristineSql += `\n-- Source: ${file}\n` + content;
}

// Extract all valid CREATE POLICY statements from pristine archive
// Regex matches `CREATE POLICY "name" ON ... ;`
const policyRegex = /create\s+policy\s+"([^"]+)"[\s\S]*?;/gi;
const pristinePoliciesMap = new Map();
const pristinePoliciesList = [];
let match;

while ((match = policyRegex.exec(pristineSql)) !== null) {
  const fullSql = match[0].trim();
  const name = match[1];
  // Deduplicate by policy full text or name if table matches
  const key = fullSql.toLowerCase().replace(/\s+/g, ' ');
  if (!pristinePoliciesMap.has(key)) {
    pristinePoliciesMap.set(key, fullSql);
    pristinePoliciesList.push(fullSql);
  }
}

console.log(`Extracted ${pristinePoliciesList.length} unique pristine CREATE POLICY statements.`);

// Extract all ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements
const enableRlsRegex = /alter\s+table\s+([^\s;]+)\s+enable\s+row\s+level\s+security;/gi;
const enableRlsSet = new Set();
while ((match = enableRlsRegex.exec(pristineSql)) !== null) {
  enableRlsSet.add(match[0].toLowerCase().trim());
}

console.log(`Extracted ${enableRlsSet.size} unique ENABLE RLS statements.`);

// 2. Prepare 0001_full_schema.sql header blocks
const headerBlock = `-- Sovereign DeHost PostgreSQL Full Schema Migration (0001_full_schema.sql)
-- Standards: Strict PostgreSQL 16+, CommonJS Engine Compatible, Vanilla PG Compatible

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Realtime Publication for Event-Driven Bus
CREATE PUBLICATION IF NOT EXISTS dehost_realtime;

-- Idempotent Role Provisioning for Vanilla PostgreSQL 16
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

-- Idempotent Supabase Auth Compatibility Schema and Helper Functions
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
$$ LANGUAGE sql STABLE;

`;

// Read current 0001_full_schema.sql and strip dangling policy lines
const schemaPath = path.join(DEHOST_MIGRATIONS, '0001_full_schema.sql');
const rawSchemaLines = fs.readFileSync(schemaPath, 'utf8').split('\n');

const cleanedSchemaLines = [];
let inHeadlessPolicyBlock = false;

for (let i = 0; i < rawSchemaLines.length; i++) {
  const line = rawSchemaLines[i];
  const trimmed = line.trim().toLowerCase();

  // Check if line is a headless policy start (starts with on public. and contains for select/insert/update/delete/all)
  if (trimmed.startsWith('on public.') && (trimmed.includes(' for ') || trimmed.includes('using (') || trimmed.includes('with check ('))) {
    if (!rawSchemaLines[i-1]?.toLowerCase().includes('index') && !rawSchemaLines[i-1]?.toLowerCase().includes('trigger') && !rawSchemaLines[i-1]?.toLowerCase().includes('policy')) {
      inHeadlessPolicyBlock = true;
      // Skip this line and any multiline continuation until semicolon
      if (line.includes(';')) {
        inHeadlessPolicyBlock = false;
      }
      continue;
    }
  }

  if (inHeadlessPolicyBlock) {
    if (line.includes(';')) {
      inHeadlessPolicyBlock = false;
    }
    continue;
  }

  // Skip duplicate extension creation if handled in headerBlock
  if (trimmed.includes('create extension if not exists "uuid-ossp"') || trimmed.includes("create extension if not exists 'uuid-ossp'")) {
    continue;
  }
  if (trimmed.includes('create extension if not exists "pgcrypto"') || trimmed.includes("create extension if not exists 'pgcrypto'")) {
    continue;
  }

  cleanedSchemaLines.push(line);
}

const finalSchemaSql = headerBlock + cleanedSchemaLines.join('\n');
fs.writeFileSync(schemaPath, finalSchemaSql, 'utf8');
console.log(`Updated 0001_full_schema.sql (${finalSchemaSql.length} bytes).`);

// 3. Prepare 0002_rls_policies.sql
let rlsSql = `-- Sovereign DeHost PostgreSQL RLS Policies (0002_rls_policies.sql)
-- Default DENY for all tables, explicit GRANTs only
-- Auto-reconstructed for Vanilla PostgreSQL 16 Compatibility

`;

// Add ENABLE ROW LEVEL SECURITY statements
rlsSql += `-- Enable RLS on all tables\n`;
for (const stmt of Array.from(enableRlsSet).sort()) {
  rlsSql += `${stmt}\n`;
}

rlsSql += `\n-- RLS Policies\n`;
for (const policySql of pristinePoliciesList) {
  rlsSql += `${policySql}\n\n`;
}

const rlsPath = path.join(DEHOST_MIGRATIONS, '0002_rls_policies.sql');
fs.writeFileSync(rlsPath, rlsSql, 'utf8');
console.log(`Updated 0002_rls_policies.sql (${rlsSql.length} bytes).`);

// Count headers vs bodies in 0002_rls_policies.sql
const policyHeaderMatches = rlsSql.match(/create\s+policy\s+"[^"]+"/gi) || [];
const policyBodyMatches = rlsSql.match(/on\s+public\.[^\s]+\s+for\s+/gi) || [];

console.log(`0002_rls_policies.sql Header Count: ${policyHeaderMatches.length}`);
console.log(`0002_rls_policies.sql Body Count: ${policyBodyMatches.length}`);
if (policyHeaderMatches.length === policyBodyMatches.length) {
  console.log('SUCCESS: Policy Header Count EQUALS Policy Body Count!');
} else {
  console.log('WARNING: Header and Body counts differ!');
}
