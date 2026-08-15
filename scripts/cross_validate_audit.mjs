import fs from 'fs';
import path from 'path';

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

// Table registry from migrations
const dbTables = new Map();
const dbEnums = new Map();
const dbViews = new Map();
const dbFunctions = new Map();
const dbPolicies = [];
const bucketPolicies = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // ENUMS
  const typeRegex = /CREATE\s+TYPE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+AS\s+ENUM\s*\(([\s\S]*?)\);/gi;
  let tMatch;
  while ((tMatch = typeRegex.exec(content)) !== null) {
    const enumName = tMatch[1].toLowerCase();
    const rawVals = tMatch[2];
    const vals = rawVals.split(',')
      .map(v => v.trim().replace(/^['"]|['"]$/g, '').replace(/--.*$/m, '').trim())
      .filter(Boolean);
    dbEnums.set(enumName, { file, values: vals });
  }

  // CREATE TABLE
  // Match both CREATE TABLE and CREATE TABLE IF NOT EXISTS
  const ctRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
  let ctMatch;
  while ((ctMatch = ctRegex.exec(content)) !== null) {
    const tableName = ctMatch[1].toLowerCase();
    const body = ctMatch[2];
    if (!dbTables.has(tableName)) {
      dbTables.set(tableName, {
        createdIn: file,
        columns: new Map(),
        rlsEnabled: false,
        policies: [],
      });
    }
    const tableObj = dbTables.get(tableName);
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
        tableObj.columns.set(colName, {
          type: colType,
          nullable: !line.toUpperCase().includes('NOT NULL'),
          hasDefault: line.toUpperCase().includes('DEFAULT'),
          file
        });
      }
    }
  }

  // ALTER TABLE ADD COLUMN
  const addColRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_\[\]]+(?:\([^)]+\))?)/gi;
  let acMatch;
  while ((acMatch = addColRegex.exec(content)) !== null) {
    const tableName = acMatch[1].toLowerCase();
    const colName = acMatch[2].toLowerCase();
    const colType = acMatch[3].toLowerCase();
    if (dbTables.has(tableName)) {
      dbTables.get(tableName).columns.set(colName, {
        type: colType,
        addedIn: file
      });
    }
  }

  // ALTER TABLE DROP COLUMN
  const dropColRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi;
  let dcMatch;
  while ((dcMatch = dropColRegex.exec(content)) !== null) {
    const tableName = dcMatch[1].toLowerCase();
    const colName = dcMatch[2].toLowerCase();
    if (dbTables.has(tableName)) {
      dbTables.get(tableName).columns.delete(colName);
    }
  }

  // RLS ENABLE
  const rlsEnableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let rlsMatch;
  while ((rlsMatch = rlsEnableRegex.exec(content)) !== null) {
    const tableName = rlsMatch[1].toLowerCase();
    if (dbTables.has(tableName)) {
      dbTables.get(tableName).rlsEnabled = true;
    }
  }

  // RLS DISABLE
  const rlsDisableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let rlsDisMatch;
  while ((rlsDisMatch = rlsDisableRegex.exec(content)) !== null) {
    const tableName = rlsDisMatch[1].toLowerCase();
    if (dbTables.has(tableName)) {
      dbTables.get(tableName).rlsEnabled = false;
    }
  }

  // CREATE POLICY
  const policyRegex = /CREATE\s+POLICY\s+["']?([^"'\n]+)["']?\s+ON\s+(?:public\.|storage\.)?([a-zA-Z0-9_]+)([\s\S]*?);/gi;
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

    const polObj = { file, name: polName, tableName, command, roles, usingClause, withCheckClause };
    if (content.includes(`storage.objects`)) {
      bucketPolicies.push(polObj);
    }
    dbPolicies.push(polObj);
    if (dbTables.has(tableName)) {
      dbTables.get(tableName).policies.push(polObj);
    }
  }

  // VIEWS
  const viewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let vMatch;
  while ((vMatch = viewRegex.exec(content)) !== null) {
    dbViews.set(vMatch[1].toLowerCase(), { file });
  }

  // FUNCTIONS
  const funcRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*RETURNS\s+([a-zA-Z0-9_<>]+(?:\s+[a-zA-Z0-9_]+)?)/gi;
  let fMatch;
  while ((fMatch = funcRegex.exec(content)) !== null) {
    dbFunctions.set(fMatch[1].toLowerCase(), { file, args: fMatch[2].trim(), returnType: fMatch[3].trim() });
  }
}

