import fs from "fs";

const file = "docs/MASTER_PLAN.md";
let content = fs.readFileSync(file, "utf8");

const lines = content.split("\n");
const s = lines.findIndex((l) => l.includes("FOUNDER_BACKLOG_START"));
const e = lines.findIndex((l) => l.includes("FOUNDER_BACKLOG_END"));

const newLines = [];
const seenIds = new Set();

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (i > s && i < e && line.trim().startsWith("|") && !line.includes("---") && !line.includes("Item ID")) {
    // If line has multiple rows concatenated, split them
    if (line.includes("| 40 | P1 |") || line.includes("| 39 | P1 |")) {
      const parts = line.split(/(?=\| \d+ \|)/);
      for (const p of parts) {
        if (p.trim()) {
          processRow(p);
        }
      }
      continue;
    }
    processRow(line);
  } else {
    newLines.push(line);
  }
}

function processRow(rowStr) {
  let str = rowStr.trim();
  if (!str.startsWith("|")) return;

  const rawParts = str.split("|").map((p) => p.trim());
  // rawParts format: ["", ID, Priority, Title, Description, Status, ""] or similar
  const filtered = rawParts.filter((p, idx) => idx > 0 && idx < rawParts.length - (rawParts[rawParts.length - 1] === "" ? 1 : 0));
  
  if (filtered.length < 3) return;

  const id = filtered[0];
  if (!id || !/^\d+$/.test(id)) return;

  // Deduplicate: if already seen, prefer completed version
  if (seenIds.has(id)) {
    if (rowStr.includes("✅")) {
      const existingIdx = newLines.findIndex((l) => l.startsWith(`| ${id} |`));
      if (existingIdx !== -1) {
        newLines[existingIdx] = formatNormalizedRow(filtered);
        return;
      }
    } else {
      return;
    }
  }

  seenIds.add(id);
  newLines.push(formatNormalizedRow(filtered));
}

function formatNormalizedRow(cols) {
  // cols: [ID, Priority, Title, Description, Status] or [ID, Priority, Title, DescriptionAndStatus]
  const id = cols[0];
  const priority = cols[1] || "P1";
  const title = cols[2] || "";

  let description = "";
  let status = "pending";

  if (cols.length >= 4) {
    let rawDesc = cols[3];
    let rawStatus = cols[4] || "";

    if (!rawStatus && rawDesc.includes("✅ completed")) {
      const idx = rawDesc.indexOf("✅ completed");
      status = rawDesc.substring(idx).trim();
      description = rawDesc.substring(0, idx).trim() || title;
    } else if (cols.length > 5) {
      // Extra pipes inside description
      rawStatus = cols[cols.length - 1];
      description = cols.slice(3, cols.length - 1).join(" / ").replace(/\|/g, "/").trim();
      status = rawStatus;
    } else {
      description = rawDesc.replace(/\|/g, "/").trim();
      status = rawStatus || "pending";
    }
  }

  // Ensure clean escape of internal pipes in description
  description = description.replace(/\|/g, "/").trim();
  status = status.replace(/\|/g, "/").trim();

  return `| ${id} | ${priority} | ${title} | ${description} | ${status} |`;
}

fs.writeFileSync(file, newLines.join("\n"), "utf8");
console.log("MASTER_PLAN table completely normalized.");
