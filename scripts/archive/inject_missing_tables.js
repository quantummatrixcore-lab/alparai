const fs = require("fs");
const path = require("path");

const newFile = path.join(__dirname, "database_new.ts");
const targetFile = path.join(__dirname, "src", "types", "database.ts");

// 1. Read files
let newContent = fs.readFileSync(newFile);
// Detect UTF-16LE BOM
if (newContent[0] === 0xff && newContent[1] === 0xfe) {
  newContent = newContent.toString("utf16le");
} else {
  newContent = newContent.toString("utf8");
}

let targetContent = fs.readFileSync(targetFile, "utf8");

// 2. Helper to extract tables
function extractTables(content) {
  const tables = {};
  const publicStart = content.indexOf("public: {");
  if (publicStart === -1) return tables;
  const pubTablesStart = content.indexOf("Tables: {", publicStart);
  if (pubTablesStart === -1) return tables;

  let braceCount = 0;
  let tablesBlockStart = -1;
  let tablesBlockEnd = -1;

  for (let i = pubTablesStart; i < content.length; i++) {
    if (content[i] === "{") {
      if (braceCount === 0) tablesBlockStart = i + 1;
      braceCount++;
    } else if (content[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        tablesBlockEnd = i;
        break;
      }
    }
  }

  if (tablesBlockStart === -1 || tablesBlockEnd === -1) return tables;

  let i = tablesBlockStart;
  while (i < tablesBlockEnd) {
    // Skip whitespace
    while (i < tablesBlockEnd && /\s/.test(content[i])) i++;
    if (i >= tablesBlockEnd) break;

    let match = content.substring(i).match(/^([a-zA-Z0-9_]+)\s*:\s*\{/);
    if (match) {
      let name = match[1];
      let start = i;
      let tableBraceCount = 0;
      let tableEnd = -1;
      // find opening brace of the table block
      let braceIndex = content.indexOf("{", start);
      for (let j = braceIndex; j < tablesBlockEnd; j++) {
        if (content[j] === "{") tableBraceCount++;
        if (content[j] === "}") {
          tableBraceCount--;
          if (tableBraceCount === 0) {
            tableEnd = j + 1;
            break;
          }
        }
      }
      if (tableEnd !== -1) {
        tables[name] = content.substring(start, tableEnd).trim();
        i = tableEnd;
        // skip comma if present
        if (content[i] === ",") i++;
      } else {
        break;
      }
    } else {
      i++;
    }
  }
  return tables;
}

const newTables = extractTables(newContent);
const targetTables = extractTables(targetContent);

const tablesToInject = [];

// Inject specified missing tables, plus any others that might be missing
for (const [name, def] of Object.entries(newTables)) {
  if (!targetTables[name]) {
    tablesToInject.push({ name, def });
  }
}

if (tablesToInject.length === 0) {
  console.log("No missing tables found between database_new.ts and database.ts.");
  process.exit(0);
}

console.log(`Found ${tablesToInject.length} missing tables. Injecting...`);
tablesToInject.forEach((t) => console.log(` - ${t.name}`));

// 3. Inject into target database.ts
const publicStart = targetContent.indexOf("public: {");
const pubTablesStart = targetContent.indexOf("Tables: {", publicStart);

let braceCount = 0;
let insertPosition = -1;
for (let i = pubTablesStart; i < targetContent.length; i++) {
  if (targetContent[i] === "{") braceCount++;
  if (targetContent[i] === "}") {
    braceCount--;
    if (braceCount === 0) {
      insertPosition = i;
      break;
    }
  }
}

if (insertPosition !== -1) {
  let injectionString = "";
  // Check if we need a preceding comma
  let beforeInsert = targetContent.substring(0, insertPosition).trim();
  let needsComma =
    beforeInsert.length > 0 &&
    beforeInsert[beforeInsert.length - 1] !== "{" &&
    beforeInsert[beforeInsert.length - 1] !== ",";

  if (needsComma) {
    injectionString += ",\n";
  } else {
    injectionString += "\n";
  }

  for (let i = 0; i < tablesToInject.length; i++) {
    // Fix indentation for the injected block
    let lines = tablesToInject[i].def.split("\n");
    let indentedDef = lines.map((l, idx) => (idx === 0 ? l : "      " + l.trimStart())).join("\n");

    injectionString += "      " + indentedDef;
    if (i < tablesToInject.length - 1) {
      injectionString += ",\n";
    }
  }
  injectionString += "\n    ";

  const finalContent =
    targetContent.substring(0, insertPosition) +
    injectionString +
    targetContent.substring(insertPosition);
  fs.writeFileSync(targetFile, finalContent, "utf8");
  console.log("✅ Successfully injected missing tables into database.ts");
} else {
  console.error("❌ Could not find insert position in target database.ts");
}