// Load parsed database.ts AST
let tsAst = { tables: {}, enums: {}, functions: {} };
if (fs.existsSync('D:/01_SaaS_Products/Alparai/scratch/database_ts_ast.json')) {
  tsAst = JSON.parse(fs.readFileSync('D:/01_SaaS_Products/Alparai/scratch/database_ts_ast.json', 'utf8'));
}

const tsTableNames = Object.keys(tsAst.tables).map(t => t.toLowerCase());
const tsEnumNames = Object.keys(tsAst.enums).map(e => e.toLowerCase());
const tsFuncNames = Object.keys(tsAst.functions).map(f => f.toLowerCase());

console.log('=== CROSS-VALIDATION SUMMARY ===');
console.log(`DB Migrations Tables: ${dbTables.size}`);
console.log(`TS Database.ts Tables: ${tsTableNames.length}`);
console.log(`DB Migrations Enums: ${dbEnums.size}`);
console.log(`TS Database.ts Enums: ${tsEnumNames.length}`);
console.log(`DB Migrations Functions: ${dbFunctions.size}`);
console.log(`TS Database.ts Functions: ${tsFuncNames.length}`);

// 1. Table Alignment Check
const missingInTs = [];
for (const [tbl] of dbTables) {
  if (!tsTableNames.includes(tbl)) missingInTs.push(tbl);
}

const extraInTs = [];
for (const tbl of tsTableNames) {
  if (!dbTables.has(tbl) && !dbViews.has(tbl)) extraInTs.push(tbl);
}

// 2. Column Discrepancies
const columnDiscrepancies = [];
for (const [tbl, tData] of dbTables) {
  if (tsAst.tables[tbl]) {
    const tsCols = Object.keys(tsAst.tables[tbl]).map(c => c.toLowerCase());
    const dbCols = Array.from(tData.columns.keys());
    
    const missingColsInTs = dbCols.filter(c => !tsCols.includes(c));
    const extraColsInTs = tsCols.filter(c => !dbCols.includes(c));

    if (missingColsInTs.length > 0 || extraColsInTs.length > 0) {
      columnDiscrepancies.push({
        table: tbl,
        missingInTs: missingColsInTs,
        extraInTs: extraColsInTs
      });
    }
  }
}

// 3. Security & RLS Analysis
const rlsDisabled = [];
const rlsZeroPolicies = [];
const piiTables = ['users', 'evidence', 'whistleblower_submissions', 'expert_applications', 'investor_applications', 'takedown_requests', 'incidents', 'api_keys', 'audit_log', 'cease_and_desist_logs', 'dsar_requests'];
const piiAudit = [];

for (const [tbl, tData] of dbTables) {
  if (!tData.rlsEnabled) {
    rlsDisabled.push(tbl);
  } else if (tData.policies.length === 0) {
    rlsZeroPolicies.push(tbl);
  }

  if (piiTables.includes(tbl)) {
    piiAudit.push({
      table: tbl,
      rlsEnabled: tData.rlsEnabled,
      policiesCount: tData.policies.length,
      policies: tData.policies.map(p => ({ name: p.name, command: p.command, roles: p.roles, using: p.usingClause }))
    });
  }
}

// Write consolidated audit JSON
const consolidatedReport = {
  stats: {
    migrationFiles: files.length,
    dbTables: dbTables.size,
    tsTables: tsTableNames.length,
    dbEnums: dbEnums.size,
    tsEnums: tsEnumNames.length,
    dbFunctions: dbFunctions.size,
    tsFunctions: tsFuncNames.length,
    dbViews: dbViews.size,
    totalPolicies: dbPolicies.length
  },
  missingInTs,
  extraInTs,
  columnDiscrepancies,
  rlsDisabled,
  rlsZeroPolicies,
  piiAudit
};

fs.writeFileSync('D:/01_SaaS_Products/Alparai/scratch/comprehensive_audit_final.json', JSON.stringify(consolidatedReport, null, 2));
console.log('Saved to scratch/comprehensive_audit_final.json');
