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
      upsert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: { id: "mock" }, error: null }) }),
      }),
    }),
  }),
}));

vi.mock("@/lib/validation/schemas", async () => {
  const { z } = await import("zod");
  return {
    contactFormSchema: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      subject: z.string().min(5).max(200),
      message: z.string().min(20).max(5000),
      category: z.enum(["general", "press", "partnership", "security", "legal"]),
    }),
  };
});

vi.mock("@/lib/constants", () => ({
  APP_EMAIL: "hello@alparai.com",
}));

import { submitContact } from "@/actions/contact";

function buildContactForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("name", "Jane Doe");
  fd.set("email", "jane@example.com");
  fd.set("subject", "Partnership inquiry about ALPAR AI");
  fd.set("message", "I would like to discuss a potential partnership opportunity with your team.");
  fd.set("category", "partnership");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits successfully with valid data", async () => {
    const result = await submitContact({ ok: false }, buildContactForm());
    expect(result.ok).toBe(true);
  });

  it("returns field errors for missing name", async () => {
    const fd = buildContactForm({ name: "" });
    const result = await submitContact({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("returns field errors for invalid email", async () => {
    const fd = buildContactForm({ email: "not-an-email" });
    const result = await submitContact({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("returns field errors for short message", async () => {
    const fd = buildContactForm({ message: "Too short" });
    const result = await submitContact({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });
});
