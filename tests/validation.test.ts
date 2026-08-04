import { describe, it, expect } from "vitest";
import {
  incidentSubmissionSchema,
  suggestionSubmissionSchema,
  contactFormSchema,
} from "@/lib/validation/schemas";

describe("incidentSubmissionSchema", () => {
  const base = {
    title: "Hallucinated legal citation in answer",
    description:
      "The model cited a non-existent court case in its response to my legal question. This is dangerous.",
    category: "hallucination" as const,
    severity: "high" as const,
    consent: {
      truthfulness: true as const,
      anonymousPublication: true as const,
      age18Plus: true as const,
      termsOfService: true as const,
    },
    isAnonymous: true,
    language: "en",
  };

  it("accepts a valid submission", () => {
    const r = incidentSubmissionSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rejects too-short title", () => {
    const r = incidentSubmissionSchema.safeParse({ ...base, title: "Hi" });
    expect(r.success).toBe(false);
  });

  it("rejects missing truthfulness consent", () => {
    const r = incidentSubmissionSchema.safeParse({
      ...base,
      consent: { ...base.consent, truthfulness: false as never },
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid severity", () => {
    const r = incidentSubmissionSchema.safeParse({
      ...base,
      severity: "extreme" as never,
    });
    expect(r.success).toBe(false);
  });
});

describe("suggestionSubmissionSchema", () => {
  it("accepts a valid suggestion", () => {
    const r = suggestionSubmissionSchema.safeParse({
      title: "Add a dark mode toggle",
      description: "It would be nice to have a manual dark/light mode toggle in the user menu.",
      category: "feature",
      isAnonymous: false,
    });
    expect(r.success).toBe(true);
  });
});

describe("contactFormSchema", () => {
  it("requires name and email", () => {
    const r = contactFormSchema.safeParse({
      name: "X",
      email: "not-an-email",
      subject: "hello",
      message: "this is a test message body that is long enough",
      category: "general",
    });
    expect(r.success).toBe(false);
  });
});
