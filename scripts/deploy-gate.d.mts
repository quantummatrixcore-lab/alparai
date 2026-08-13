export type CheckState = "success" | "failure" | "pending" | "missing";
export type PollOutcome = "success" | "failure" | "pending" | "timeout";
export type GateDecision = "proceed" | "skip";

export type EnvMap = Record<string, string | undefined>;
export type ExecImpl = (command: string) => string;
export type FetchImpl = typeof fetch;
export type SleepImpl = (ms: number) => Promise<void>;
export type NowImpl = () => number;
export type LogImpl = (message: string) => void;

export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface RequiredCheckResult {
  required: string;
  state: CheckState;
  url: string | null;
  source?: string;
}

export interface EvaluationResult {
  outcome: PollOutcome;
  perCheck: RequiredCheckResult[];
  failures: RequiredCheckResult[];
  pending: RequiredCheckResult[];
}

export interface GitHubCheckRun {
  name: string;
  status: string;
  conclusion: string | null;
  html_url?: string | null;
}

export interface GitHubCommitStatus {
  context: string;
  state: string;
  target_url?: string | null;
}

export interface PollRequiredChecksOptions {
  owner: string;
  repo: string;
  sha: string;
  token: string;
  requiredChecks: string[];
  timeoutMs?: number;
  pollIntervalMs?: number;
  fetchImpl: FetchImpl;
  sleepImpl?: SleepImpl;
  nowImpl?: NowImpl;
  logImpl?: LogImpl;
}

export interface RunDeployGateOptions {
  env?: EnvMap;
  execImpl?: ExecImpl;
  fetchImpl?: FetchImpl;
  sleepImpl?: SleepImpl;
  nowImpl?: NowImpl;
  logImpl?: LogImpl;
  pollIntervalMs?: number;
}

export interface RunDeployGateResult {
  code: 0 | 1;
  decision: GateDecision;
  reason: string;
}

export declare const DEFAULT_REQUIRED_CHECKS: string[];
export declare const DEFAULT_TIMEOUT_MS: number;
export declare const DEFAULT_POLL_INTERVAL_MS: number;

export declare function defaultExecImpl(command: string): string;
export declare function defaultSleep(ms: number): Promise<void>;
export declare function resolveCommitSha(env: EnvMap, execImpl: ExecImpl): string;
export declare function readCommitMessage(env: EnvMap, execImpl: ExecImpl): string;
export declare function parseOwnerRepoFromRemoteUrl(url: string): RepoInfo | null;
export declare function resolveRepoInfo(env: EnvMap, execImpl: ExecImpl): RepoInfo;
export declare function hasApplicationCodeChanges(execImpl: ExecImpl, logImpl: LogImpl): boolean;
export declare function parseRequiredChecks(env: EnvMap): string[];
export declare function checkNameMatches(required: string, actual: string): boolean;
export declare function evaluateRequiredChecks(
  requiredChecks: string[],
  checkRuns: GitHubCheckRun[],
  statuses: GitHubCommitStatus[]
): EvaluationResult;
export declare function pollRequiredChecks(options: PollRequiredChecksOptions): Promise<EvaluationResult>;
export declare function runDeployGate(options?: RunDeployGateOptions): Promise<RunDeployGateResult>;
