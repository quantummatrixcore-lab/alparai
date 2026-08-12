#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const masterPlanPath = path.join(rootDir, "docs/MASTER_PLAN.md");
const itemsDir = path.join(rootDir, "docs/plan/items");

// Create items directory
if (!fs.existsSync(itemsDir)) {
  fs.mkdirSync(itemsDir, { recursive: true });
}

const content = fs.readFileSync(masterPlanPath, "utf8");
const startMarker = "<!-- FOUNDER_BACKLOG_START -->";
const endMarker = "<!-- FOUNDER_BACKLOG_END -->";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("ERROR: Backlog markers not found");
  process.exit(1);
}

const beforeBacklog = content.substring(0, startIdx + startMarker.length);
const backlogSection = content.substring(
  startIdx + startMarker.length,
  endIdx
);
const afterBacklog = content.substring(endIdx);

const lines = backlogSection.split("\n");

// Filter to data rows: start with |, not header (contains "Blok"), not separator (contains ---)
const dataRows = [];
let dataRowIndex = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (
    !line.startsWith("|") ||
    line.includes("Blok") ||
    line.includes("---")
  ) {
    continue;
  }
  dataRows.push({ line, dataRowIndex, backlogLineNum: i });
  dataRowIndex++;
}

console.log(`Found ${dataRows.length} data rows`);

// Hard-coded lookup table for rows with no explicit slug marker
// Keyed by distinctive substring of task cell, mapped to the slug that should be assigned
const FALLBACK_SLUG_MAP = {
  "Cloudflare WAF (#128)": "OMEGA-128",
  "Stripe canlı işlem / webhook doğrulama (#208)": "SIGMA-208",
  "Seed Data Room & Değerleme Memosu": "ALPHA-201",
  "400-satır CI sınırı (#209)": "ZETA-209",
  '"The Grok Files" serisinin 9-model': "OMEGA-198",
  "Top 50 YZ Vendor'a Trust Badge": "SIGMA-BADGE",
  "HN Show HN + Reddit senkron lansman": "OMEGA-199",
};

