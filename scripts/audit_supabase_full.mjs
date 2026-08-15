import fs from 'fs';
import path from 'path';

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

// Table registry from migrations
const tables = new Map();
const enums = new Map();
const views = new Map();
const functions = new Map();
const rlsPolicies = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // ENUMS
  const typeRegex = /CREATE\s+TYPE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+AS\s+ENUM\s*\(([\s\S]*?)\);/gi;
  let tMatch;
  while ((tMatch = typeRegex.exec(content)) !== null) {
    const enumName = tMatch[1].toLowerCase();
    const vals = tMatch[2].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    enums.set(enumName, { file, values: vals });
  }

  // CREATE TABLE
  const ctRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
  let ctMatch;
  while ((ctMatch = ctRegex.exec(content)) !== null) {
    const tableName = ctMatch[1].toLowerCase();
    const body = ctMatch[2];
    if (!tables.has(tableName)) {
      tables.set(tableName, {
        createdIn: file,
        columns: new Map(),
        rlsEnabled: false,
        policies: [],
      });
    }
    const tableObj = tables.get(tableName);
    const lines = body.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('--') || line.startsWith('CONSTRAINT') || line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('CHECK') || line.startsWith('UNIQUE')) {
        continue;
      }
      const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_\[\]]+(?:\([^)]+\))?)/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].toLowerCase();
        tableObj.columns.set(colName, { type: colType, nullable: !line.includes('NOT NULL'), defaultVal: line.includes('DEFAULT') });
      }
    }
  }

  // ALTER TABLE ADD COLUMN
  const addColRegex = /ALTER\s+TABLE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_\[\]]+(?:\([^)]+\))?)/gi;
  let acMatch;
  while ((acMatch = addColRegex.exec(content)) !== null) {
    const tableName = acMatch[1].toLowerCase();
    const colName = acMatch[2].toLowerCase();
    const colType = acMatch[3].toLowerCase();
    if (tables.has(tableName)) {
      tables.get(tableName).columns.set(colName, { type: colType, addedIn: file });
    }
  }

  // RLS ENABLE
  const rlsEnableRegex = /ALTER\s+TABLE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let rlsMatch;
  while ((rlsMatch = rlsEnableRegex.exec(content)) !== null) {
    const tableName = rlsMatch[1].toLowerCase();
    if (tables.has(tableName)) {
      tables.get(tableName).rlsEnabled = true;
    }
  }

  // RLS DISABLE
  const rlsDisableRegex = /ALTER\s+TABLE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let rlsDisMatch;
  while ((rlsDisMatch = rlsDisableRegex.exec(content)) !== null) {
    const tableName = rlsDisMatch[1].toLowerCase();
    if (tables.has(tableName)) {
      tables.get(tableName).rlsEnabled = false;
    }
  }

  // CREATE POLICY
  const policyRegex = /CREATE\s+POLICY\s+["']?([^"'\n]+)["']?\s+ON\s+(?:public\.)?([a-zA-Z0-9_]+)([\s\S]*?);/gi;
  let polMatch;
  while ((polMatch = policyRegex.exec(content)) !== null) {
    const polName = polMatch[1];
    const tableName = polMatch[2].toLowerCase();
    const rest = polMatch[3];
    
    let command = 'ALL';
    const forMatch = rest.match(/FOR\s+([A-Z]+)/i);
    if (forMatch) command = forMatch[1].toUpperCase();

    let roles = 'public';
    const toMatch = rest.match(/TO\s+([a-zA-Z0-9_,\s]+?)(?=\s+USING|\s+WITH\s+CHECK|$)/i);
    if (toMatch) roles = toMatch[1].trim();

    let usingClause = '';
    const usingMatch = rest.match(/USING\s*\(([\s\S]*?)\)(?=\s*WITH\s+CHECK|$)/i);
    if (usingMatch) usingClause = usingMatch[1].trim();

    let withCheckClause = '';
    const checkMatch = rest.match(/WITH\s+CHECK\s*\(([\s\S]*?)\)$/i);
    if (checkMatch) withCheckClause = checkMatch[1].trim();

    const polObj = { file, name: polName, command, roles, usingClause, withCheckClause };
    rlsPolicies.push(polObj);
    if (tables.has(tableName)) {
      tables.get(tableName).policies.push(polObj);
    }
  }

  // VIEWS
  const viewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let vMatch;
  while ((vMatch = viewRegex.exec(content)) !== null) {
    views.set(vMatch[1].toLowerCase(), { file });
  }

  // FUNCTIONS
  const funcRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*RETURNS\s+([a-zA-Z0-9_<>]+(?:\s+[a-zA-Z0-9_]+)?)/gi;
  let fMatch;
  while ((fMatch = funcRegex.exec(content)) !== null) {
    functions.set(fMatch[1].toLowerCase(), { file, args: fMatch[2].trim(), returnType: fMatch[3].trim() });
  }
}

