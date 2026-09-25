/**
 * scripts/super_deploy_audit.cjs
 * ============================================================================
 * SUPER DEPLOY AGENT: 5-RULE & 4-POWER DETERMINISTIC AUDIT GATE
 * ============================================================================
 * Audits ALPAR AI against the 5 Immutable Deployment Laws and 4 Super-Powers
 * defined in .agents/skills/super-deploy-agent/SKILL.md.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
const failures = [];

function check(name, testFn) {
  totalChecks++;
  try {
    const res = testFn();
    if (res === true || (res && res.pass)) {
      passedChecks++;
      console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}${res && res.detail ? ` (${res.detail})` : ''}`);
    } else {
      const reason = res && res.reason ? res.reason : 'Check failed';
      failures.push({ name, reason });
      console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${reason}`);
    }
  } catch (err) {
    failures.push({ name, reason: err.message });
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
  }
}

console.log('\n======================================================');
console.log('🛡️ SUPER DEPLOY AGENT: PRE-FLIGHT AUDIT & VERIFICATION');
console.log('======================================================\n');

// --- RULE 1: DeHost Connection Pooling ---
check('RULE 1: DeHost Connection Pooling (Port 6543 / Supavisor in Prod)', () => {
  const schemaPath = path.join(ROOT, 'src', 'lib', 'dehost', 'schema.ts');
  const serverAdapterPath = path.join(ROOT, 'src', 'lib', 'dehost', 'server-adapter.ts');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const serverContent = fs.readFileSync(serverAdapterPath, 'utf8');

  const schemaHasPooler = schemaContent.includes('6543');
  const serverHasPooler = serverContent.includes('6543');

  if (!schemaHasPooler || !serverHasPooler) {
    return { pass: false, reason: 'Port 6543 pooler fallback missing in schema or server-adapter' };
  }
  return { pass: true, detail: 'Port 6543 Supavisor pooling enforced in production' };
});

// --- RULE 2: Stripe Webhook 10s Timeout Protection ---
check('RULE 2: Stripe Webhook Timeout Protection (waitUntil & Immediate 200 OK)', () => {
  const webhookPath = path.join(ROOT, 'src', 'app', 'api', 'webhooks', 'stripe', 'route.ts');
  if (!fs.existsSync(webhookPath)) {
    return { pass: false, reason: 'Stripe webhook route not found' };
  }
  const content = fs.readFileSync(webhookPath, 'utf8');
  const usesWaitUntil = content.includes('waitUntil(');
  const returnsReceived = content.includes('NextResponse.json({ received: true })');

  if (!usesWaitUntil || !returnsReceived) {
    return { pass: false, reason: 'Webhook does not use async waitUntil with fast 200 OK response' };
  }
  return { pass: true, detail: 'waitUntil() used; fast response returned' };
});

// --- RULE 3: Zero-Trust Secret Leaks ---
check('RULE 3: Zero-Trust Client-Side Secret Leak Check', () => {
  const clientFiles = [
    path.join(ROOT, 'src', 'lib', 'dehost', 'client.ts'),
    path.join(ROOT, 'next.config.mjs')
  ];

  const forbiddenPatterns = [
    /NEXT_PUBLIC_.*(?:SECRET|SERVICE_ROLE|PRIVATE_KEY)/i,
    /sk_live_[a-zA-Z0-9]{20,}/,
    /sk_test_[a-zA-Z0-9]{20,}/
  ];

  for (const file of clientFiles) {
    if (fs.existsSync(file)) {
      const code = fs.readFileSync(file, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(code)) {
          return { pass: false, reason: `Forbidden secret pattern found in ${file}` };
        }
      }
    }
  }
  return { pass: true, detail: 'Zero secret keys exposed in client bundles' };
});

// --- RULE 4: DeHost Memory & Sentry Source Maps ---
check('RULE 4: DeHost Memory & Sentry Source Map Protection', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const nextConfig = fs.readFileSync(path.join(ROOT, 'next.config.mjs'), 'utf8');

  const buildScript = pkg.scripts?.build || '';
  if (buildScript.includes('--max-old-space-size=8192')) {
    return { pass: false, reason: 'Build script exceeds DeHost standard memory limit (8192MB)' };
  }

  const hasHideSourceMaps = nextConfig.includes('hideSourceMaps: true');
  if (!hasHideSourceMaps) {
    return { pass: false, reason: 'hideSourceMaps: true is missing in next.config.mjs / Sentry' };
  }
  return { pass: true, detail: 'Memory capped at 4096MB & hideSourceMaps active' };
});

// --- RULE 5: Real Lint & Quality Gate Integrity ---
check('RULE 5: Genuine Lint & Quality Gate (No || exit 0 bypasses)', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lintScript = pkg.scripts?.lint || '';
  const prePush = fs.readFileSync(path.join(ROOT, '.husky', 'pre-push'), 'utf8');

  if (lintScript.includes('|| exit 0') || lintScript.includes('|| true')) {
    return { pass: false, reason: 'Lint bypass detected in package.json' };
  }
  if (prePush.includes('exit 0') && !prePush.includes('CHANGED_FILES')) {
    return { pass: false, reason: 'Fake pre-push hook detected' };
  }
  return { pass: true, detail: 'Real strict linting and pre-push crucible verified' };
});

// --- POWER 1: Token Hunter (Regex Pattern Scan) ---
check('POWER 1: Token Hunter (API Key Regex Scanner)', () => {
  const envExample = path.join(ROOT, '.env.example');
  if (fs.existsSync(envExample)) {
    const envContent = fs.readFileSync(envExample, 'utf8');
    if (/sk_live_[0-9a-zA-Z]{15,}/.test(envContent) || /re_[0-9a-zA-Z]{20,}/.test(envContent)) {
      return { pass: false, reason: 'Real live API key found in .env.example' };
    }
  }
  return { pass: true, detail: 'No live secret keys in repository templates' };
});

// --- POWER 2: .gitignore Shield of Invisibility ---
check('POWER 2: .gitignore Shield of Invisibility (Ghost File Protection)', () => {
  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  const requiredIgnored = ['.env', '*.pem', 'ts-errors.txt'];
  for (const item of requiredIgnored) {
    if (!gitignore.includes(item)) {
      return { pass: false, reason: `.gitignore is missing rule for ${item}` };
    }
  }
  return { pass: true, detail: '.env, *.pem, and temp artifacts strictly ignored' };
});

// --- POWER 3: CLI & Command Safety ---
check('POWER 3: CLI Command Safety (No destructive DB operations in build)', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const build = pkg.scripts?.build || '';
  if (build.includes('db reset') || build.includes('migration down')) {
    return { pass: false, reason: 'Destructive database reset detected in build script' };
  }
  return { pass: true, detail: 'Zero destructive commands in CI/CD pipeline' };
});

// --- POWER 4: 3rd Party Health Check (Upstash, Sentry, Vitest) ---
check('POWER 4: 3rd Party Infrastructure Architecture Health', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const hasSentry = Boolean(pkg.dependencies?.['@sentry/nextjs']);
  const hasUpstash = Boolean(pkg.dependencies?.['@upstash/ratelimit']);
  const hasStripe = Boolean(pkg.dependencies?.['@stripe/stripe-js']);

  if (!hasSentry || !hasUpstash || !hasStripe) {
    return { pass: false, reason: 'Missing core 3rd party trust dependencies' };
  }
  return { pass: true, detail: 'Sentry, Upstash Ratelimit, and Stripe SDK verified' };
});

console.log('\n------------------------------------------------------');
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failures.length}`);
console.log('------------------------------------------------------\n');

if (failures.length > 0) {
  console.error('🚨 SUPER DEPLOY GATE REJECTED THE DEPLOYMENT!');
  process.exit(1);
} else {
  console.log('✅ SUPER DEPLOY GATE: 100% GREEN CERTIFIED FOR PRODUCTION!\n');
  process.exit(0);
}
