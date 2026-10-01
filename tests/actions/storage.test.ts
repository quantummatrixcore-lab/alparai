import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue("127.0.0.1"),
    }),
  }));
  vi.doMock("next/cache", () => ({
    revalidatePath: vi.fn(),
  }));
  vi.doMock("@/lib/gdrive/client", () => ({
    uploadToDrive: vi.fn().mockResolvedValue("mock-gdrive-file-id-123"),
  }));
  vi.doMock("@/lib/dehost/server", () => ({
    createClient: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: {
      upload_evidence: "ratelimit:upload_evidence",
    },
  }));
});

import { createClient } from "@/lib/dehost/server";
import { uploadToDrive } from "@/lib/gdrive/client";
import { uploadIncidentEvidence } from "@/actions/storage";

let mockDeHost: ReturnType<typeof createMockDeHostClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHost = createMockDeHostClient();
  vi.mocked(createClient).mockResolvedValue(mockDeHost as never);
});

describe("uploadIncidentEvidence Security Gates", () => {
  it("rejects files larger than 10MB", async () => {
    const formData = new FormData();
    const largeBlob = new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/png" });
    const largeFile = new File([largeBlob], "large_image.png", { type: "image/png" });

    formData.append("file", largeFile);
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("10MB");
  });

  it("rejects unwhitelisted MIME types", async () => {
    const formData = new FormData();
    const textBlob = new Blob(["malicious script"], { type: "text/javascript" });
    const file = new File([textBlob], "script.js", { type: "text/javascript" });

    formData.append("file", file);
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid file type");
  });

  it("allows valid PNG files under 10MB", async () => {
    const formData = new FormData();
    const blob = new Blob(["valid png content"], { type: "image/png" });
    const file = new File([blob], "test.png", { type: "image/png" });

    formData.append("file", file);
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(true);
    expect(result.fileId).toBe("mock-gdrive-file-id-123");
    expect(uploadToDrive).toHaveBeenCalled();
  });

  it("allows valid JPEG files under 10MB", async () => {
    const formData = new FormData();
    const blob = new Blob(["valid jpeg content"], { type: "image/jpeg" });
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });

    formData.append("file", file);
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(true);
    expect(result.fileId).toBe("mock-gdrive-file-id-123");
  });

  it("allows valid PDF files under 10MB", async () => {
    const formData = new FormData();
    const blob = new Blob(["valid pdf content"], { type: "application/pdf" });
    const file = new File([blob], "document.pdf", { type: "application/pdf" });

    formData.append("file", file);
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(true);
    expect(result.fileId).toBe("mock-gdrive-file-id-123");
  });

  it("rejects when file is missing", async () => {
    const formData = new FormData();
    formData.append("incidentId", "inc-123");

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("No file provided");
  });

  it("rejects when incidentId is missing", async () => {
    const formData = new FormData();
    const blob = new Blob(["valid pdf content"], { type: "application/pdf" });
    const file = new File([blob], "document.pdf", { type: "application/pdf" });
    formData.append("file", file);

    const result = await uploadIncidentEvidence(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Incident ID is missing");
  });
});