// Parse src/types/database.ts
const dbTsPath = 'D:/01_SaaS_Products/Alparai/src/types/database.ts';
const dbTsContent = fs.readFileSync(dbTsPath, 'utf8');

// Accurate extraction of Tables from database.ts
const tsTables = new Map();
const publicTablesBlockMatch = dbTsContent.match(/public:\s*\{\s*Tables:\s*\{([\s\S]*?)\n\s{4}\};\s*Functions:/);
if (publicTablesBlockMatch) {
  const inner = publicTablesBlockMatch[1];
  // Match `  tableName: {\n    Row: {\n      ... \n    };\n`
  const tableMatches = inner.matchAll(/\n\s{6}([a-zA-Z0-9_]+):\s*\{\s*Row:\s*\{([\s\S]*?)\n\s{8}\};/g);
  for (const m of tableMatches) {
    const tName = m[1].toLowerCase();
    const rowBody = m[2];
    const cols = new Map();
    const colLines = rowBody.split('\n');
    for (const cLine of colLines) {
      const cm = cLine.trim().match(/^([a-zA-Z0-9_]+)(\??):\s*([^;]+);/);
      if (cm) {
        cols.set(cm[1].toLowerCase(), {
          optional: cm[2] === '?',
          type: cm[3].trim()
        });
      }
    }
    tsTables.set(tName, cols);
  }
}

// Extract Functions from database.ts
const tsFunctions = new Map();
const funcBlockMatch = dbTsContent.match(/Functions:\s*\{([\s\S]*?)\n\s{4}\};\s*Enums:/);
if (funcBlockMatch) {
  const inner = funcBlockMatch[1];
  const fMatches = inner.matchAll(/\n\s{6}([a-zA-Z0-9_]+):\s*\{/g);
  for (const fm of fMatches) {
    tsFunctions.set(fm[1].toLowerCase(), true);
  }
}

// Extract Enums from database.ts
const tsEnums = new Map();
const enumBlockMatch = dbTsContent.match(/Enums:\s*\{([\s\S]*?)\n\s{4}\};\s*CompositeTypes:/);
if (enumBlockMatch) {
  const inner = enumBlockMatch[1];
  const eMatches = inner.matchAll(/\n\s{6}([a-zA-Z0-9_]+):\s*([^;\n]+(?:\n\s*\|[^\n;]+)*);/g);
  for (const em of eMatches) {
    tsEnums.set(em[1].toLowerCase(), em[2].trim());
  }
}

console.log(`\n======================================================`);
console.log(`       ALPAR AI — SUPABASE AUDIT REPORT`);
console.log(`======================================================`);
console.log(`Migration Files: ${files.length}`);
console.log(`Tables in Migrations: ${tables.size}`);
console.log(`Tables in src/types/database.ts: ${tsTables.size}`);
console.log(`Views in Migrations: ${views.size}`);
console.log(`Functions in Migrations: ${functions.size}, in TS: ${tsFunctions.size}`);
console.log(`Enums in Migrations: ${enums.size}, in TS: ${tsEnums.size}`);

// Missing Tables in TS
const missingInTs = [];
for (const [tbl] of tables) {
  if (!tsTables.has(tbl)) missingInTs.push(tbl);
}

// Extra Tables in TS (e.g. views typed under Tables or dropped tables)
const extraInTs = [];
for (const [tbl] of tsTables) {
  if (!tables.has(tbl)) extraInTs.push(tbl);
}

console.log(`\n--- 1. TABLE ALIGNMENT AUDIT ---`);
console.log(`Missing in database.ts (${missingInTs.length}):`, missingInTs);
console.log(`In database.ts but not migration table (${extraInTs.length}):`, extraInTs);

// Check column diffs for matched tables
const colDiffs = [];
for (const [tbl, tData] of tables) {
  if (tsTables.has(tbl)) {
    const tsCols = tsTables.get(tbl);
    const missingCols = [];
    for (const [cName] of tData.columns) {
      if (!tsCols.has(cName)) missingCols.push(cName);
    }
    const extraCols = [];
    for (const [cName] of tsCols) {
      if (!tData.columns.has(cName)) extraCols.push(cName);
    }
    if (missingCols.length > 0 || extraCols.length > 0) {
      colDiffs.push({ table: tbl, missingInTs: missingCols, extraInTs: extraCols });
    }
  }
}

console.log(`\n--- 2. COLUMN LEVEL ALIGNMENT AUDIT ---`);
console.log(`Tables with column diffs: ${colDiffs.length}`);
for (const cd of colDiffs) {
  console.log(`  * ${cd.table}:`);
  if (cd.missingInTs.length > 0) console.log(`      [-] Missing in TS: ${cd.missingInTs.join(', ')}`);
  if (cd.extraInTs.length > 0) console.log(`      [+] Extra in TS (or migrated via raw sql): ${cd.extraInTs.join(', ')}`);
}

// Check Enum Alignment
console.log(`\n--- 3. ENUM ALIGNMENT AUDIT ---`);
for (const [eName, eData] of enums) {
  if (!tsEnums.has(eName)) {
    console.log(`  [MISSING ENUM IN TS] ${eName} -> values: ${eData.values.join(', ')}`);
  } else {
    console.log(`  [MATCHED ENUM] ${eName}`);
  }
}

// RLS Audit
console.log(`\n--- 4. RLS SECURITY AUDIT ---`);
const rlsDisabled = [];
const rlsNoPolicy = [];
for (const [tbl, tData] of tables) {
  if (!tData.rlsEnabled) {
    rlsDisabled.push(tbl);
  } else if (tData.policies.length === 0) {
    rlsNoPolicy.push(tbl);
  }
}
console.log(`Tables with RLS Disabled (${rlsDisabled.length}):`, rlsDisabled);
console.log(`Tables with RLS Enabled but 0 Policies (${rlsNoPolicy.length}):`, rlsNoPolicy);

// Detailed write permission audit
const openWrites = [];
for (const pol of rlsPolicies) {
  const isWrite = ['INSERT', 'UPDATE', 'DELETE', 'ALL'].includes(pol.command);
  const isPublicOrAnon = pol.roles.toLowerCase().includes('public') || pol.roles.toLowerCase().includes('anon');
  const usingTrue = (pol.usingClause || '').trim() === 'true';
  const checkTrue = (pol.withCheckClause || '').trim() === 'true';
  if (isWrite && isPublicOrAnon && (usingTrue || checkTrue || (!pol.usingClause && !pol.withCheckClause))) {
    openWrites.push(pol);
  }
}

console.log(`\nOpen/Unauthenticated Write Policies (${openWrites.length}):`);
for (const ow of openWrites) {
  console.log(`  - Table: [${ow.targetTable || 'unknown'}], Policy: "${ow.name}", Command: ${ow.command}, File: ${ow.file}`);
}

fs.writeFileSync('D:/01_SaaS_Products/Alparai/scratch/full_audit_results.json', JSON.stringify({
  summary: {
    migrationsCount: files.length,
    tablesCount: tables.size,
    tsTablesCount: tsTables.size,
    colDiffsCount: colDiffs.length,
    rlsDisabledCount: rlsDisabled.length,
    rlsNoPolicyCount: rlsNoPolicy.length,
    openWritesCount: openWrites.length
  },
  missingInTs,
  extraInTs,
  colDiffs,
  rlsDisabled,
  rlsNoPolicy,
  openWrites
}, null, 2));

console.log('\nAudit complete! Written to scratch/full_audit_results.json');
