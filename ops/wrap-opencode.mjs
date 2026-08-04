import { spawnSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { parseArgs } from "util";

const options = {
  model: { type: "string" },
  task: { type: "string" },
  role: { type: "string" },
  help: { type: "boolean", short: "h" },
};

let parsed;
try {
  parsed = parseArgs({ args: process.argv.slice(2), options, allowPositionals: true });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const { values, positionals } = parsed;

if (values.help || !values.model || !values.task || positionals.length === 0) {
  console.error("Usage: node ops/wrap-opencode.mjs --model <model> --task <task_ref> [--role <role>] -- <command...>");
  console.error("Example: node ops/wrap-opencode.mjs --model opencode/deepseek-v4 --task 60 -- npx some-agent");
  process.exit(1);
}

const commandArgs = positionals;
const command = commandArgs.join(" ");

console.log(`[OpenCode Wrapper] Starting task ${values.task} with model ${values.model}...`);
const startTime = Date.now();

const result = spawnSync(commandArgs[0], commandArgs.slice(1), {
  stdio: "inherit",
  shell: true,
});

const duration_ms = Date.now() - startTime;
const exit_code = result.status ?? 1;

let git_sha = "unknown";
try {
  git_sha = execSync("git rev-parse HEAD", { encoding: "utf-8", stdio: "pipe" }).trim();
} catch (_e) {
  // ignore
}

const now = new Date();
const timestampStr = now.toISOString().replace(/:/g, "-").replace(/\./g, "-");

const logData = {
  model: values.model,
  task_ref: values.task,
  command,
  exit_code,
  duration_ms,
  git_sha,
  role: values.role || "agent",
  timestamp: now.toISOString(),
};

const runsDir = path.join(process.cwd(), "ops", "opencode-runs");
if (!fs.existsSync(runsDir)) {
  fs.mkdirSync(runsDir, { recursive: true });
}

const fileName = `${timestampStr}-task-${values.task}.json`;
const filePath = path.join(runsDir, fileName);

fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), "utf-8");

console.log(`[OpenCode Wrapper] Task ${values.task} finished in ${duration_ms}ms with exit code ${exit_code}. Log saved to ops/opencode-runs/${fileName}`);
process.exit(exit_code);
