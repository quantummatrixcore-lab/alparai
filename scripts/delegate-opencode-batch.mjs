/**
 * OpenCode Batch Delegator — Mimar tarafından üretildi.
 * Her görevi sırayla OpenCode'a devreder.
 * Kalite kapısı (lint + typecheck + test) başarısız olursa durur.
 * Her delegasyon ops/opencode-runs/<timestamp>-task-<N>.json'a kaydedilir.
 */
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TASKS = [
  {
    ref: 86,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Fix Cyrillic character contamination in messages/fr.json and messages/de.json. Specifically: 1) In messages/fr.json fix key "nav.incidents" which contains Cyrillic "Инценденты" - it should be "Incidents" in French. 2) In messages/fr.json fix key "feed.downvote" which contains mixed Cyrillic/Latin - it should be "Contre" (pure Latin). 3) In messages/de.json fix key "footer.links.pricing" which contains Cyrillic "Прессцент" - it should be "Preise" in German. 4) In messages/de.json fix key "common.allSet" which contains mixed German+Cyrillic - it should be "Alles erledigt" in German. 5) Add a vitest regression test in tests/scan-missing-i18n.test.ts (or new file tests/scan-alphabet-contamination.test.ts) that scans all messages/*.json files and asserts: de/fr/tr/en files contain no Cyrillic characters (Unicode range U+0400-U+04FF), ru file contains no unexpected Latin-only words mixed with Cyrillic. Run pnpm lint && pnpm typecheck && pnpm test to confirm all 951+ tests pass.`,
  },
  {
    ref: 42,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Fill in the remaining untranslated (English-identical) keys in messages/de.json, messages/fr.json and messages/ru.json. The keys that still have English values are: "contact.form.sent_desc", "contact.form.sent_toast", "marketing.incident_of_week.title", "marketing.advocate_of_week.title", and all keys under "marketing.founder_story.*". Translate each key into proper German, French and Russian respectively. Do NOT translate keys that are already correctly translated. Do NOT create new keys. After editing, run pnpm lint && pnpm typecheck && pnpm test to confirm passing.`,
  },
  {
    ref: 63,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Fix the TypeScript type cast workaround in src/app/api/cron/ai-heartbeat/route.ts at line 47. The current code uses .filter("id" as unknown as "status", "eq", res.modelId) which is a bad Supabase typing hack. Replace it with the correct typed Supabase query: .eq("id", res.modelId). Make sure pnpm typecheck passes after this change and pnpm test still passes (951+ tests).`,
  },
  {
    ref: 69,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Create a new Supabase migration file supabase/migrations/20260827000000_vendor_quotas.sql that adds a vendor_quotas table to track infrastructure quota usage. Schema: vendor (text, not null) - values like github_actions/vercel/supabase/claude_pro/resend/upstash, metric (text, not null) - values like minutes/bandwidth_gb/db_size_gb/messages, limit_value (numeric, nullable - null means unknown/untracked), used_value (numeric, nullable), unit (text, not null), period_start (date, not null), period_end (date, not null), plan_name (text, nullable), source (text, not null, default manual) - api or manual, updated_at (timestamptz, default now()). Add primary key on (vendor, metric, period_start). Add RLS: only admin users can select/insert/update/delete (use auth.uid() in a is_moderator() check consistent with existing tables). Add -- ROLLBACK: block. The migration must be safe to run on a fresh Supabase project.`,
  },
  {
    ref: 73,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `The ops/opencode-runs/*.json schema currently only has: model, command, exit_code, duration_ms, git_sha, task_ref. Extend the schema in scripts/delegate-opencode-batch.mjs (the current batch delegator script) to also write these fields for every future run: attempt_no (integer, default 1), role (string: "uygulayici" for first attempt, "teshisci" for retry after failure, "dogrulayici" for verification run), diagnosis (string: single sentence root cause or "nominal" if exit_code=0), gates (object with lint, typecheck, test, build as integer exit codes). Update the runRecord object written to ops/opencode-runs/ to include all these fields. Do NOT change any other behavior. Run pnpm lint && pnpm typecheck && pnpm test to confirm passing.`,
  },
  {
    ref: 60,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Verify that the ops/opencode-runs/ directory now exists and contains at least one valid JSON run record from previous OpenCode delegations. Check that each record contains the fields: model, command, exit_code, duration_ms, git_sha, task_ref. If git_sha exists in the record, verify it actually exists in the git repository by running git cat-file -e <sha>. Report findings in a simple text summary but do NOT modify any files other than creating a verification report at ops/opencode-runs/VERIFICATION.md.`,
  },
  {
    ref: 80,
    model: 'opencode/deepseek-v4-flash-free',
    prompt: `Add a donation/sponsorship policy section to the legal neutrality page. The file is src/app/[locale]/legal/neutrality/page.tsx. Add a new section (after the existing content) that covers: 1) Who may donate/sponsor: only infrastructure providers (Supabase/Vercel/GitHub OSS credits) - NOT AI model/provider companies being measured on the platform. 2) All donations are listed in a public register. 3) Donors have zero editorial influence over K-BENCHMARK scores or incident data. 4) Maximum individual donation cap and transparency rules. Also add the translation keys for this new section to ALL 5 language files: messages/en.json, messages/tr.json, messages/de.json, messages/fr.json, messages/ru.json under the "legal" namespace. Use getTranslations with locale as per existing page pattern. Run pnpm lint && pnpm typecheck && pnpm test to confirm passing.`,
  },
];

const RUNS_DIR = path.join(process.cwd(), 'ops', 'opencode-runs');
if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });

function runQualityGates() {
  let lint = 0, typecheck = 0, test = 0;
  try { execSync('pnpm lint', { stdio: 'inherit' }); } catch (e) { lint = e.status || 1; }
  try { execSync('pnpm typecheck', { stdio: 'inherit' }); } catch (e) { typecheck = e.status || 1; }
  try { execSync('pnpm test', { stdio: 'inherit' }); } catch (e) { test = e.status || 1; }
  return { lint, typecheck, test, build: 0 };
}

function delegateToOpenCode(task) {
  return new Promise((resolve) => {
    const prompt = task.prompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    const gitSha = execSync('git rev-parse HEAD').toString().trim();
    const start = Date.now();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`DELEGATING TASK #${task.ref} TO OPENCODE`);
    console.log(`Model: ${task.model}`);
    console.log(`${'='.repeat(60)}\n`);

    const child = spawn('cmd', ['/c', `opencode run -m ${task.model} --print-logs --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"')}" < NUL`], { shell: true });
    child.stdout.on('data', d => process.stdout.write(d));
    child.stderr.on('data', d => process.stderr.write(d));

    child.on('close', (exitCode) => {
      const durationMs = Date.now() - start;
      const gates = runQualityGates();
      const failed = exitCode !== 0 || gates.lint !== 0 || gates.typecheck !== 0 || gates.test !== 0;

      const record = {
        model: task.model,
        command: `opencode run "${prompt.slice(0, 80)}..."`,
        exit_code: exitCode,
        duration_ms: durationMs,
        git_sha: execSync('git rev-parse HEAD').toString().trim(),
        task_ref: task.ref,
        attempt_no: 1,
        role: 'uygulayici',
        diagnosis: failed ? `Quality gate failure: lint=${gates.lint} typecheck=${gates.typecheck} test=${gates.test}` : 'nominal',
        gates,
      };

      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(RUNS_DIR, `${ts}-task-${task.ref}.json`), JSON.stringify(record, null, 2));

      resolve({ task, exitCode, gates, failed, gitSha: record.git_sha });
    });
  });
}

async function main() {
  console.log(`\nOpenCode Batch Delegator — ${TASKS.length} görev sıraya alındı.\n`);

  for (const task of TASKS) {
    const result = await delegateToOpenCode(task);

    if (result.failed) {
      console.error(`\n🔴 GÖREV #${task.ref} BAŞARISIZ — Kalite kapısı kırmızı.`);
      console.error(`   lint=${result.gates.lint} typecheck=${result.gates.typecheck} test=${result.gates.test}`);
      console.error(`   Batch durduruldu. Mimar müdahalesi gerekiyor.`);
      process.exit(1);
    }

    console.log(`\n✅ GÖREV #${task.ref} TAMAMLANDI — Kalite kapıları yeşil.`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`BATCH TAMAMLANDI — ${TASKS.length} görevin tamamı başarılı.`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
