import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const DEFAULT_REQUIRED_CHECKS = ["build", "Visual Regression Lock"];
export const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
export const DEFAULT_POLL_INTERVAL_MS = 20 * 1000;

const CODE_CHANGE_PATTERNS = [
  "src/",
  "messages/",
  "public/",
  "package.json",
  "pnpm-lock.yaml",
  "next.config.mjs",
  "vercel.json",
  "tsconfig.json",
  "tailwind.config",
];

const GITHUB_API_HEADERS_BASE = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export function defaultExecImpl(command) {
  return execSync(command).toString();
}

export function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runGit(execImpl, command, fallback) {
  try {
    return execImpl(command).toString().trim();
  } catch {
    return fallback;
  }
}

export function resolveCommitSha(env, execImpl) {
  if (env.VERCEL_GIT_COMMIT_SHA) return env.VERCEL_GIT_COMMIT_SHA;
  return runGit(execImpl, "git rev-parse HEAD", "");
}

export function readCommitMessage(env, execImpl) {
  if (env.VERCEL_GIT_COMMIT_MESSAGE) return env.VERCEL_GIT_COMMIT_MESSAGE;
  return runGit(execImpl, "git log -1 --pretty=%B", "");
}

export function parseOwnerRepoFromRemoteUrl(url) {
  const marker = "github.com";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  let rest = url.slice(idx + marker.length);
  rest = rest.replace(/^[:/]+/, "").replace(/\/+$/, "");
  const segments = rest.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[segments.length - 2];
  let repo = segments[segments.length - 1];
  if (repo.endsWith(".git")) repo = repo.slice(0, -4);
  if (!owner || !repo) return null;
  return { owner, repo };
}

export function resolveRepoInfo(env, execImpl) {
  const owner = env.VERCEL_GIT_REPO_OWNER;
  const repo = env.VERCEL_GIT_REPO_SLUG;
  if (owner && repo) return { owner, repo };
  const remoteUrl = runGit(execImpl, "git remote get-url origin", "");
  if (remoteUrl) {
    const parsed = parseOwnerRepoFromRemoteUrl(remoteUrl);
    if (parsed) return parsed;
  }
  return { owner: "", repo: "" };
}

export function hasApplicationCodeChanges(execImpl, logImpl) {
  try {
    const output = execImpl("git diff-tree --no-commit-id --name-only -r HEAD").toString().trim();
    const changedFiles = output.length > 0 ? output.split("\n") : [];
    logImpl(`DEPLOY GATE: changed files in commit: ${changedFiles.length > 0 ? changedFiles.join(", ") : "(none)"}`);
    return changedFiles.some((file) => CODE_CHANGE_PATTERNS.some((pattern) => file.startsWith(pattern) || file.includes(pattern)));
  } catch (err) {
    logImpl(`DEPLOY GATE: could not determine changed files (${err instanceof Error ? err.message : String(err)}), defaulting to treating this as a code change`);
    return true;
  }
}

export function parseRequiredChecks(env) {
  const raw = env.DEPLOY_GATE_REQUIRED_CHECKS;
  if (!raw) return [...DEFAULT_REQUIRED_CHECKS];
  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...DEFAULT_REQUIRED_CHECKS];
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

export function checkNameMatches(required, actual) {
  const req = normalizeName(required);
  const act = normalizeName(actual);
  if (!req || !act) return false;
  if (req === act) return true;
  const segments = act
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  return segments.length > 1 && segments[segments.length - 1] === req;
}

function normalizeCheckRunState(run) {
  if (run.status !== "completed") return "pending";
  if (run.conclusion === "success") return "success";
  if (run.conclusion === "failure" || run.conclusion === "cancelled" || run.conclusion === "timed_out") return "failure";
  return "pending";
}

function normalizeStatusState(status) {
  const state = String(status.state || "").toLowerCase();
  if (state === "success") return "success";
  if (state === "failure" || state === "error") return "failure";
  return "pending";
}

export function evaluateRequiredChecks(requiredChecks, checkRuns, statuses) {
  const perCheck = requiredChecks.map((required) => {
    const matchingRuns = checkRuns.filter((r) => checkNameMatches(required, r.name));
    const matchingStatuses = statuses.filter((s) => checkNameMatches(required, s.context));
    const entries = [
      ...matchingRuns.map((r) => ({ state: normalizeCheckRunState(r), url: r.html_url || null, source: r.name })),
      ...matchingStatuses.map((s) => ({ state: normalizeStatusState(s), url: s.target_url || null, source: s.context })),
    ];

    if (entries.length === 0) {
      return { required, state: "missing", url: null, source: undefined };
    }

    const failed = entries.find((e) => e.state === "failure");
    if (failed) {
      return { required, state: "failure", url: failed.url, source: failed.source };
    }

    if (entries.some((e) => e.state === "pending")) {
      return { required, state: "pending", url: null, source: undefined };
    }

    const succeeded = entries.find((e) => e.state === "success");
    return { required, state: "success", url: succeeded ? succeeded.url : null, source: succeeded ? succeeded.source : undefined };
  });

  const failures = perCheck.filter((c) => c.state === "failure");
  const pending = perCheck.filter((c) => c.state === "pending" || c.state === "missing");

  let outcome = "success";
  if (failures.length > 0) outcome = "failure";
  else if (pending.length > 0) outcome = "pending";

  return { outcome, perCheck, failures, pending };
}

