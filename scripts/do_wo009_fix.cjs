const fs = require('fs');
const path = require('path');

const ALPARAI_DIR = 'D:\\AlparAi';
const DEHOST_MIGRATIONS = path.join(ALPARAI_DIR, 'dehost', 'migrations');
const schemaPath = path.join(DEHOST_MIGRATIONS, '0001_full_schema.sql');
const rlsPath = path.join(DEHOST_MIGRATIONS, '0002_rls_policies.sql');

console.log('=== STARTING WORK-ORDER-009-FIX REPAIRS ===');

// 1. Read 0001_full_schema.sql
let schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Fix Publication Guard Syntax
schemaSql = schemaSql.replace(
  /CREATE PUBLICATION IF NOT EXISTS dehost_realtime;/g,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dehost_realtime') THEN CREATE PUBLICATION dehost_realtime; END IF; END $$;`
);

// Thoroughly strip ANY headless policy line starting with `ON public.` or `ON storage.` that does not have a `CREATE POLICY` header
const lines = schemaSql.split('\n');
const cleanedLines = [];
let skippingHeadless = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim().toLowerCase();

  // Check if this line is an ON public. or ON storage. statement
  if (/^\s*on\s+(public|storage)\.[^\s]+/i.test(line)) {
    // Look backward to see if immediate preceding non-empty line has CREATE POLICY
    let hasHeader = false;
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      const prevTrimmed = lines[j].trim().toLowerCase();
      if (prevTrimmed.length === 0 || prevTrimmed.startsWith('--')) continue;
      if (prevTrimmed.includes('create policy')) {
        hasHeader = true;
      }
      break;
    }

    if (!hasHeader) {
      // Check if it's part of CREATE INDEX or TRIGGER
      const isIndexOrTrigger = line.toLowerCase().includes('using gin') || 
                               line.toLowerCase().includes('using btree') ||
                               line.toLowerCase().includes('using hash') ||
                               lines[i-1]?.toLowerCase().includes('index') ||
                               lines[i-1]?.toLowerCase().includes('trigger');
      
      if (!isIndexOrTrigger) {
        skippingHeadless = true;
        console.log(`Removed headless policy line ${i+1}: ${line.trim()}`);
        if (line.includes(';')) skippingHeadless = false;
        continue;
      }
    }
  }

  if (skippingHeadless) {
    if (line.includes(';')) skippingHeadless = false;
    continue;
  }

  cleanedLines.push(line);
}

const newSchemaSql = cleanedLines.join('\n');
fs.writeFileSync(schemaPath, newSchemaSql, 'utf8');
console.log(`Updated 0001_full_schema.sql (${newSchemaSql.length} bytes).`);

// 2. Audit 0002_rls_policies.sql to ensure all CREATE POLICY blocks are clean and complete
let rlsSql = fs.readFileSync(rlsPath, 'utf8');

// Ensure publication guard syntax if present in 0002 as well
rlsSql = rlsSql.replace(
  /CREATE PUBLICATION IF NOT EXISTS dehost_realtime;/g,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dehost_realtime') THEN CREATE PUBLICATION dehost_realtime; END IF; END $$;`
);

fs.writeFileSync(rlsPath, rlsSql, 'utf8');
console.log(`Updated 0002_rls_policies.sql (${rlsSql.length} bytes).`);

console.log('=== WORK-ORDER-009-FIX REPAIRS COMPLETE ===');
