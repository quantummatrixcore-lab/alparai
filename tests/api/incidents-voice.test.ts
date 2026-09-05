import { describe, it, expect, vi } from "vitest";
import "../helpers/setup";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "user-1", email: "user@test.com" }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  RATE_LIMIT_KEYS: { voice_incident: "voice_incident" },
}));

import { POST, transcribeAudio } from "@/app/api/incidents/voice/route";

describe("Qwen Omni ASR Voice Incident API Route", () => {
  it("should return 400 if Content-Type is not multipart/form-data", async () => {
    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "data" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("multipart/form-data");
  });

  it("should return 400 if audio file is missing", async () => {
    const formData = new FormData();
    formData.append("locale", "tr");

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=---test" },
      body: formData,
    });
    Object.defineProperty(req, "formData", { value: () => Promise.resolve(formData) });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Missing audio file");
  });

  it("should return 400 if audio file is empty", async () => {
    const formData = new FormData();
    const emptyFile = new File([new Uint8Array(0)], "empty.m4a", { type: "audio/m4a" });
    formData.append("audio", emptyFile);

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=---test" },
    });
    Object.defineProperty(req, "formData", { value: () => Promise.resolve(formData) });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Audio file is empty");
  });

  it("should return 400 if audio mime type is unsupported", async () => {
    const formData = new FormData();
    const invalidFile = new File([new Uint8Array([1, 2, 3])], "invalid.exe", {
      type: "application/x-msdownload",
    });
    formData.append("audio", invalidFile);

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=---test" },
    });
    Object.defineProperty(req, "formData", { value: () => Promise.resolve(formData) });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unsupported audio mime type");
  });

  it("should return 503 when ASR service is unconfigured or fails (no fake fallback text)", async () => {
    const formData = new FormData();
    const audioContent = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const m4aFile = new File([audioContent], "recording.m4a", { type: "audio/m4a" });

    formData.append("audio", m4aFile);
    formData.append("locale", "tr");
    formData.append("incidentContext", "Mobil uygulama çökme bildirimi");

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=---test" },
    });
    Object.defineProperty(req, "formData", { value: () => Promise.resolve(formData) });

    const res = await POST(req);
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Voice transcription failed");
  });

  it("should throw error when transcribeAudio is called without ASR service", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "audio.m4a", { type: "audio/m4a" });
    await expect(transcribeAudio(file, { locale: "tr", incidentContext: "Test" })).rejects.toThrow(
      "Voice transcription failed or service is unavailable",
    );
  });
});
