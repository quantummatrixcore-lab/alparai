import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email-123" }),
    },
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: () => Promise.resolve({ data: { id: "mock" }, error: null }),
      upsert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: { id: "mock" }, error: null }) }),
      }),
    }),
  }),
}));

vi.mock("@/lib/constants", () => ({
  APP_EMAIL: "hello@alparai.com",
}));

import { submitExpert } from "@/actions/experts";

function buildExpertForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("name", "John Expert");
  fd.set("email", "john.expert@university.edu");
  fd.set("title", "Senior Professor");
  fd.set("institution", "Stanford University");
  fd.set("expertiseArea", "research");
  fd.set("linkedinUrl", "https://linkedin.com/in/johnexpert");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitExpert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits successfully with valid data", async () => {
    const result = await submitExpert({ ok: false }, buildExpertForm());
    expect(result.ok).toBe(true);
  });

  it("returns field errors for short name", async () => {
    const fd = buildExpertForm({ name: "A" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.name).toBeDefined();
  });

  it("returns field errors for short title", async () => {
    const fd = buildExpertForm({ title: "B" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.title).toBeDefined();
  });

  it("returns field errors for short institution", async () => {
    const fd = buildExpertForm({ institution: "B" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.institution).toBeDefined();
  });

  it("returns field errors for invalid expertiseArea", async () => {
    const fd = buildExpertForm({ expertiseArea: "invalid-category" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.expertiseArea).toBeDefined();
  });

  it("returns field errors for invalid email", async () => {
    const fd = buildExpertForm({ email: "invalid-email" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
  });

  it("returns field errors for invalid linkedinUrl", async () => {
    const fd = buildExpertForm({ linkedinUrl: "not-a-url" });
    const result = await submitExpert({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.linkedinUrl).toBeDefined();
  });
});
