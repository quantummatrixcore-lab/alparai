import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/../tests/helpers/setup"; // import mock setup

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { GET as getBenchmark } from "@/app/api/v1/auditor/k-benchmark/route";
import { GET as getMethodology } from "@/app/api/v1/auditor/methodology/route";
import { GET as getAuditLogs } from "@/app/api/v1/auditor/audit-logs/route";

describe("Auditor API Endpoints", () => {
  beforeEach(() => {
    vi.stubEnv("AUDITOR_API_KEY", "auditor-secret-key");
    vi.clearAllMocks();

    // Provide a safe default mock that returns empty datasets
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  it("should fail benchmark with 401 if unauthorized", async () => {
    const req = new Request("http://localhost/api/v1/auditor/k-benchmark", {
      headers: { authorization: "Bearer bad-key" },
    });
    const res = await getBenchmark(req);
    expect(res.status).toBe(401);
  });

  it("should retrieve benchmark data successfully", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            category_id: "K1",
            model_id: "openai/gpt-4o",
            score: 0.92,
            status: "active",
            sample_size: 100,
            created_at: "2026-07-12T12:00:00Z",
          },
        ],
        error: null,
      }),
    }));

    const req = new Request("http://localhost/api/v1/auditor/k-benchmark", {
      headers: { authorization: "Bearer auditor-secret-key" },
    });
    const res = await getBenchmark(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data[0].category_id).toBe("K1");
    expect(json.data[0].score).toBe(0.92);
  });

  it("should retrieve methodology versions successfully", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            version: "v1.0.0",
            description: "Initial release",
            created_at: "2026-07-12T12:00:00Z",
          },
        ],
        error: null,
      }),
    }));

    const req = new Request("http://localhost/api/v1/auditor/methodology", {
      headers: { authorization: "Bearer auditor-secret-key" },
    });
    const res = await getMethodology(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data[0].version).toBe("v1.0.0");
  });

  it("should retrieve audit logs successfully", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
            actor_id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
            action: "UPDATE",
            entity_type: "incidents",
            entity_id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
            created_at: "2026-07-12T12:00:00Z",
          },
        ],
        error: null,
      }),
    }));

    const req = new Request("http://localhost/api/v1/auditor/audit-logs", {
      headers: { authorization: "Bearer auditor-secret-key" },
    });
    const res = await getAuditLogs(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data[0].action).toBe("UPDATE");
  });
});
