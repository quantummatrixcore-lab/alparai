import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/ai/transcribe/route";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "user_1", email: "test@example.com" }),
}));

describe("VOICE-1: Voice Transcribe API Route", () => {
  it("returns 400 when no audio file is provided", async () => {
    const req = new Request("http://localhost:3000/api/ai/transcribe", {
      method: "POST",
      body: new FormData(),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.transcript).toBeUndefined();
  });

  it("returns 503 error when API key is missing or model fails (no fabricated fallback prose)", async () => {
    const formData = new FormData();
    const mockFile = new File(["dummy audio content"], "test.webm", { type: "audio/webm" });
    formData.append("audio", mockFile);

    const req = new Request("http://localhost:3000/api/ai/transcribe", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.transcript).toBeUndefined();
  });
});
