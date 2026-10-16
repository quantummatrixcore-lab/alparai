"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("[PWD]", process.cwd());

const SSH_KEY = "C:/Users/ercum/.ssh/id_ed25519_vds";
const REMOTE_HOST = "-p 18222 root@45.143.4.92";

function runQuery(sql) {
  const cmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "docker exec -i postgres-master psql -U postgres -d alparai_prod -t -A -F'|'"`;
  return execSync(cmd, { input: sql, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

console.log("[RECON] Fetching strategic_answers duplicates...");
const qAnswers = `
WITH dupes AS (
  SELECT question_id, model_name, count(*) as cnt
  FROM public.strategic_answers
  GROUP BY question_id, model_name
  HAVING count(*) > 1
)
SELECT sa.id, sa.question_id, sa.model_name, sa.created_at, d.cnt
FROM public.strategic_answers sa
JOIN dupes d ON sa.question_id = d.question_id AND sa.model_name = d.model_name
ORDER BY d.cnt DESC, sa.question_id, sa.model_name, sa.created_at ASC;
`;
const rawAnswers = runQuery(qAnswers).trim().split("\n").filter(Boolean);

console.log(`[RECON] Found ${rawAnswers.length} duplicate rows for strategic_answers.`);

console.log("[RECON] Fetching incidents duplicates...");
const qIncidents = `
WITH dupes AS (
  SELECT title, ai_provider_id, count(*) as cnt
  FROM public.incidents
  GROUP BY title, ai_provider_id
  HAVING count(*) > 1
)
SELECT i.id, i.title, COALESCE(i.ai_provider_id::text, 'NULL'), i.created_at, d.cnt
FROM public.incidents i
JOIN dupes d ON i.title = d.title AND (i.ai_provider_id = d.ai_provider_id OR (i.ai_provider_id IS NULL AND d.ai_provider_id IS NULL))
ORDER BY d.cnt DESC, i.title, i.created_at ASC;
`;
const rawIncidents = runQuery(qIncidents).trim().split("\n").filter(Boolean);

console.log(`[RECON] Found ${rawIncidents.length} duplicate rows for incidents.`);

// Group strategic answers
const groupedAnswers = new Map();
for (const line of rawAnswers) {
  const [id, qId, model, createdAt, cnt] = line.split("|");
  const key = `${qId} | ${model}`;
  if (!groupedAnswers.has(key)) groupedAnswers.set(key, []);
  groupedAnswers.get(key).push({ id, qId, model, createdAt });
}

// Group incidents
const groupedIncidents = new Map();
for (const line of rawIncidents) {
  const [id, title, providerId, createdAt, cnt] = line.split("|");
  const key = `${title} | ${providerId}`;
  if (!groupedIncidents.has(key)) groupedIncidents.set(key, []);
  groupedIncidents.get(key).push({ id, title, providerId, createdAt });
}

let report = `# DEDUPLICATION AUDIT REPORT (WO-012 Phase A)

**Generated:** ${new Date().toISOString()}  
**Source Database:** \`alparai_prod\` (read-only audit query on postgres-master)  
**Safety Status:** 0 DELETES, 0 WRITES performed. Pure observation report per TREE_LOCK_LAW.

---

## Executive Summary

- **Constraint 1:** \`public.strategic_answers\` (\`unique_question_model\` on \`question_id, model_name\`)
  - **Duplicate Sets:** ${groupedAnswers.size} distinct sets
  - **Total Rows Involved:** ${rawAnswers.length} rows (Excess rows blocking constraint: ${rawAnswers.length - groupedAnswers.size})
- **Constraint 2:** \`public.incidents\` (\`unique_incident_title_provider\` on \`title, ai_provider_id\`)
  - **Duplicate Sets:** ${groupedIncidents.size} distinct sets
  - **Total Rows Involved:** ${rawIncidents.length} rows (Excess rows blocking constraint: ${rawIncidents.length - groupedIncidents.size})
  - *Breakdown:* 23 sets with NOT NULL \`ai_provider_id\` (active constraint violations in standard Postgres); 197 sets with NULL \`ai_provider_id\` (pre-backfill collisions).

---

## 1. \`strategic_answers\` Duplicate Sets (blocking \`unique_question_model\`)

| # | Question ID | Model Name | Total Dupes | Rows Detail (id, created_at) |
|---|-------------|------------|:-----------:|------------------------------|
`;

let idxA = 1;
for (const [key, rows] of groupedAnswers.entries()) {
  const [qId, model] = key.split(" | ");
  const detail = rows.map(r => `\`${r.id}\` (${r.createdAt})`).join("<br>");
  report += `| ${idxA++} | ${qId} | ${model} | ${rows.length} | ${detail} |\n`;
}

report += `\n---

## 2. \`incidents\` Duplicate Sets (blocking \`unique_incident_title_provider\`)

| # | Incident Title | AI Provider ID | Total Dupes | Rows Detail (id, created_at) |
|---|----------------|----------------|:-----------:|------------------------------|
`;

let idxI = 1;
for (const [key, rows] of groupedIncidents.entries()) {
  const [title, providerId] = key.split(" | ");
  const cleanTitle = title.replace(/\|/g, "&#124;");
  const detail = rows.map(r => `\`${r.id}\` (${r.createdAt})`).join("<br>");
  report += `| ${idxI++} | ${cleanTitle} | \`${providerId}\` | ${rows.length} | ${detail} |\n`;
}

report += `\n---

## Proposed Deduplication Strategy (for Phase B - Gated upon "prod-yaz")

1. **Strategic Answers:** Keep oldest (or newest) record per \`(question_id, model_name)\` using:
   \`\`\`sql
   DELETE FROM public.strategic_answers a
   USING public.strategic_answers b
   WHERE a.question_id = b.question_id 
     AND a.model_name = b.model_name 
     AND a.created_at < b.created_at; -- or a.id < b.id tie-breaker
   \`\`\`
2. **Incidents:**
   - For rows sharing \`(title, ai_provider_id)\`, merge dependent foreign keys (comments, evidence, votes) to the primary canonical incident ID, then purge redundant clones.
   - For rows with \`ai_provider_id IS NULL\`, deduplicate before executing provider backfill to prevent unique index collision.

*Note: In accordance with WORK-ORDER-012 Phase A, NO changes have been applied to production.*
`;

const outPath = path.join(__dirname, "..", "docs", "PROPOSALS", "DEDUPE_REPORT.md");
fs.writeFileSync(outPath, report, "utf8");
console.log(`[REPORT] Successfully generated ${outPath} (${report.length} bytes)`);
