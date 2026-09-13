import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../helpers/setup";

// Mock DeHost admin client
const mockSingle = vi.fn().mockResolvedValue({
  data: { id: "key-123", status: "active" },
  error: null,
});

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: mockSingle,
  }),
});

const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
    }),
    rpc: mockRpc,
  }),
}));

// Mock Rate Limiting
vi.mock("@/lib/utils/rate-limit", () => ({
  RATE_LIMIT_KEYS: { api_developer: "api_dev" },
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock SSRF guard
import * as ssrfModule from "@/lib/security/ssrf";
import { POST } from "@/app/api/v1/personas/[twinId]/completions/route";

describe("Persona Completions Route with Alignment Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENROUTER_API_KEY;
  });

  it("returns 404 when twinId does not exist", async () => {
    const req = new Request("http://localhost/api/v1/personas/non-existent/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer alpar-test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "non-existent" }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("persona_not_found");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when messages array is missing", async () => {
    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer alpar-test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(400);
  });

  it("returns completion with alignment_score in JSON response (mock fallback)", async () => {
    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer alpar-test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Vizyonunuz nedir?" }],
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.object).toBe("chat.completion");
    expect(json.choices).toBeDefined();
    expect(json.choices[0].message.content).toBeDefined();
    expect(typeof json.alignment_score).toBe("number");
    expect(json.alignment_score).toBeGreaterThanOrEqual(0);
    expect(json.alignment_score).toBeLessThanOrEqual(100);
  });

  it("heals response if initial OpenRouter response contains AI disclaimer (<85 score)", async () => {
    process.env.OPENROUTER_API_KEY = "mock-openrouter-key";

    // 1st call: initial low-scoring response with disclaimer
    // 2nd call: self-healing response
    const mockInitialResponse = {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "As an AI language model, I cannot lead a nation, but I can provide historical facts.",
            },
          },
        ],
        usage: { prompt_tokens: 15, completion_tokens: 20 },
      }),
    } as unknown as Response;

    const mockHealedResponse = {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "Gazi Mustafa Kemal Atatürk olarak milletimize vizyonumuz; akıl, bilim ve tam bağımsızlıktır. Hayatta en hakiki mürşit ilimdir.",
            },
          },
        ],
      }),
    } as unknown as Response;

    const fetchSpy = vi
      .spyOn(ssrfModule, "fetchWithSsrfGuard")
      .mockResolvedValueOnce(mockInitialResponse)
      .mockResolvedValueOnce(mockHealedResponse);

    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer alpar-test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Gelecek vizyonu nedir?" }],
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Initial fetch (self-healing applies deterministic persona framing)
    expect(json.choices[0].message.content).toContain("Mustafa Kemal Atatürk");
    expect(typeof json.alignment_score).toBe("number");
  });

  describe("SEC-001: Strict Production API Key Verification", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    });

    afterEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    });

    it("rejects arbitrary sk- key in production when not in DB", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });

      const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer sk-unauthorized-fake-key-12345",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "Test query" }] }),
      });

      const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("invalid_api_key");
    });

    it("accepts valid active key in DB in production", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "prod-key-1", status: "active" },
        error: null,
      });

      const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer sk-valid-prod-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "Test query" }] }),
      });

      const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
      expect(res.status).toBe(200);
    });
  });
});
