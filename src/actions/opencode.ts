"use server";

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export type OpenCodeRunPayload = {
  model: string;
  command?: string;
  exit_code: number;
  duration_ms: number;
  git_sha?: string;
  task_ref: string | number;
  role?: string;
  diagnosis?: string;
  gates?: Record<string, number>;
};

export async function recordOpenCodeRun(payload: OpenCodeRunPayload) {
  if (process.env.NODE_ENV === "production") {
    // Cannot write to local FS on Vercel production
    return { success: false, error: "Read-only file system on production" };
  }

  try {
    const now = new Date();
    const timestampStr = now.toISOString().replace(/:/g, "-").replace(/\./g, "-");

    let sha = payload.git_sha;
    if (!sha) {
      try {
        sha = execSync("git rev-parse HEAD", { encoding: "utf-8", stdio: "pipe" }).trim();
      } catch {
        sha = "unknown";
      }
    }

    const logData = {
      ...payload,
      git_sha: sha,
      timestamp: now.toISOString(),
    };

    const dir = path.join(process.cwd(), "ops", "opencode-runs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `${timestampStr}-task-${payload.task_ref}.json`;
    const filePath = path.join(dir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), "utf-8");

    return { success: true, file: fileName };
  } catch (error) {
    console.error("Failed to record OpenCode run:", error);
    return { success: false, error: String(error) };
  }
}
