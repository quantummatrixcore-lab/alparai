/**
 * ALPAR AI — One-command deploy automation.
 * Usage: pnpm deploy --message "fix(scope): what changed [deploy]"
 *
 * Automates the routine so humans type one command:
 *   1. Ensures master tracks origin/master (missing upstream used to kill the pre-push hook)
 *   2. Reverts known test-pollution (provider-aliases.json test tokens)
 *   3. Runs gates: guardian + typecheck + eslint
 *   4. Commits tracked changes (refuses blind untracked files to avoid secret leaks)
 *   5. Pushes to origin master (pre-push hook + CI + Cloudflare take it from there)
 *   6. Polls the production health endpoint and reports
 *
 * Exit non-zero on any failure. No silent skips.
 */
import { execFileSync } from "node:child_process";

const HEALTH_URL = process.env.DEPLOY_HEALTH_URL || "https://alparai.com/api/health";
const HEALTH_TIMEOUT_MS = 5 * 60 * 1000;
const HEALTH_INTERVAL_MS = 15 * 1000;

function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

function capture(cmd, args) {
  try {
    return execFileSync(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
      encoding: "utf-8",
    }).trim();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(`[deploy] FATAL: ${msg}`);
  process.exit(1);
}

function parseArgs() {
  const out = { message: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === "--message" || argv[i] === "-m") && argv[i + 1]) {
      out.message = argv[++i];
    }
  }
  return out;
}

// 1. Upstream tracking (pre-push hook dies with 128 without it)
const upstream = capture("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
if (!upstream) {
  console.log("[deploy] No upstream tracking — linking master to origin/master...");
  try {
    run("git", ["branch", "--set-upstream-to=origin/master", "master"]);
  } catch {
    fail("Could not set upstream to origin/master. Set it manually and re-run.");
  }
}

// 2. Revert known test-pollution automatically
const VOLATILE_FILE = "src/lib/import/provider-aliases.json";
const dirty = capture("git", ["status", "--porcelain", "--", VOLATILE_FILE]);
if (dirty) {
  const diff = capture("git", ["diff", "--", VOLATILE_FILE]) || "";
  const added = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
  const onlyTestTokens =
    added.length > 0 && added.every((l) => l.includes("test_custom_alias_token_"));
  if (onlyTestTokens) {
    console.log("[deploy] Reverting test-pollution in provider-aliases.json...");
    run("git", ["checkout", "--", VOLATILE_FILE]);
  }
}

// 3. Gates (fast, local). Full suite runs in the pre-push hook + CI.
console.log("[deploy] Gate 1/3: guardian...");
run("node", ["scripts/guardian.js"]);
console.log("[deploy] Gate 2/3: typecheck...");
run("pnpm", ["typecheck"]);
console.log("[deploy] Gate 3/3: eslint...");
run("pnpm", ["lint"]);

// 4. Commit tracked changes; refuse unknown untracked files (secret-leak guard)
const porcelain = capture("git", ["status", "--porcelain"]) || "";
const untracked = porcelain
  .split("\n")
  .filter((l) => l.startsWith("??"))
  .map((l) => l.slice(3).trim())
  .filter(Boolean);
if (untracked.length > 0) {
  fail(
    `Untracked files present, refusing blind commit:\n  ${untracked.join("\n  ")}\n` +
      "Add them to .gitignore or stage them explicitly, then re-run.",
  );
}
const { message } = parseArgs();
if (porcelain.trim().length > 0) {
  console.log("[deploy] Staging tracked changes...");
  run("git", ["add", "-u"]);
  const msg =
    message ||
    `chore(deploy): automated deploy ${new Date().toISOString().slice(0, 16).replace("T", " ")} [deploy]`;
  console.log(`[deploy] Committing: ${msg}`);
  run("git", ["commit", "-m", msg]);
} else {
  console.log("[deploy] Tree clean — pushing current HEAD.");
}

// 5. Push (pre-push hook runs the full test suite here)
console.log("[deploy] Pushing to origin master...");
run("git", ["push", "origin", "master"]);

// 6. Health poll
console.log(`[deploy] Polling ${HEALTH_URL} ...`);
const deadline = Date.now() + HEALTH_TIMEOUT_MS;
let lastStatus = "no-response";
while (Date.now() < deadline) {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(20000) });
    lastStatus = String(res.status);
    if (res.ok) {
      const body = await res.text();
      console.log(`[deploy] HEALTHY (HTTP ${res.status}): ${body.slice(0, 300)}`);
      console.log("[deploy] DONE.");
      process.exit(0);
    }
    console.log(`[deploy] HTTP ${res.status} — retrying...`);
  } catch (err) {
    lastStatus = err?.cause?.code || err?.message || "fetch-error";
    console.log(`[deploy] ${lastStatus} — retrying...`);
  }
  await new Promise((r) => setTimeout(r, HEALTH_INTERVAL_MS));
}
console.error(
  `[deploy] PUSH OK, HEALTH PENDING (last: ${lastStatus}). Cloudflare Pages build may still be running — check dashboard.`,
);
process.exit(2);
