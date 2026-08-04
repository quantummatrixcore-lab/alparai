import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/cron/security-audit/route";
import { exec } from "child_process";

vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

describe("Security Audit Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    process.env.CRON_SECRET = "secret";
    const req = new Request("http://localhost/api/cron/security-audit", {
      headers: {
        authorization: "Bearer wrong",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return success and vulnerabilities when authorized", async () => {
    process.env.CRON_SECRET = "secret";
    const req = new Request("http://localhost/api/cron/security-audit", {
      headers: {
        authorization: "Bearer secret",
      },
    });

    const mockAuditResult = JSON.stringify({
      metadata: {
        vulnerabilities: {
          high: 1,
          critical: 0,
          moderate: 2,
          low: 0,
        },
      },
    });

    // Mock exec to simulate successful execution
    vi.mocked(exec).mockImplementation((_command, callback: unknown) => {
      const cb = callback as (error: Error | null, stdout: string, stderr: string) => void;
      cb(null, mockAuditResult, "");
      // Return a dummy object with symbol keys to satisfy child_process.ChildProcess type requirements
      return {
        _isMockFunction: true,
      } as unknown as ReturnType<typeof exec>;
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.vulnerabilities.high).toBe(1);
  });
});
