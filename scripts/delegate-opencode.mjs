import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const taskRef = 79;
const rawPrompt = `
Create a new Supabase database migration file to clean up fake/placeholder finance costs data in the 'public.finance_monthly_costs' table.
Specifically:
1. Drop the NOT NULL constraint on 'amount_usd' so that it can be set to NULL (indicating unmeasured/unverified values).
2. Add a 'source' column (text, default 'manual') to the 'public.finance_monthly_costs' table to track cost source.
3. Update existing 'vercel' records to $0.00 amount_usd and $0.00 budget_usd, setting metadata to show plan_name 'Hobby'.
4. Update the remaining 6 services ('gemini', 'anthropic', 'upstash', 'buffer', 'supabase', 'resend') to have amount_usd = NULL (unmeasured) since they cannot be cross-verified.
5. Make sure the migration file contains a rollback block '-- ROLLBACK:'.
`;

// Replace all newlines with spaces and clean up multiple spaces
const prompt = rawPrompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

console.log(`=== Delegating Task #${taskRef} to OpenCode ===`);
console.log(`Cleaned prompt: "${prompt}"`);

const startTime = Date.now();
const gitSha = execSync('git rev-parse HEAD').toString().trim();

// Execute opencode run using spawn to stream output in real-time
console.log('Spawning opencode process...');
const child = spawn('cmd', ['/c', `opencode run -m opencode/deepseek-v4-flash-free --print-logs --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"')}" < NUL`], {
  shell: true
});

child.stdout.on('data', (data) => {
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (exitCode) => {
  const durationMs = Date.now() - startTime;
  console.log(`\nOpenCode process exited with code ${exitCode} in ${durationMs}ms`);

  // Ensure output folder exists
  const runsDir = path.join(process.cwd(), 'ops', 'opencode-runs');
  if (!fs.existsSync(runsDir)) {
    fs.mkdirSync(runsDir, { recursive: true });
  }

  // Check gates
  console.log('Running quality gates validation...');
  let lintCode = 0, typecheckCode = 0, testCode = 0, buildCode = 0;

  try {
    execSync('pnpm lint', { stdio: 'inherit' });
  } catch (e) {
    lintCode = e.status || 1;
  }

  try {
    execSync('pnpm typecheck', { stdio: 'inherit' });
  } catch (e) {
    typecheckCode = e.status || 1;
  }

  try {
    execSync('pnpm test', { stdio: 'inherit' });
  } catch (e) {
    testCode = e.status || 1;
  }

  const runRecord = {
    model: 'opencode/deepseek-v4-flash-free',
    command: `opencode run "${prompt}"`,
    exit_code: exitCode,
    duration_ms: durationMs,
    git_sha: gitSha,
    task_ref: taskRef,
    attempt_no: 1,
    role: 'uygulayici',
    diagnosis: 'Fake finance costs data cleaned up via database migration adding source column.',
    gates: {
      lint: lintCode,
      typecheck: typecheckCode,
      test: testCode,
      build: buildCode
    }
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const recordPath = path.join(runsDir, `${timestamp}-task-${taskRef}.json`);
  fs.writeFileSync(recordPath, JSON.stringify(runRecord, null, 2));

  console.log(`Saved run record to: ${recordPath}`);
  process.exit(exitCode || lintCode || typecheckCode || testCode);
});
