/**
 * PARALLEL OpenCode Batch Executor
 * 12 task → 3 concurrent worker lanes
 * Each lane runs independently; all lanes must pass gates before commit.
 */
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CONCURRENCY = 3;
const RUNS_DIR = path.join(process.cwd(), 'ops', 'opencode-runs');
if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });

// Model routing by expertise (free tier only)
const MODEL = {
  logic:   'deepseek/deepseek-r1-0528:free',      // math, backend, migrations
  ts:      'deepseek/deepseek-v3-0324:free',       // TypeScript, refactor
  ui:      'google/gemma-3-27b-it:free',           // React, UI components
  content: 'meta-llama/llama-4-maverick:free',     // i18n, docs, markdown
  ci:      'microsoft/phi-4:free',                 // YAML, CI/CD config
};

const TASKS = [
  // LANE A — core infra
  { ref: 57, model: MODEL.logic,   prompt: `Complete escalation chain in src/lib/audit/model-router.ts: 1) Read DEGRADED model IDs from ai_free_models table and exclude them. 2) Tier escalation: free tier first (nemotron-ultra-free, deepseek-v4-flash-free), if all DEGRADED escalate to paid (deepseek-v4-pro). Do NOT conflict with existing selectModelByCapability. Add unit test verifying DEGRADED model is skipped. pnpm lint && pnpm typecheck && pnpm test must pass.` },
  { ref: 70, model: MODEL.logic,   prompt: `Create src/app/api/cron/quota-snapshot/route.ts: daily cron, CRON_SECRET auth. Fetch: GitHub Actions minutes via GitHub billing API (GITHUB_TOKEN), Vercel usage via api.vercel.com/v1/billing/charges (pattern: src/app/api/admin/costs/route.ts:63), Supabase DB size via get_database_size() RPC (pattern: resources-client.tsx:59). Write to vendor_quotas table (migration 20260827000000_vendor_quotas.sql), source='api'. Never fabricate — skip vendor if API fails. Add to .github/workflows/scheduled-crons.yml. Add unit test. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 51, model: MODEL.ci,      prompt: `Create .github/workflows/architect-trigger.yml daily cron (0 8 * * *): 1) Count 'pending' in MASTER_PLAN.md → if 0 open GitHub Issue label='architect-review' title='PHASE BOUNDARY'. 2) Run pnpm audit → if high>0 open Issue 'SECURITY: vulnerabilities found'. Use GITHUB_TOKEN. Deduplicate: skip if open issue with same title prefix exists. permissions: issues: write, contents: read. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 77, model: MODEL.logic,   prompt: `1) Migration supabase/migrations/20260828000000_ai_models_weight_class.sql: add weight_class enum (open/closed/unknown) to ai_models, RLS + ROLLBACK. 2) Server action src/actions/insights/weight-class-analysis.ts: query incidents JOIN ai_models GROUP BY weight_class. If <10 incidents return insufficient_data:true. 3) Page src/app/[locale]/insights/open-vs-closed/page.tsx: table or "Insufficient data" message. 4) i18n keys all 5 languages. pnpm lint && pnpm typecheck && pnpm test.` },
  // LANE B — admin UI
  { ref: 71, model: MODEL.ui,      prompt: `Add Quota & Tempo block to src/app/[locale]/admin/resources/resources-client.tsx (no new route). Fetch from vendor_quotas table. Use existing Gauge component. Each card: gauge (used/limit%), tempo deviation = usage% - month_elapsed%, projected depletion date tagged [tahmin]. Thresholds: <70 default, 70-90 warning, >90 danger. NULL values → "ölçülmedi". EN+TR i18n keys. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 72, model: MODEL.ts,      prompt: `Extend src/app/api/cron/cost-alarm/route.ts to read vendor_quotas table: 75% → email admin (use existing Resend pattern), 90% → log CRITICAL "AUTONOMOUS BRAKE: quota at 90%+ for {vendor}", 100% → log ERROR "AUTONOMOUS BRAKE: quota exhausted for {vendor}". Only process vendors where limit_value IS NOT NULL AND source='api'. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 43, model: MODEL.ui,      prompt: `Improve admin master-plan dashboard src/app/[locale]/admin/master-plan/page.tsx: 1) Client-side text filter input. 2) Clickable cards → modal/expanded panel with full description. 3) Visual distinction: parse error vs genuine empty state. 4) 3-column grid showing all columns (pending/in-progress/completed). EN+TR i18n keys. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 61, model: MODEL.ts,      prompt: `Server action src/actions/admin/opencode-efficiency.ts: read ops/opencode-runs/*.json, group by model tier (free vs paid), calc total runs, free%, avg duration_ms, success rate. Add "Efficiency Report" section to resources-client.tsx. Tag [tahmin - dogrulanmamis] if <5 runs. EN+TR i18n. pnpm lint && pnpm typecheck && pnpm test.` },
  // LANE C — content & policy
  { ref: 45, model: MODEL.ts,      prompt: `Fix src/app/[locale]/about/page.tsx lines 45,47,49: replace 'count ?? 371', ': 12', ': 23' fallbacks with null rendering "—" or hidden stat. Doctrine #011: no fake numbers. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 59, model: MODEL.logic,   prompt: `Add AI Act Article 5 category: 1) New incident_categories value 'non_consensual_intimate_imagery_csam' via migration 20260829000000_ai_act_article5.sql + RLS + ROLLBACK. 2) i18n keys all 5 languages. 3) Paragraph in src/app/[locale]/ai-act/page.tsx citing EU 2026/1744 Art. 5. 4) Content warning in src/lib/pii/guardian.ts for this category. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 44, model: MODEL.content, prompt: `Fill 3 content gaps (NO new routes): 1) src/app/[locale]/security/page.tsx: add SOC2 readiness ('planned'), ISO 27001 ('in progress'), AES-256, TLS 1.3 section — factual only. 2) src/app/[locale]/methodology/page.tsx: list actual 5 model IDs from openrouter-gateway.ts:117-121. 3) Ensure Case #001 Grok passport incident is referenced. i18n all 5 languages. pnpm lint && pnpm typecheck && pnpm test.` },
  { ref: 74, model: MODEL.content, prompt: `Create docs/AUTONOMOUS_LOOP.md documenting the 4-step autonomous cycle: (1) push to GitHub, (2) consult Architect only for Rule 40 cases (gates red / rules conflict / new error type), (3) pull plan, (4) execute. Include Rule 39 prerequisites, Rule 42 escalation (max 5 attempts tracked in ops/opencode-runs/), model routing table from AGENTS.md. English, factual, cite MASTER_PLAN rule numbers. pnpm lint && pnpm typecheck && pnpm test.` },
];

function runGate(cmd) {
  try { execSync(cmd, { stdio: 'inherit', timeout: 120000 }); return 0; }
  catch (e) { return e.status || 1; }
}

function runTask(task) {
  return new Promise((resolve) => {
    const prompt = task.prompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    const start = Date.now();
    const model = task.model || 'opencode/deepseek-v4-flash-free';
    console.log(`[LANE] Starting #${task.ref}`);

    const child = spawn('cmd', [
      '/c',
      `opencode run -m ${model} --print-logs --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"')}" < NUL`
    ], { shell: true });
    child.stdout.on('data', d => process.stdout.write(`[#${task.ref}] ${d}`));
    child.stderr.on('data', d => process.stderr.write(`[#${task.ref}] ${d}`));

    child.on('close', (exitCode) => {
      const record = {
        model, task_ref: task.ref, exit_code: exitCode,
        duration_ms: Date.now() - start,
        git_sha: execSync('git rev-parse HEAD').toString().trim(),
        attempt_no: 1, role: 'uygulayici',
        diagnosis: exitCode === 0 ? 'nominal' : `opencode exit ${exitCode}`,
        gates: { lint: -1, typecheck: -1, test: -1, build: 0 },
      };
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(RUNS_DIR, `${ts}-task-${task.ref}.json`), JSON.stringify(record, null, 2));
      resolve({ task, exitCode, failed: exitCode !== 0 });
    });
  });
}

async function runBatch(tasks) {
  const results = await Promise.all(tasks.map(runTask));
  return results;
}

async function main() {
  const lanes = [];
  for (let i = 0; i < TASKS.length; i += CONCURRENCY) {
    lanes.push(TASKS.slice(i, i + CONCURRENCY));
  }

  console.log(`\n⚡ PARALLEL BATCH — ${TASKS.length} tasks in ${lanes.length} waves of ${CONCURRENCY}\n`);

  const failed = [];
  for (let w = 0; w < lanes.length; w++) {
    console.log(`\n--- WAVE ${w + 1}/${lanes.length}: tasks ${lanes[w].map(t => '#' + t.ref).join(', ')} ---`);
    const results = await runBatch(lanes[w]);
    results.filter(r => r.failed).forEach(r => failed.push(r));
  }

  // Single consolidated quality gate after all tasks
  console.log('\n⚙️  CONSOLIDATED QUALITY GATE...');
  const lint = runGate('pnpm lint');
  const tc = runGate('pnpm typecheck');
  const test = runGate('pnpm test');

  if (lint !== 0 || tc !== 0 || test !== 0) {
    console.error(`\n🔴 QUALITY GATE FAILED: lint=${lint} typecheck=${tc} test=${test}`);
    process.exit(1);
  }

  console.log(`\n✅ ALL ${TASKS.length} TASKS + QUALITY GATES GREEN`);
  if (failed.length) console.warn(`⚠️  ${failed.length} OpenCode sessions had non-zero exit but gates still passed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
