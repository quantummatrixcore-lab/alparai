import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/agora-t/cases/route";
import { POST as votePost } from "@/app/api/v1/agora-t/cases/[id]/vote/route";
import { POST as resolvePost } from "@/app/api/v1/agora-t/cases/[id]/resolve/route";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "127.0.0.1"]]),
}));

const mockUser = {
  id: "user-123",
  email: "citizen@example.com",
  role: "moderator",
  isVerified: true
};

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockImplementation(async () => mockUser),
  requireModerator: vi.fn().mockImplementation(async () => mockUser),
  requireAdmin: vi.fn().mockImplementation(async () => mockUser),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: async () => ({ ok: true, remaining: 20 }),
  RATE_LIMIT_KEYS: { api_general: "api_general" },
}));

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "jury_cases") {
        return {
          select: () => ({
            order: () => ({
              range: async () => ({
                data: [{ id: "case-1", title: "Test Case", status: "open", guilty_score: 0, innocent_score: 0 }],
                count: 1,
                error: null
              })
            }),
            eq: () => ({
              single: async () => ({
                data: { id: "case-1", title: "Test Case", status: "open" },
                error: null
              })
            })
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "case-new", title: "New Case", status: "open" },
                error: null
              })
            })
          }),
          update: () => ({
            eq: async () => ({ data: null, error: null })
          })
        };
      }
      if (table === "user_reputation") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { reputation_score: 85, trust_level: "trusted", is_sybil_suspect: false },
                error: null
              })
            })
          })
        };
      }
      if (table === "jury_votes") {
        return {
          upsert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "vote-1", case_id: "case-1", juror_id: "user-123", vote_decision: "guilty", vote_weight: 1.5 },
                error: null
              })
            })
          })
        };
      }
      if (table === "jurors") {
        return {
          update: () => ({
            eq: () => ({
              eq: async () => ({ data: null, error: null })
            })
          })
        };
      }
      return {
        select: mockSelect,
        insert: mockInsert,
        upsert: mockUpsert,
        update: mockUpdate
      };
    },
    rpc: (fn: string) => {
      if (fn === "resolve_agora_case_rpc") {
        return Promise.resolve({
          data: {
            case_id: "case-1",
            verdict: "guilty",
            guilty_score: 3.5,
            innocent_score: 1.0,
            status: "resolved"
          },
          error: null
        });
      }
      if (fn === "adjust_user_reputation_rpc") {
        return Promise.resolve({ data: { success: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }
  })
}));

describe("Agora-T Jury System API", () => {
  it("GET /api/v1/agora-t/cases returns list of jury cases", async () => {
    const req = new Request("http://localhost:3000/api/v1/agora-t/cases");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cases).toHaveLength(1);
    expect(data.cases[0].title).toBe("Test Case");
  });

  it("POST /api/v1/agora-t/cases creates a new jury case", async () => {
    const req = new Request("http://localhost:3000/api/v1/agora-t/cases", {
      method: "POST",
      body: JSON.stringify({
        title: "New Bias Violation Case",
        description: "Model exhibited severe bias during benchmark",
        category: "algorithmic_bias"
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.case.id).toBe("case-new");
  });

  it("POST /api/v1/agora-t/cases/[id]/vote registers a weighted jury vote", async () => {
    const req = new Request("http://localhost:3000/api/v1/agora-t/cases/case-1/vote", {
      method: "POST",
      body: JSON.stringify({
        decision: "guilty",
        rationale: "Evidence clearly shows violation"
      })
    });
    const res = await votePost(req, { params: Promise.resolve({ id: "case-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.vote.vote_decision).toBe("guilty");
    expect(data.vote_weight).toBe(1.5);
  });

  it("POST /api/v1/agora-t/cases/[id]/resolve triggers consensus resolution", async () => {
    const req = new Request("http://localhost:3000/api/v1/agora-t/cases/case-1/resolve", {
      method: "POST"
    });
    const res = await resolvePost(req, { params: Promise.resolve({ id: "case-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.resolution.verdict).toBe("guilty");
  });
});
