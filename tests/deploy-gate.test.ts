import { describe, it, expect, vi } from "vitest";
import {
  runDeployGate,
  checkNameMatches,
  evaluateRequiredChecks,
  parseRequiredChecks,
  parseOwnerRepoFromRemoteUrl,
  DEFAULT_REQUIRED_CHECKS,
  type EnvMap,
  type ExecImpl,
  type FetchImpl,
  type LogImpl,
  type GitHubCheckRun,
} from "../scripts/deploy-gate.mjs";

function baseEnv(overrides: Partial<EnvMap> = {}): EnvMap {
  return {
    DEHOST_GIT_COMMIT_REF: "refs/heads/master",
    DEHOST_GIT_COMMIT_SHA: "abc123def456",
    DEHOST_GIT_COMMIT_MESSAGE: "fix: repair the widget",
    DEHOST_GIT_REPO_OWNER: "quantummatrixcore-lab",
    DEHOST_GIT_REPO_SLUG: "Alparai.com",
    GITHUB_TOKEN: "test-token",
    DEPLOY_GATE_REQUIRED_CHECKS: "build, Visual Regression Lock",
    ...overrides,
  };
}

const codeChangeExecImpl: ExecImpl = (command) => {
  if (command.includes("diff-tree")) return "src/app/page.tsx\n";
  return "";
};

function createLogCollector(): { lines: string[]; logImpl: LogImpl } {
  const lines: string[] = [];
  return { lines, logImpl: (message: string) => lines.push(message) };
}

interface FetchSnapshot {
  checkRuns: GitHubCheckRun[];
}

function createFetchMock(snapshots: FetchSnapshot[]): FetchImpl {
  let checkRunsIndex = -1;
  let statusIndex = -1;
  const impl = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/check-runs")) {
      checkRunsIndex = Math.min(checkRunsIndex + 1, snapshots.length - 1);
      const snapshot = snapshots[checkRunsIndex] as FetchSnapshot;
      return {
        ok: true,
        status: 200,
        json: async () => ({ check_runs: snapshot.checkRuns }),
      } as unknown as Response;
    }
    if (url.includes("/status")) {
      statusIndex = Math.min(statusIndex + 1, snapshots.length - 1);
      return {
        ok: true,
        status: 200,
        json: async () => ({ statuses: [] }),
      } as unknown as Response;
    }
    throw new Error(`unexpected fetch url in test: ${url}`);
  });
  return impl as unknown as FetchImpl;
}

const successfulCheckRuns: GitHubCheckRun[] = [
  {
    name: "build",
    status: "completed",
    conclusion: "success",
    html_url: "https://github.com/o/r/runs/1",
  },
  {
    name: "Visual Regression Lock",
    status: "completed",
    conclusion: "success",
    html_url: "https://github.com/o/r/runs/2",
  },
];

describe("deploy-gate unit helpers", () => {
  it("checkNameMatches is case-insensitive and tolerates workflow-prefixed names", () => {
    expect(checkNameMatches("build", "build")).toBe(true);
    expect(checkNameMatches("Build", "BUILD")).toBe(true);
    expect(checkNameMatches("build", "CI / build")).toBe(true);
    expect(checkNameMatches("Visual Regression Lock", "CI / Visual Regression Lock")).toBe(true);
    expect(checkNameMatches("build", "playwright-vrt")).toBe(false);
  });

  it("parseRequiredChecks falls back to the default list", () => {
    expect(parseRequiredChecks({})).toEqual(DEFAULT_REQUIRED_CHECKS);
    expect(
      parseRequiredChecks({ DEPLOY_GATE_REQUIRED_CHECKS: "build, Visual Regression Lock" }),
    ).toEqual(["build", "Visual Regression Lock"]);
  });

  it("parseOwnerRepoFromRemoteUrl handles a repo name containing a dot", () => {
    expect(
      parseOwnerRepoFromRemoteUrl("https://github.com/quantummatrixcore-lab/Alparai.com"),
    ).toEqual({
      owner: "quantummatrixcore-lab",
      repo: "Alparai.com",
    });
    expect(
      parseOwnerRepoFromRemoteUrl("git@github.com:quantummatrixcore-lab/Alparai.com.git"),
    ).toEqual({
      owner: "quantummatrixcore-lab",
      repo: "Alparai.com",
    });
  });

  it("evaluateRequiredChecks reports failure when any required check failed", () => {
    const result = evaluateRequiredChecks(
      ["build", "Visual Regression Lock"],
      [
        { name: "build", status: "completed", conclusion: "success" },
        {
          name: "Visual Regression Lock",
          status: "completed",
          conclusion: "failure",
          html_url: "https://x/2",
        },
      ],
      [],
    );
    expect(result.outcome).toBe("failure");
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]?.required).toBe("Visual Regression Lock");
  });
});

