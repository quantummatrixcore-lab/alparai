import fs from "fs";

const planPath = process.env.NEGATIVE_TEST_MODE
  ? ".mock-plan-claims"
  : "docs/MASTER_PLAN.md";

if (!fs.existsSync(planPath)) {
  console.error(`ERROR: ${planPath} not found.`);
  process.exit(1);
}

const content = fs.readFileSync(planPath, "utf-8");

const CLAIM_PATTERNS = [
  /backlog\s+(?:has\s+been\s+|is\s+|was\s+)?(?:fully\s+|entirely\s+)?clear(?:ed)?/i,
  /all\s+(?:the\s+)?gates?\s+(?:are\s+|were\s+|have\s+been\s+)?(?:closed|passed)/i,
  /build\s+is\s+(?:completely|fully|entirely)\s+green/i,
  /(?:platform|project|repository)\s+is\s+(?:now\s+)?(?:live\s+and\s+)?investment[-\s]ready/i,
  /all\s+(?:fabricated|false)\s+claims\s+have\s+been\s+purged/i,
];

const SHA_PATTERN = /\b[0-9a-f]{7,40}\b/;

// A line that *describes* a claim is not a line that *makes* one. Without this,
// the section retracting a false report trips the check that found it.
const META_PATTERN =
  /\b(claim|claims|claimed|claiming|report|reports|reported|reporting|retract|retracted|alleg|assert|asserts|asserted|stating|stated|refut|false)\b/i;

const lines = content.split("\n");
const sections = [];
let current = null;
for (const line of lines) {
  if (line.startsWith("## ")) {
    current = { heading: line.slice(3).trim(), lines: [] };
    sections.push(current);
  } else if (current) {
    current.lines.push(line);
  }
}

const backlogSection = sections.find((s) => /^\d+\.\s+Active backlog/i.test(s.heading));
const openP0Count = backlogSection
  ? backlogSection.lines.filter((l) => l.trim().startsWith("|") && l.includes("**P0**")).length
  : 0;

let failed = false;

for (const section of sections) {
  const claims = [];
  for (const line of section.lines) {
    if (line.trim().startsWith(">")) continue;
    if (META_PATTERN.test(line)) continue;
    for (const pattern of CLAIM_PATTERNS) {
      if (pattern.test(line)) {
        claims.push(line.trim().slice(0, 140));
        break;
      }
    }
  }
  if (claims.length === 0) continue;

  const body = section.lines.join("\n");

  if (openP0Count > 0) {
    console.error(
      `\nERROR: "${section.heading}" claims completion while ${openP0Count} P0 row(s) remain open in the Active backlog.`
    );
    for (const c of claims) console.error(`  claim: ${c}`);
    console.error(
      "  A completion claim must be retracted (quote the line as a blockquote with a correction) or the rows closed."
    );
    failed = true;
  }

  if (!SHA_PATTERN.test(body)) {
    console.error(
      `\nERROR: "${section.heading}" claims completion but cites no commit SHA (G-7: pushed or it did not happen).`
    );
    failed = true;
  }
}

if (failed) {
  console.error("\n❌ Plan claim check FAILED.");
  process.exit(1);
}

console.log(
  `✅ Plan claim check PASSED. (${openP0Count} open P0 row(s); no unsupported completion claim.)`
);
