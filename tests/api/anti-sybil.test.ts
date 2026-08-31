import { describe, it, expect, vi } from "vitest";
import { POST as checkPost } from "@/app/api/v1/anti-sybil/check/route";
import { GET as repGet } from "@/app/api/v1/anti-sybil/reputation/[userId]/route";
import { POST as adjustPost } from "@/app/api/v1/anti-sybil/reputation/adjust/route";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "127.0.0.1"]]),
}));

const mockUser = {
  id: "mod-1",
  role: "moderator",
  isVerified: true
};

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockImplementation(async () => mockUser),
  requireModerator: vi.fn().mockImplementation(async () => mockUser),
  requireAdmin: vi.fn().mockImplementation(async () => mockUser),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "user_reputation") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  user_id: "user-target",
                  reputation_score: 75,
                  is_sybil_suspect: false,
                  trust_level: "trusted"
                },
                error: null
              })
            })
          })
        };
      }
      if (table === "reputation_logs") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({
                  data: [{ id: "log-1", change_amount: 5, reason: "Verified citizen boost" }],
                  error: null
                })
              })
            })
          })
        };
      }
      return {};
    },
    rpc: (fn: string, args: any) => {
      if (fn === "evaluate_sybil_risk_rpc") {
        return Promise.resolve({
          data: {
            risk_score: 15.0,
            is_flagged: false,
            anomaly_flags: []
          },
          error: null
        });
      }
      if (fn === "adjust_user_reputation_rpc") {
        return Promise.resolve({
          data: {
            user_id: args.p_user_id,
            previous_score: 75,
            new_score: 85,
            trust_level: "trusted",
            change: 10
          },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    }
  })
}));

describe("Anti-Sybil & Reputation Engine API", () => {
  it("POST /api/v1/anti-sybil/check evaluates sybil risk score", async () => {
    const req = new Request("http://localhost:3000/api/v1/anti-sybil/check", {
      method: "POST",
      body: JSON.stringify({
        fingerprint: "fp-browser-hash-xyz-123",
        user_id: "user-target"
      })
    });
    const res = await checkPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.evaluation.risk_score).toBe(15.0);
    expect(data.evaluation.is_flagged).toBe(false);
  });

  it("GET /api/v1/anti-sybil/reputation/[userId] fetches profile and logs", async () => {
    const req = new Request("http://localhost:3000/api/v1/anti-sybil/reputation/user-target");
    const res = await repGet(req, { params: Promise.resolve({ userId: "user-target" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reputation.reputation_score).toBe(75);
    expect(data.history).toHaveLength(1);
  });

  it("POST /api/v1/anti-sybil/reputation/adjust adjusts score with audit log", async () => {
    const req = new Request("http://localhost:3000/api/v1/anti-sybil/reputation/adjust", {
      method: "POST",
      body: JSON.stringify({
        user_id: "user-target",
        change_amount: 10,
        reason: "Exceptional bug triage contribution"
      })
    });
    const res = await adjustPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result.new_score).toBe(85);
  });
});