async function fetchAllCheckRuns({ owner, repo, sha, token, fetchImpl }) {
  const runs = [];
  const perPage = 100;
  let page = 1;
  for (;;) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=${perPage}&page=${page}`;
    const res = await fetchImpl(url, {
      headers: { ...GITHUB_API_HEADERS_BASE, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`check-runs request failed with status ${res.status}`);
    }
    const data = await res.json();
    const batch = Array.isArray(data.check_runs) ? data.check_runs : [];
    runs.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return runs;
}

async function fetchLegacyStatuses({ owner, repo, sha, token, fetchImpl }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/status`;
  const res = await fetchImpl(url, {
    headers: { ...GITHUB_API_HEADERS_BASE, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`commit status request failed with status ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.statuses) ? data.statuses : [];
}

export async function pollRequiredChecks(options) {
  const {
    owner,
    repo,
    sha,
    token,
    requiredChecks,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    fetchImpl,
    sleepImpl = defaultSleep,
    nowImpl = Date.now,
    logImpl = () => {},
  } = options;

  const deadline = nowImpl() + timeoutMs;
  let lastEvaluation = evaluateRequiredChecks(requiredChecks, [], []);

  for (;;) {
    try {
      const [checkRuns, statuses] = await Promise.all([
        fetchAllCheckRuns({ owner, repo, sha, token, fetchImpl }),
        fetchLegacyStatuses({ owner, repo, sha, token, fetchImpl }),
      ]);
      lastEvaluation = evaluateRequiredChecks(requiredChecks, checkRuns, statuses);
      logImpl(`DEPLOY GATE: check status — ${lastEvaluation.perCheck.map((c) => `${c.required}=${c.state}`).join(", ")}`);
    } catch (err) {
      logImpl(`DEPLOY GATE: GitHub API request failed, will retry — ${err instanceof Error ? err.message : String(err)}`);
    }

    if (lastEvaluation.outcome !== "pending") {
      return lastEvaluation;
    }

    if (nowImpl() >= deadline) {
      return { ...lastEvaluation, outcome: "timeout" };
    }

    await sleepImpl(pollIntervalMs);
  }
}

function logForceDeployWarning(logImpl, sha, ref) {
  logImpl("");
  logImpl("################################################################");
  logImpl("# DEPLOY GATE: FORCE-DEPLOY BYPASS ACTIVE");
  logImpl("################################################################");
  logImpl(`# Commit:  ${sha || "(unknown sha)"}`);
  logImpl(`# Ref:     ${ref || "(unknown ref)"}`);
  logImpl("# The [force-deploy] tag was found in the commit message.");
  logImpl("# The GitHub Checks / CI test gate has been DELIBERATELY BYPASSED.");
  logImpl("# This build proceeds WITHOUT verifying that typecheck, lint,");
  logImpl("# vitest, or the visual-regression suite passed for this commit.");
  logImpl("################################################################");
  logImpl("");
}

function logUnenforcedTokenWarning(logImpl) {
  logImpl("");
  logImpl("################################################################");
  logImpl("# DEPLOY GATE: UNENFORCED — NO GITHUB TOKEN CONFIGURED");
  logImpl("################################################################");
  logImpl("# This deploy is proceeding WITHOUT verifying that CI passed.");
  logImpl("# Neither GITHUB_TOKEN nor GH_TOKEN is set in this environment,");
  logImpl("# so the gate cannot query GitHub Checks for this commit.");
  logImpl("#");
  logImpl("# TO ENFORCE THE GATE: set GITHUB_TOKEN in the Vercel project");
  logImpl("# (Settings -> Environment Variables) to a token with read");
  logImpl("# access to Checks and commit statuses for this repository.");
  logImpl("# Until GITHUB_TOKEN is set, every commit deploys regardless");
  logImpl("# of whether CI passed.");
  logImpl("################################################################");
  logImpl("");
}

export async function runDeployGate(options = {}) {
  const env = options.env || process.env;
  const execImpl = options.execImpl || defaultExecImpl;
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const sleepImpl = options.sleepImpl || defaultSleep;
  const nowImpl = options.nowImpl || Date.now;
  const logImpl = options.logImpl || console.log;

  const commitMsg = readCommitMessage(env, execImpl);
  const ref = env.VERCEL_GIT_COMMIT_REF || "";
  const sha = resolveCommitSha(env, execImpl);
  const { owner, repo } = resolveRepoInfo(env, execImpl);

  logImpl(`DEPLOY GATE: inspecting commit ${sha || "(unknown sha)"} on ref "${ref}"`);
  logImpl(`DEPLOY GATE: commit message: "${commitMsg}"`);

  const isForceDeploy = commitMsg.includes("[force-deploy]");
  const hasDeployTag = commitMsg.includes("[deploy]");

  if (isForceDeploy) {
    logForceDeployWarning(logImpl, sha, ref);
    const reason = "explicit [force-deploy] tag bypasses the CI check gate";
    logImpl(`DEPLOY GATE: PROCEED — ${reason}`);
    return { code: 1, decision: "proceed", reason };
  }

  if (hasDeployTag) {
    logImpl('DEPLOY GATE: "[deploy]" tag noted — it marks deploy intent only and no longer bypasses CI check verification');
  }

  const isMaster = ref.includes("master");
  if (!isMaster) {
    const reason = `ref "${ref}" is not master`;
    logImpl(`DEPLOY GATE: SKIP — ${reason}`);
    return { code: 0, decision: "skip", reason };
  }

  const codeChanged = hasApplicationCodeChanges(execImpl, logImpl);
  if (!codeChanged) {
    const reason = "no application code files changed in this commit";
    logImpl(`DEPLOY GATE: SKIP — ${reason}`);
    return { code: 0, decision: "skip", reason };
  }

  const token = env.GITHUB_TOKEN || env.GH_TOKEN;
  if (!token) {
    logUnenforcedTokenWarning(logImpl);
    const reason = "no GITHUB_TOKEN/GH_TOKEN configured, gate is unenforced";
    logImpl(`DEPLOY GATE: PROCEED — ${reason}`);
    return { code: 1, decision: "proceed", reason };
  }

  if (!owner || !repo || !sha) {
    logImpl(`DEPLOY GATE: unable to identify commit for verification (owner="${owner}" repo="${repo}" sha="${sha}")`);
    const reason = "could not determine owner/repo/sha, unable to query GitHub Checks";
    logImpl(`DEPLOY GATE: PROCEED — ${reason}, failing open rather than blocking a live deploy on a gate script error`);
    return { code: 1, decision: "proceed", reason };
  }

  const requiredChecks = parseRequiredChecks(env);
  const timeoutMs = Number.parseInt(env.DEPLOY_GATE_TIMEOUT_MS || "", 10) || DEFAULT_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

  logImpl(`DEPLOY GATE: waiting for required checks [${requiredChecks.join(", ")}] on ${owner}/${repo}@${sha}, timeout ${timeoutMs}ms`);

  const evaluation = await pollRequiredChecks({
    owner,
    repo,
    sha,
    token,
    requiredChecks,
    timeoutMs,
    pollIntervalMs,
    fetchImpl,
    sleepImpl,
    nowImpl,
    logImpl,
  });

  if (evaluation.outcome === "success") {
    const reason = `all required checks passed: ${requiredChecks.join(", ")}`;
    logImpl(`DEPLOY GATE: PROCEED — ${reason}`);
    return { code: 1, decision: "proceed", reason };
  }

  if (evaluation.outcome === "failure") {
    const details = evaluation.failures.map((f) => `"${f.required}" (${f.state}${f.url ? `, ${f.url}` : ""})`).join("; ");
    const reason = `required check(s) failed: ${details}`;
    logImpl(`DEPLOY GATE: SKIP — ${reason}`);
    return { code: 0, decision: "skip", reason };
  }

  const pendingNames = evaluation.pending.map((p) => p.required).join(", ");
  logImpl(`DEPLOY GATE: timeout reached after ${timeoutMs}ms — this is a TIMEOUT, not a test failure`);
  logImpl(`DEPLOY GATE: still pending/missing: ${pendingNames}`);
  logImpl("DEPLOY GATE: re-running the deploy after CI finishes will succeed once the required checks complete");
  const reason = `timed out after ${timeoutMs}ms waiting for: ${pendingNames}`;
  logImpl(`DEPLOY GATE: SKIP — ${reason}`);
  return { code: 0, decision: "skip", reason };
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  runDeployGate()
    .then((result) => {
      process.exit(result.code);
    })
    .catch((err) => {
      console.error("DEPLOY GATE: internal error in deploy-gate script");
      console.error(err instanceof Error ? err.stack || err.message : String(err));
      console.log("DEPLOY GATE: PROCEED — internal deploy-gate script error, failing open rather than blocking a live deploy");
      process.exit(1);
    });
}
