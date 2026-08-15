import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

// Mock Supabase admin client
const mockSingle = vi.fn().mockResolvedValue({
  data: { id: "key-123", status: "active" },
  error: null
});

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: mockSingle
  })
});

const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert
    }),
    rpc: mockRpc
  })
}));

// Mock Rate Limiting
vi.mock("@/lib/utils/rate-limit", () => ({
  RATE_LIMIT_KEYS: { api_developer: "api_dev" },
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true })
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
        "Authorization": "Bearer alpar-test-key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] })
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
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] })
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when messages array is missing", async () => {
    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer alpar-test-key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(400);
  });

  it("returns completion with alignment_score in JSON response (mock fallback)", async () => {
    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer alpar-test-key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Vizyonunuz nedir?" }]
      })
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
              content: "As an AI language model, I cannot lead a nation, but I can provide historical facts."
            }
          }
        ],
        usage: { prompt_tokens: 15, completion_tokens: 20 }
      })
    } as unknown as Response;

    const mockHealedResponse = {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Gazi Mustafa Kemal Atatürk olarak milletimize vizyonumuz; akıl, bilim ve tam bağımsızlıktır. Hayatta en hakiki mürşit ilimdir."
            }
          }
        ]
      })
    } as unknown as Response;

    const fetchSpy = vi.spyOn(ssrfModule, "fetchWithSsrfGuard")
      .mockResolvedValueOnce(mockInitialResponse)
      .mockResolvedValueOnce(mockHealedResponse);

    const req = new Request("http://localhost/api/v1/personas/ataturk/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer alpar-test-key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Gelecek vizyonu nedir?" }]
      })
    });

    const res = await POST(req, { params: Promise.resolve({ twinId: "ataturk" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(fetchSpy).toHaveBeenCalledTimes(2); // Initial fetch + Self-heal fetch
    expect(json.choices[0].message.content).toContain("Gazi Mustafa Kemal Atatürk");
    expect(json.alignment_score).toBeGreaterThanOrEqual(85);
  });
});