describe("runDeployGate decision flow", () => {
  it("proceeds when all required checks succeed", async () => {
    const fetchImpl = createFetchMock([{ checkRuns: successfulCheckRuns }]);
    const { lines, logImpl } = createLogCollector();
    const result = await runDeployGate({
      env: baseEnv(),
      execImpl: codeChangeExecImpl,
      fetchImpl,
      sleepImpl: async () => {},
      logImpl,
      pollIntervalMs: 1,
    });
    expect(result.code).toBe(1);
    expect(result.decision).toBe("proceed");
    expect(lines.some((l) => l.startsWith("DEPLOY GATE: PROCEED"))).toBe(true);
  });

  it("skips when one required check fails", async () => {
    const fetchImpl = createFetchMock([
      {
        checkRuns: [
          { name: "build", status: "completed", conclusion: "success" },
          {
            name: "Visual Regression Lock",
            status: "completed",
            conclusion: "failure",
            html_url: "https://github.com/o/r/runs/9",
          },
        ],
      },
    ]);
    const { lines, logImpl } = createLogCollector();
    const result = await runDeployGate({
      env: baseEnv(),
      execImpl: codeChangeExecImpl,
      fetchImpl,
      sleepImpl: async () => {},
      logImpl,
      pollIntervalMs: 1,
    });
    expect(result.code).toBe(0);
    expect(result.decision).toBe("skip");
    expect(result.reason).toContain("Visual Regression Lock");
    expect(result.reason).toContain("https://github.com/o/r/runs/9");
    expect(lines.some((l) => l.startsWith("DEPLOY GATE: SKIP"))).toBe(true);
  });

  it("proceeds once pending checks resolve to success on a later poll", async () => {
    const fetchImpl = createFetchMock([
      {
        checkRuns: [
          { name: "build", status: "in_progress", conclusion: null },
          { name: "Visual Regression Lock", status: "queued", conclusion: null },
        ],
      },
      { checkRuns: successfulCheckRuns },
    ]);
    const result = await runDeployGate({
      env: baseEnv(),
      execImpl: codeChangeExecImpl,
      fetchImpl,
      sleepImpl: async () => {},
      logImpl: () => {},
      pollIntervalMs: 1,
    });
    expect(result.code).toBe(1);
    expect(result.decision).toBe("proceed");
  });

  it("skips on timeout while a required check is still pending", async () => {
    const fetchImpl = createFetchMock([
      { checkRuns: [{ name: "build", status: "in_progress", conclusion: null }] },
    ]);
    let clock = 0;
    const nowImpl = () => {
      const t = clock;
      clock += 25;
      return t;
    };
    const { lines, logImpl } = createLogCollector();
    const result = await runDeployGate({
      env: baseEnv({ DEPLOY_GATE_TIMEOUT_MS: "50" }),
      execImpl: codeChangeExecImpl,
      fetchImpl,
      sleepImpl: async () => {},
      nowImpl,
      logImpl,
      pollIntervalMs: 10,
    });
    expect(result.code).toBe(0);
    expect(result.decision).toBe("skip");
    expect(result.reason).toMatch(/timed out/);
    expect(lines.some((l) => l.includes("TIMEOUT, not a test failure"))).toBe(true);
  });

  it("proceeds unenforced with a loud warning when no GitHub token is configured", async () => {
    const fetchImpl = vi.fn();
    const { lines, logImpl } = createLogCollector();
    const result = await runDeployGate({
      env: baseEnv({ GITHUB_TOKEN: undefined, GH_TOKEN: undefined }),
      execImpl: codeChangeExecImpl,
      fetchImpl: fetchImpl as unknown as FetchImpl,
      logImpl,
    });
    expect(result.code).toBe(1);
    expect(result.decision).toBe("proceed");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(lines.some((l) => l.includes("UNENFORCED"))).toBe(true);
    expect(lines.some((l) => l.includes("GITHUB_TOKEN"))).toBe(true);
  });

  it("skips on a non-master ref without calling the GitHub API", async () => {
    const fetchImpl = vi.fn();
    const result = await runDeployGate({
      env: baseEnv({ DEHOST_GIT_COMMIT_REF: "refs/heads/feature-x" }),
      execImpl: codeChangeExecImpl,
      fetchImpl: fetchImpl as unknown as FetchImpl,
      logImpl: () => {},
    });
    expect(result.code).toBe(0);
    expect(result.decision).toBe("skip");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("bypasses the gate on [force-deploy] with a loud warning and skips the API call", async () => {
    const fetchImpl = vi.fn();
    const { lines, logImpl } = createLogCollector();
    const result = await runDeployGate({
      env: baseEnv({ DEHOST_GIT_COMMIT_MESSAGE: "hotfix: prod is down [force-deploy]" }),
      execImpl: codeChangeExecImpl,
      fetchImpl: fetchImpl as unknown as FetchImpl,
      logImpl,
    });
    expect(result.code).toBe(1);
    expect(result.decision).toBe("proceed");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(lines.some((l) => l.includes("FORCE-DEPLOY BYPASS ACTIVE"))).toBe(true);
  });
});
