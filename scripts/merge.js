const fs = require("fs");

const oldDbRaw = fs.readFileSync("database_old.ts");
const newDbRaw = fs.readFileSync("database_new.ts");
const oldDb = oldDbRaw[0] === 0xef ? oldDbRaw.toString("utf8", 3) : oldDbRaw.toString("utf8");
const newDb = newDbRaw[0] === 0xff ? newDbRaw.toString("utf16le") : newDbRaw.toString("utf8");

function extractTables(dbStr) {
  const startMatch = dbStr.match(/Tables: \{\n/);
  if (!startMatch) return { start: -1, end: -1, content: "" };
  const startIdx = startMatch.index + startMatch[0].length;

  let braceCount = 1;
  let endIdx = startIdx;
  while (braceCount > 0 && endIdx < dbStr.length) {
    if (dbStr[endIdx] === "{") braceCount++;
    if (dbStr[endIdx] === "}") braceCount--;
    endIdx++;
  }
  return { start: startIdx, end: endIdx - 1, content: dbStr.slice(startIdx, endIdx - 1) };
}

const oldTables = extractTables(oldDb);
const newTables = extractTables(newDb);

// We need to merge them. We'll split by top-level keys.
function getTableMap(tablesStr) {
  const map = new Map();
  let currentTable = null;
  let currentContent = "";
  let braceCount = 0;

  const lines = tablesStr.split("\n");
  for (const line of lines) {
    if (braceCount === 0 && line.match(/^ {8}([a-zA-Z0-9_]+): \{/)) {
      const tableName = line.match(/^ {8}([a-zA-Z0-9_]+): \{/)[1];
      currentTable = tableName;
      currentContent = line + "\n";
      braceCount = 1;
    } else if (currentTable) {
      currentContent += line + "\n";
      if (line.includes("{")) braceCount += (line.match(/\{/g) || []).length;
      if (line.includes("}")) braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0) {
        map.set(currentTable, currentContent);
        currentTable = null;
        currentContent = "";
      }
    }
  }
  return map;
}

const oldMap = getTableMap(oldTables.content);
const newMap = getTableMap(newTables.content);

// Merge: New takes precedence, but if a table is missing in New, take it from Old.
for (const [key, val] of oldMap.entries()) {
  if (!newMap.has(key)) {
    newMap.set(key, val);
  }
}

// Reconstruct
let mergedTablesContent = "";
for (const val of newMap.values()) {
  mergedTablesContent += val;
}

const mergedDb = newDb.slice(0, newTables.start) + mergedTablesContent + newDb.slice(newTables.end);
fs.writeFileSync("src/types/database.ts", mergedDb);
console.log("Merged database.ts created!");
