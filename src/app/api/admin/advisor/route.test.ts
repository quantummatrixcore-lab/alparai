import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  RATE_LIMIT_KEYS: {
    admin_advisor_chat: "ratelimit:admin_advisor_chat",
  },
}));

describe("POST /api/admin/advisor", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, OPENROUTER_API_KEY: "test-openrouter-key" };
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-admin-1",
      email: "admin@alparai.com",
      role: "admin",
      createdAt: new Date(),
    } as unknown as ReturnType<typeof getCurrentUser> extends Promise<infer U> ? U : never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      ok: true,
      retryAfter: 0,
    } as unknown as ReturnType<typeof checkRateLimit> extends Promise<infer R> ? R : never);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 403 when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Merhaba" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Forbidden");
  });

  it("returns 403 when user role is not admin or ceo", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-regular-1",
      email: "user@alparai.com",
      role: "user",
      createdAt: new Date(),
    } as unknown as ReturnType<typeof getCurrentUser> extends Promise<infer U> ? U : never);

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Merhaba" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Forbidden");
  });

  it("returns 500 when OPENROUTER_API_KEY is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Merhaba" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("OpenRouter API key is not configured");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      ok: false,
      retryAfter: 30,
    } as unknown as ReturnType<typeof checkRateLimit> extends Promise<infer R> ? R : never);

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Merhaba" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.reply).toContain("30s sonra tekrar deneyin");
  });

  it("returns 400 when message is missing or invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.reply).toBe("Lütfen geçerli bir mesaj yazınız.");
  });

  it("returns 200 with model response on success", async () => {
    const mockReply = "Stratejik karar: Akıl ve bilim yolunda ilerlemeliyiz.";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockReply } }],
      }),
    } as Response);

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Platform vizyonumuz nedir?" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe(mockReply);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-openrouter-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("handles upstream OpenRouter error gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 502,
    } as Response);

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Durum analizi yap" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe("Cevap alınamadı.");
  });

  it("handles fetch network failure gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

    const req = new NextRequest("http://localhost:3000/api/admin/advisor", {
      method: "POST",
      body: JSON.stringify({ message: "Durum analizi yap" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe("Cevap alınamadı.");
  });
});
