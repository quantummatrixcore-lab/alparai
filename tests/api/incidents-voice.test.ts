import { describe, it, expect } from "vitest";
import "../helpers/setup";
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
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Missing audio file");
  });

  it("should return 400 if audio file is empty", async () => {
    const formData = new FormData();
    const emptyFile = new File([], "empty.m4a", { type: "audio/m4a" });
    formData.append("audio", emptyFile);

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Audio file is empty");
  });

  it("should return 400 if audio mime type is unsupported", async () => {
    const formData = new FormData();
    const invalidFile = new File(["test data"], "invalid.exe", {
      type: "application/x-msdownload",
    });
    formData.append("audio", invalidFile);

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unsupported audio mime type");
  });

  it("should return 200 and transcription data for a valid .m4a audio file", async () => {
    const formData = new FormData();
    const audioContent = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const m4aFile = new File([audioContent], "recording.m4a", { type: "audio/m4a" });

    formData.append("audio", m4aFile);
    formData.append("locale", "tr");
    formData.append("incidentContext", "Mobil uygulama çökme bildirimi");

    const req = new Request("http://localhost/api/incidents/voice", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.transcript).toContain("Mobil uygulama çökme bildirimi");
    expect(body.data.model).toBe("qwen-omni-asr-v1");
  });

  it("should directly run transcribeAudio adapter function", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "audio.m4a", { type: "audio/m4a" });
    const result = await transcribeAudio(file, { locale: "tr", incidentContext: "Test" });

    expect(result.transcript).toBeDefined();
    expect(result.model).toBe("qwen-omni-asr-v1");
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
