const fs = require("fs");

// Read old as UTF-8 (git HEAD)
const oldDbRaw = fs.readFileSync("database_old.ts");
let oldDb = oldDbRaw[0] === 0xef ? oldDbRaw.toString("utf8", 3) : oldDbRaw.toString("utf8");

// Read new as UTF-16LE
const newDbRaw = fs.readFileSync("database_new.ts");
let newDb = newDbRaw[0] === 0xff ? newDbRaw.toString("utf16le") : newDbRaw.toString("utf8");
if (newDb[0] === "\uFEFF") newDb = newDb.slice(1);

function extractBlock(db, key) {
  const startStr = `      ${key}: {\r\n`;
  const startStr2 = `      ${key}: {\n`;
  let startIdx = db.indexOf(startStr);
  if (startIdx === -1) startIdx = db.indexOf(startStr2);
  if (startIdx === -1) return null;

  let endIdx = startIdx;
  let braceCount = 0;
  let started = false;

  for (let i = startIdx; i < db.length; i++) {
    if (db[i] === "{") {
      braceCount++;
      started = true;
    } else if (db[i] === "}") {
      braceCount--;
    }

    if (started && braceCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
  return { start: startIdx, end: endIdx, content: db.slice(startIdx, endIdx) };
}

const aiPollsNew = extractBlock(newDb, "ai_polls");
const aiProvidersNew = extractBlock(newDb, "ai_providers");

if (!aiPollsNew || !aiProvidersNew) {
  console.error("Could not find blocks in new DB");
  process.exit(1);
}

// In oldDb, ai_polls does not exist, so we inject it right before ai_providers
const aiProvidersOld = extractBlock(oldDb, "ai_providers");
if (!aiProvidersOld) {
  console.error("Could not find ai_providers in old DB");
  process.exit(1);
}

const merged =
  oldDb.slice(0, aiProvidersOld.start) +
  aiPollsNew.content +
  ",\n" +
  aiProvidersNew.content +
  oldDb.slice(aiProvidersOld.end);

fs.writeFileSync("src/types/database.ts", merged, "utf8");
console.log("Successfully injected ai_polls and updated ai_providers!");
