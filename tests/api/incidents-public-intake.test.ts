import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.10"]]),
  cookies: async () => new Map(),
}));

const insertMock = vi.fn();
const selectMock = vi.fn();

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => ({
      select: (...args: unknown[]) => {
        selectMock(...args);
        const chain: Record<string, unknown> = {};
        chain.eq = () => chain;
        chain.ilike = () => chain;
        chain.order = () => chain;
        chain.limit = async () => ({ data: [], error: null });
        chain.then = (res: (v: unknown) => unknown) => res({ data: [], error: null });
        return chain;
      },
      insert: (...args: unknown[]) => {
        insertMock(...args);
        const chain: Record<string, unknown> = {};
        chain.select = () => chain;
        chain.single = async () => ({
          data: {
            id: "inc-test-1",
            status: "pending_review",
            created_at: new Date().toISOString(),
          },
          error: null,
        });
        return chain;
      },
    }),
  }),
  createClient: async () => ({
    from: () => ({
      select: () => ({ limit: async () => ({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    }),
  }),
}));

const rateLimitState = { ok: true, retryAfter: 60 };

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: async () => rateLimitState,
  RATE_LIMIT_KEYS: { incident_submission: "ratelimit:incident_submission" },
}));

import { GET, POST } from "@/app/api/incidents/route";

const VALID_BODY = {
  title: "Air Canada chatbot gave a wrong refund policy to a customer",
  description:
    "The Air Canada customer support chatbot incorrectly stated that a bereavement fare could be refunded, causing the passenger to purchase a non-refundable ticket. This is a documented hallucination incident.",
  category: "hallucination",
  severity: "high",
};

function makeRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost:3000/api/incidents", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Public incident intake API — security contract", () => {
  beforeEach(() => {
    insertMock.mockClear();
    selectMock.mockClear();
    rateLimitState.ok = true;
  });

  it("rejects a payload that tries to set `status: published`", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, status: "published" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a payload that tries to self-assert `is_expert`", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, is_expert: true }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a payload that tries to inject a cross-audit truth score", async () => {
    const res = await POST(
      makeRequest({ ...VALID_BODY, cross_audit_truth_score: 1, cross_audit_confidence: 1 }),
    );
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a payload that tries to pre-inflate engagement counters", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, upvotes_count: 9999, views_count: 9999 }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a payload with an out-of-enum category", async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, category: "not_a_real_category" }));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with 400", async () => {
    const req = new Request("http://localhost:3000/api/incidents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("enforces the IP rate limit with 429", async () => {
    rateLimitState.ok = false;
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("persists a valid submission with a server-owned `pending_review` status", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(201);
    expect(insertMock).toHaveBeenCalledTimes(1);

    const payload = insertMock.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe("pending_review");
    expect(payload.processing_stage).toBe("queued");
    expect(payload.is_expert).toBe(false);
    expect(payload.cross_audit_truth_score).toBeNull();
    expect(payload.upvotes_count).toBe(0);
    expect(payload.views_count).toBe(0);
    expect(payload.published_at).toBeUndefined();
    expect(typeof payload.id).toBe("string");
    expect(payload.id).not.toBe("");
  });

  it("does not let the client dictate the incident id", async () => {
    await POST(makeRequest({ ...VALID_BODY, id: "attacker-controlled-id" } as never));
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("GET requests only the masked public projection", async () => {
    await GET(new Request("http://localhost:3000/api/incidents?limit=8"));
    expect(selectMock).toHaveBeenCalledTimes(1);
    const projection = String(selectMock.mock.calls[0][0]);
    expect(projection).toContain("title_masked");
    expect(projection).toContain("description_masked");
    expect(projection).not.toContain("ip_hash");
    expect(projection).not.toContain("user_id");
    expect(projection).not.toContain("encrypted_evidence");
  });
});