// First pass: check all rows for slugs and identify those needing fallback
const fallbackRows = [];
for (const { line, dataRowIndex, backlogLineNum } of dataRows) {
  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell !== "");

  if (cells.length >= 4) {
    const taskCell = cells[3];
    // Check if has slug (notation a: **SLUG at start of task cell, or notation b: [SLUG] at start of task cell)
    const notationA = /^\*\*\[?([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)/.test(taskCell);
    const notationB = /^\s*\[([A-Z][A-Z0-9]*(?:-[A-Z0-9a-z]+)*)\]/.test(taskCell);

    if (!notationA && !notationB) {
      // Check if matches fallback table
      let foundFallback = false;
      for (const [key, slug] of Object.entries(FALLBACK_SLUG_MAP)) {
        if (taskCell.includes(key)) {
          fallbackRows.push({ dataRowIndex, backlogLineNum, taskCell: taskCell.substring(0, 80), fallbackSlug: slug });
          foundFallback = true;
          break;
        }
      }
      if (!foundFallback) {
        console.error(`ERROR: Row ${dataRowIndex} (line ${backlogLineNum}) has no slug and no matching fallback entry:`);
        console.error(`  ${taskCell.substring(0, 120)}`);
        console.error(`\nExpected one of these patterns:`);
        Object.keys(FALLBACK_SLUG_MAP).forEach(key => {
          console.error(`  - ${key}`);
        });
        process.exit(1);
      }
    }
  }
}

if (fallbackRows.length > 0) {
  console.log(`Found ${fallbackRows.length} rows using hard-coded slug mapping:`);
  fallbackRows.forEach(row => {
    console.log(`  Row ${row.dataRowIndex}: ${row.fallbackSlug}`);
  });
}

// Parse each row
const items = [];
const slugSet = new Set();
const slugCounts = {};

for (const { line, dataRowIndex, backlogLineNum } of dataRows) {
  // Split by | and clean up
  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell !== "");

  if (cells.length < 5) {
    console.error(
      `ERROR: Row ${dataRowIndex} has fewer than 5 cells. Line ${backlogLineNum}: ${line.substring(0, 100)}`
    );
    process.exit(1);
  }

  const blockCell = cells[0]; // e.g., "SEC", "OMEGA", "SYNC"
  const priorityCell = cells[1]; // e.g., "P0", "P1", "P2"
  const ownerCell = cells[2]; // e.g., "Founder", "Antigravity"
  const taskCell = cells[3]; // The task description - may contain everything
  const statusCell = cells[4]; // The status

  // Extract slug from the row (validated in first pass above)
  let slug = null;

  // Notation A: **SLUG in the task cell
  let match = taskCell.match(/^\*\*\[?([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)/);
  if (match) {
    slug = match[1];
  } else {
    // Notation B: [SLUG] at the start of the task cell (allows lowercase after dash)
    match = taskCell.match(/^\s*\[([A-Z][A-Z0-9]*(?:-[A-Z0-9a-z]+)*)\]/);
    if (match) {
      slug = match[1];
    }
  }

  // Fallback: use hard-coded mapping for the 6 rows with no explicit marker
  if (!slug) {
    for (const [key, mappedSlug] of Object.entries(FALLBACK_SLUG_MAP)) {
      if (taskCell.includes(key)) {
        slug = mappedSlug;
        break;
      }
    }
  }

  if (!slug) {
    console.error(`INTERNAL ERROR: No slug derivable from row ${dataRowIndex}`);
    process.exit(1);
  }

  // Track for disambiguation
  if (!slugCounts[slug]) {
    slugCounts[slug] = 0;
  }
  slugCounts[slug]++;

  // Extract priority - normalize to P0/P1/P2
  let priority = "P1";
  if (priorityCell.startsWith("P0")) {
    priority = "P0";
  } else if (priorityCell.startsWith("P1")) {
    priority = "P1";
  } else if (priorityCell.startsWith("P2")) {
    priority = "P2";
  }

  // Extract closed-by citations from both task cell and status cell (format: closed-by:SHA@BRANCH)
  const allCellText = taskCell + " " + statusCell;
  const closedByMatches = allCellText.match(/closed-by:([a-f0-9]+)@([a-z-]+)/g);
  const closedBys = closedByMatches
    ? closedByMatches.map((m) => m.replace("closed-by:", ""))
    : [];
  const lastClosedBy = closedBys.length > 0 ? closedBys[closedBys.length - 1] : null;

  // Extract first few words as title (keep very short due to byte budget)
  // Remove **SLUG — or [SLUG] — patterns, including anything like (v13.17) after the slug
  let titleText = taskCell
    .replace(/^[\s\*\[]*[A-Z][A-Z0-9a-z]*(?:-[A-Z0-9a-z]+)*(?:\s*\([^)]*\))?\s*[\]\*]*\s*—\s*/, "") // Remove slug with possible version info
    .replace(/\*\*/g, ""); // Remove markdown bold

  // Limit title to ~20 bytes (very short, just first words)
  let title = titleText;
  if (Buffer.byteLength(title) > 25) {
    title = title.substring(0, 20);
  }
  title = title.trim();

  items.push({
    slug,
    priority,
    owner: ownerCell,
    status: statusCell,
    taskCell,
    title,
    closedBys,
    lastClosedBy,
    dataRowIndex,
    backlogLineNum,
  });
}

// Check for duplicates and assign numeric IDs
let nextId = 301;
const disambiguated = {};

for (const item of items) {
  let finalSlug = item.slug;
  if (slugCounts[item.slug] > 1) {
    // Multiple items with this slug - disambiguate with -a, -b, etc.
    if (!disambiguated[item.slug]) {
      disambiguated[item.slug] = 0;
    }
    const letters = "abcdefghijklmnopqrstuvwxyz";
    finalSlug =
      item.slug + "-" + letters[disambiguated[item.slug]];
    disambiguated[item.slug]++;
    console.warn(`WARN: Ambiguous slug ${item.slug}, renaming to ${finalSlug}`);
  }

  item.finalSlug = finalSlug;
  item.id = nextId++;
}

console.log(
  `Assigned ${items.length} sequential IDs starting at 301`
);

// Write detail files
const createdFiles = [];
for (const item of items) {
  const filename = `${item.finalSlug}.md`;
  const filepath = path.join(itemsDir, filename);

  const closedByLine =
    item.closedBys.length > 0
      ? item.closedBys.join(", ")
      : "—";

  const detail = `# ${item.finalSlug} — ${item.title}

- **Board id:** ${item.id}
- **Status:** ${item.status}
- **Priority:** ${item.priority}
- **Owner:** ${item.owner}
- **Closed by:** ${closedByLine}

## Record

${item.taskCell}
`;

  fs.writeFileSync(filepath, detail, "utf8");
  createdFiles.push(filename);
}

console.log(`Created ${createdFiles.length} detail files in docs/plan/items/`);

// Build new board rows
const boardRows = [];
for (const item of items) {
  // Extract minimal summary for board (full text in detail file)
  let summary = item.taskCell
    .replace(/^\s*\[?[A-Z][A-Z0-9a-z]*(?:-[A-Z0-9a-z]+)*(?:\s*\([^)]*\))?\s*[\]\*]*\s*—\s*/, "") // Remove slug
    .replace(/\*\*/g, "") // Remove bold
    .replace(/`/g, "") // Remove backticks
    .substring(0, 60); // Take only first 60 chars

  // Trim to a word boundary
  const spaceIdx = summary.lastIndexOf(" ");
  if (spaceIdx > 20) {
    summary = summary.substring(0, spaceIdx);
  }
  summary = summary.trim().substring(0, 55); // Hard cap at 55 chars

  // Build the detail link (short form to save bytes)
  const detailLink = `[↗](plan/items/${item.finalSlug}.md)`;

  // Build status cell - include closure citation if present
  let statusForBoard = item.status;

  // If status is very long, extract just the keyword
  if (Buffer.byteLength(statusForBoard) > 60) {
    const emojiMatch = statusForBoard.match(/^([\✓✅🔴⚠️]*)/);
    const emoji = emojiMatch ? emojiMatch[1] : "";
    const statusWord = statusForBoard.split(/[\s✓✅🔴⚠️]/)[1] || "?"; // Get word after emoji/space
    statusForBoard = emoji ? `${emoji} ${statusWord}` : statusWord;
  }

  // Ensure completed/closed items have their closure citation for G-7 compliance
  if ((statusForBoard.includes("completed") || statusForBoard.includes("closed")) && item.lastClosedBy) {
    if (!statusForBoard.includes("closed-by")) {
      statusForBoard = `${statusForBoard} ${item.lastClosedBy}`;
    }
  }

  // Build the row: # | Priority | Owner Slug — Title | Summary | Status | detail link
  // Abbreviate owner to first letters to save bytes
  const ownerAbbr = item.owner.split(' ').map(w => w[0]).join('').substring(0, 3);
  const row = `| ${item.id} | ${item.priority} | ${ownerAbbr} ${item.finalSlug} — ${item.title} | ${summary} ${detailLink} | ${statusForBoard} |`;

  // Check byte length
  const rowBytes = Buffer.byteLength(row, "utf8");
  if (rowBytes > 400) {
    console.error(
      `ERROR: Row ${item.id} exceeds 400 bytes: ${rowBytes} bytes`
    );
    console.error(`Row: ${row.substring(0, 200)}`);
    process.exit(1);
  }

  boardRows.push(row);
}

console.log(`Built ${boardRows.length} board rows`);
console.log(
  `Max row byte length: ${Math.max(...boardRows.map((r) => Buffer.byteLength(r, "utf8")))}`
);

// Build new backlog section
const headerRow = `| # | Ö. | Görev | Özet | Durum |`;
const separatorRow = `| --- | --- | --- | --- | --- |`;

const newBacklog =
  "\n" +
  headerRow +
  "\n" +
  separatorRow +
  "\n" +
  boardRows.join("\n") +
  "\n";

// Assemble new content
const newContent = beforeBacklog + newBacklog + afterBacklog;

// Write back to file
fs.writeFileSync(masterPlanPath, newContent, "utf8");

const newSize = Buffer.byteLength(newContent, "utf8");
console.log(
  `\nWrote updated MASTER_PLAN.md: ${newSize} bytes (was ${Buffer.byteLength(content, "utf8")} bytes)`
);

console.log("\n=== MIGRATION COMPLETE ===");
console.log(`Items migrated: ${items.length}`);
console.log(`Detail files created: ${createdFiles.length}`);
console.log(`New board size: ${newSize} bytes`);
console.log(`Max board row: ${Math.max(...boardRows.map((r) => Buffer.byteLength(r, "utf8")))} bytes`);
