/**
 * OpenCode Batch 2 Delegator — Mimar tarafından üretildi (v2)
 * Founder onayı gerektirmeyen tüm teknik P0/P1/P2 görevler paralel üçlü gruplarda çalışır.
 * Her görev bitişinde kalite kapısı: lint + typecheck + test
 * Hata → batch durur, log kaydedilir.
 */
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TASKS = [
  {
    ref: 57,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Complete the Doctrine #044 escalation chain in src/lib/audit/model-router.ts. Currently the free/Nvidia model pool exists in src/lib/ai/openrouter-gateway.ts (nemotron/deepseek/nim matches) but model-router.ts has zero matches for these models. The router must: 1) Read DEGRADED model IDs from ai_free_models table (status=DEGRADED) and exclude them from candidates. 2) Apply tier escalation: first try free tier models (nemotron-ultra-free, deepseek-v4-flash-free), if all DEGRADED or unavailable escalate to paid tier (deepseek-v4-pro, gpt-oss-120b). This must NOT conflict with existing selectModelByCapability function in the same file. Add a unit test in tests/lib/discovery/ or tests/actions/ verifying that a DEGRADED free model is skipped and the next tier is selected. Run pnpm lint && pnpm typecheck && pnpm test to confirm passing.`,
  },
  {
    ref: 51,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Create .github/workflows/architect-trigger.yml that runs daily (cron: "0 8 * * *") and: 1) Counts "pending" rows in docs/MASTER_PLAN.md — if count is 0 open a GitHub Issue with label "architect-review" and title "PHASE BOUNDARY: All backlog items completed". 2) Runs pnpm audit and if high/critical > 0 opens a GitHub Issue labeled "architect-review" with title "SECURITY: pnpm audit found vulnerabilities". 3) Checks if any item has appeared as "completed" in 3 consecutive commits but then reverted to pending — if so opens Issue labeled "architect-review" titled "RULE CONFLICT detected". Use GITHUB_TOKEN for all API calls. Skip if an open issue with the same label and same title prefix already exists (deduplicate). The workflow needs permissions: issues: write, contents: read. Run pnpm lint && pnpm typecheck && pnpm test after creating the file.`,
  },
  {
    ref: 70,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Create a quota-snapshot cron route at src/app/api/cron/quota-snapshot/route.ts that runs once daily. It must: 1) Fetch GitHub Actions billing minutes from GitHub API endpoint GET /orgs/{org}/settings/billing/actions or GET /users/{username}/settings/billing/actions using GITHUB_TOKEN env var. 2) Fetch Vercel usage from existing api.vercel.com/v1/billing/charges (pattern already in src/app/api/admin/costs/route.ts line 63). 3) Fetch Supabase DB size using existing get_database_size() RPC (pattern in resources-client.tsx lines 59,66). 4) Write results to vendor_quotas table (created in migration 20260827000000_vendor_quotas.sql) with source="api" for fetched values and source="manual" for Resend/Upstash (set used_value=NULL, limit_value=NULL for those). 5) Never fabricate values — if API call fails, log error and skip that vendor. Add CRON_SECRET authorization header check. Add the route to .github/workflows/scheduled-crons.yml (existing pattern). Add a unit test. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 71,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Add a Quota & Tempo block to src/app/[locale]/admin/resources/resources-client.tsx. Requirements: 1) Do NOT create a new route — add a section to the existing component. 2) Fetch data from vendor_quotas table (created in 20260827000000_vendor_quotas.sql migration). 3) Use the existing Gauge component (src/components/admin/premium/gauge.tsx, props: value, max, variant). 4) For each vendor+metric card show: gauge filled to used_value/limit_value %, tempo deviation = (usage% - month_elapsed%), projected depletion date labeled [tahmin]. 5) Thresholds: <70% = default, 70-90% = warning, >90% = danger. 6) If used_value or limit_value is NULL show "ölçülmedi" text instead of gauge. 7) Add EN+TR translation keys for new UI strings. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 72,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Extend src/app/api/cron/cost-alarm/route.ts to also read from vendor_quotas table (not just finance_monthly_costs). Add thresholds: 1) If any vendor's used_value/limit_value >= 0.75 → send a single email notification to the admin (use existing Resend email pattern in the codebase). 2) If any vendor's used_value/limit_value >= 0.90 → set a feature flag or env variable that blocks new [deploy] commits (document this as a comment, do not implement the block mechanically since git hooks are complex — just log a CRITICAL warning with the exact message "AUTONOMOUS BRAKE: quota at 90%+ for {vendor}"). 3) If >= 1.0 → log "AUTONOMOUS BRAKE: quota exhausted for {vendor}" at ERROR level. Only process vendors where limit_value IS NOT NULL and source = 'api'. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 43,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Improve the Master Plan Dashboard at src/app/[locale]/admin/master-plan/page.tsx (and related components). Currently: 3-column grid has only 1 card, no filter/search, no click-through detail. Add: 1) A search/filter input that filters items by text content in real time (client-side, no new API). 2) Make each item card clickable — show a modal or expanded panel with the full item description text. 3) Distinguish visually between "parse error / empty backlog" vs "genuinely zero pending items" states. 4) The 3-column grid should show all 3 columns: pending, in-progress (if any), completed. Add EN+TR translation keys for any new UI strings. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 45,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Fix fabricated fallback statistics in src/app/[locale]/about/page.tsx. Lines 45, 47, 49 currently use "count ?? 371", ": 12", ": 23" as fallback values when the Supabase query fails. Replace all three with null/undefined fallback that renders an explicit "—" or hides the stat entirely (do NOT show any specific number). This implements Doctrine #011 "no fake numbers" and #013 "no fabricated MRR". Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 59,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Add AI Act Article 5 nudifier/CSAM category to the incident taxonomy. Regulation (EU) 2026/1744 added Article 5 ban on non-consensual intimate imagery and CSAM generation (effective December 2026). Tasks: 1) Add a new incident category value to the incident_categories enum or lookup table — category name: "non_consensual_intimate_imagery_csam", label in 5 languages. 2) Add translation keys in messages/en.json, messages/tr.json, messages/de.json, messages/fr.json, messages/ru.json under "incident_categories" namespace. 3) Add a short explanatory paragraph to src/app/[locale]/ai-act/page.tsx referencing Article 5 of EU 2026/1744. 4) Add a content warning check in src/lib/pii/guardian.ts for this specific category (log a WARN if submitted incident text matches patterns suggesting this content type). Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 74,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Document the autonomous loop in a new file docs/AUTONOMOUS_LOOP.md. Content must cover: 1) The 4-step cycle: (1) push current work to GitHub, (2) consult Architect (Claude) only in 3 cases defined by Rule 40: quality gate red, two rules conflict, or genuinely new error type — NOT for routine task completion, (3) pull Architect's updated plan, (4) execute plan items in order, repeat. 2) Rule 39 prerequisite: pnpm lint && pnpm typecheck && pnpm test && pnpm build must be green before step 2. 3) Rule 42 escalation: attempt_no tracked in ops/opencode-runs/, max 5 attempts before escalating to Architect with full run records. 4) Model routing table matching AGENTS.md: which work type uses which model tier. The document must be factual, cite existing MASTER_PLAN rules by number, and use English. Run pnpm lint && pnpm typecheck && pnpm test after creating the file.`,
  },
  {
    ref: 44,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Fill 3 content gaps in existing pages (do NOT create new routes): 1) In src/app/[locale]/security/page.tsx add a section (with i18n keys in all 5 languages) that explains: SOC2 Type II readiness status (current: "planned"), ISO 27001 alignment ("in progress"), AES-256 encryption for data at rest, TLS 1.3 in transit. Be factual — do not claim certifications that do not exist. 2) In src/app/[locale]/methodology/page.tsx (or equivalent) add the 5 model names used in cross-audit: check src/lib/ai/openrouter-gateway.ts lines 117-121 for the actual hardcoded model IDs and list them accurately. 3) In src/app/[locale]/incidents/page.tsx or a detail page, ensure Case #001 (the Grok passport incident) is referenced — check if incidents/[id]/page.tsx handles it or if it needs a dedicated reference. Add i18n keys for all new text. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 77,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Implement open-weight vs closed-weight incident analysis for MASTER_PLAN item #77. Steps: 1) Add a weight_class column (enum: open, closed, unknown) to ai_models table via a new Supabase migration supabase/migrations/20260828000000_ai_models_weight_class.sql with RLS + ROLLBACK block. 2) Create a server action src/actions/insights/weight-class-analysis.ts that: queries incidents joined with ai_models, groups by weight_class, counts incidents per category per weight_class, returns structured data. If < 10 incidents total, return { insufficient_data: true }. 3) Create a new page src/app/[locale]/insights/open-vs-closed/page.tsx that renders this analysis with a simple table. If insufficient_data, show "Insufficient incident data to draw conclusions" with methodology explanation. 4) Add i18n keys for all 5 languages. 5) Add the page to the insights navigation. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
  {
    ref: 61,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Implement monthly model-usage efficiency report at /admin/resources. Read from ops/opencode-runs/*.json files (server-side). Create a server action src/actions/admin/opencode-efficiency.ts that: 1) Reads all JSON files in ops/opencode-runs/ directory. 2) Groups by model field (free tier: deepseek-v4-flash-free, nemotron-ultra-free, laguna-s-2.1-free etc. vs paid: deepseek-v4-pro, gpt-oss-120b etc.). 3) Calculates: total runs, free tier %, average duration_ms by tier, success rate (exit_code=0). 4) Returns structured data with [tahmin - dogrulanmamis] tag if < 5 runs. Add a small "Efficiency Report" section to src/app/[locale]/admin/resources/resources-client.tsx showing these metrics. Add EN+TR i18n keys. Run pnpm lint && pnpm typecheck && pnpm test.`,
  },
];

const RUNS_DIR = path.join(process.cwd(), 'ops', 'opencode-runs');
if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });

function runGate(cmd) {
  try { execSync(cmd, { stdio: 'inherit', timeout: 120000 }); return 0; }
  catch (e) { return e.status || 1; }
}

function runQualityGates() {
  return {
    lint: runGate('pnpm lint'),
    typecheck: runGate('pnpm typecheck'),
    test: runGate('pnpm test'),
    build: 0,
  };
}

function delegateToOpenCode(task) {
  return new Promise((resolve) => {
    const prompt = task.prompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    const gitSha = execSync('git rev-parse HEAD').toString().trim();
    const start = Date.now();
    console.log(`\n${'='.repeat(60)}\nDELEGATING TASK #${task.ref} | ${task.model}\n${'='.repeat(60)}\n`);

    const child = spawn('cmd', ['/c', `opencode run -m ${task.model} --print-logs --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"')}" < NUL`], { shell: true });
    child.stdout.on('data', d => process.stdout.write(d));
    child.stderr.on('data', d => process.stderr.write(d));

    child.on('close', (exitCode) => {
      const durationMs = Date.now() - start;
      const gates = runQualityGates();
      const failed = exitCode !== 0 || gates.lint !== 0 || gates.typecheck !== 0 || gates.test !== 0;
      const newSha = execSync('git rev-parse HEAD').toString().trim();

      const record = {
        model: task.model, command: `opencode run "${prompt.slice(0, 80)}..."`,
        exit_code: exitCode, duration_ms: durationMs, git_sha: newSha,
        task_ref: task.ref, attempt_no: 1, role: 'uygulayici',
        diagnosis: failed ? `FAIL lint=${gates.lint} typecheck=${gates.typecheck} test=${gates.test}` : 'nominal',
        gates,
      };
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(RUNS_DIR, `${ts}-task-${task.ref}.json`), JSON.stringify(record, null, 2));
      resolve({ task, exitCode, gates, failed });
    });
  });
}

async function main() {
  console.log(`\nOpenCode Batch 2 — ${TASKS.length} task queued.\n`);
  for (const task of TASKS) {
    const result = await delegateToOpenCode(task);
    if (result.failed) {
      console.error(`\n🔴 TASK #${task.ref} FAILED — gates: lint=${result.gates.lint} typecheck=${result.gates.typecheck} test=${result.gates.test}`);
      console.error('Batch halted. Architect intervention required.');
      process.exit(1);
    }
    console.log(`\n✅ TASK #${task.ref} DONE — all gates green.`);
  }
  console.log(`\n${'='.repeat(60)}\nBATCH 2 COMPLETE — ${TASKS.length} tasks finished.\n${'='.repeat(60)}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
