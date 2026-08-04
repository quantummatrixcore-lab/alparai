import { NextResponse } from "next/server";
import { exec } from "child_process";
const execAsync = (cmd: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject({ ...error, stdout, stderr });
      else resolve({ stdout, stderr });
    });
  });
};

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run pnpm audit --json
    let auditResult = "";
    let vulnerabilities = { high: 0, critical: 0, moderate: 0, low: 0 };
    let success = true;

    try {
      const { stdout } = await execAsync("npx pnpm audit --json");
      auditResult = stdout;
    } catch (error: unknown) {
      // pnpm audit returns non-zero exit code if vulnerabilities are found
      if (error && typeof error === "object" && "stdout" in error) {
        auditResult = (error as { stdout: string }).stdout;
      } else {
        success = false;
        auditResult = JSON.stringify({ error: "Failed to run audit" });
      }
    }

    if (auditResult && auditResult.startsWith("{")) {
      try {
        const parsed = JSON.parse(auditResult);
        if (parsed.metadata && parsed.metadata.vulnerabilities) {
          vulnerabilities = parsed.metadata.vulnerabilities;
        }
      } catch (_e) {
        // Parsing failed, ignore
      }
    }

    // In a real scenario, this would write to a cron_job_logs table in Supabase.
    // For now, we will just log it to stdout as requested by the simplified logic.
    console.info("[Security Audit Cron] Audit complete", {
      success,
      vulnerabilities,
    });

    return NextResponse.json({
      success,
      message: "Security audit completed",
      data: {
        vulnerabilities,
      },
    });
  } catch (error) {
    console.error("[Security Audit Cron] Error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
