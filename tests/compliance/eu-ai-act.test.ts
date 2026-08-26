import { describe, it, expect } from "vitest";
import { generateEUCompliancePassport } from "@/lib/compliance/eu-ai-act";

describe("EU AI Act Compliance Passport", () => {
  it("classifies prohibited biometric and social scoring AI practices", () => {
    const passport = generateEUCompliancePassport(
      "sys-01",
      "Social Tracker",
      "social_scoring_algorithm",
      false,
    );
    expect(passport.riskTier).toBe("PROHIBITED");
    expect(passport.status).toBe("NON_COMPLIANT");
  });

  it("classifies high-risk systems and checks human-in-the-loop requirement", () => {
    const unverified = generateEUCompliancePassport(
      "sys-02",
      "Medical Triage",
      "medical_diagnosis",
      false,
    );
    expect(unverified.riskTier).toBe("HIGH_RISK");
    expect(unverified.status).toBe("NEEDS_AUDIT");

    const verified = generateEUCompliancePassport(
      "sys-02",
      "Medical Triage",
      "medical_diagnosis",
      true,
    );
    expect(verified.status).toBe("COMPLIANT");
  });
});
