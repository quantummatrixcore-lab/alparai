import { describe, it, expect } from "vitest";
import { mapCategory, inferSeverity, cleanTextAndMaskPII } from "../../scripts/import-utils";

describe("import-utils", () => {
  describe("mapCategory", () => {
    it("maps bias and discrimination", () => {
      expect(mapCategory("Gender Bias")).toBe("bias");
      expect(mapCategory("racial discrimination")).toBe("bias");
    });

    it("maps privacy and leaks", () => {
      expect(mapCategory("data leak")).toBe("privacy");
      expect(mapCategory("GDPR breach")).toBe("privacy");
    });

    it("maps security and hack", () => {
      expect(mapCategory("SQL injection hack")).toBe("security");
      expect(mapCategory("jailbreak exploit")).toBe("security");
    });

    it("maps misinformation and fake news", () => {
      expect(mapCategory("deepfake misinformation")).toBe("misinformation");
    });

    it("maps other category as default", () => {
      expect(mapCategory("unknown category")).toBe("other");
    });
  });

  describe("inferSeverity", () => {
    it("infers critical severity for fatal events", () => {
      expect(inferSeverity("Fatal accident", "The AI system caused a death")).toBe("critical");
      expect(inferSeverity("Critical infrastructure hack", "")).toBe("critical");
    });

    it("infers high severity for arrests and lawsuits", () => {
      expect(inferSeverity("Lawsuit filed", "Million dollar fine")).toBe("high");
    });

    it("infers medium severity for scams and leaks", () => {
      expect(inferSeverity("Scam campaign", "User credentials leak")).toBe("medium");
    });

    it("infers low severity by default", () => {
      expect(inferSeverity("small typo", "minor correction")).toBe("low");
    });
  });

  describe("cleanTextAndMaskPII", () => {
    it("masks email addresses", () => {
      const result = cleanTextAndMaskPII("Contact test@example.com for info");
      expect(result.hasPii).toBe(true);
      expect(result.masked).toContain("[REDACTED-EMAIL]");
    });

    it("handles empty or null text", () => {
      const result = cleanTextAndMaskPII(null);
      expect(result.raw).toBe("");
      expect(result.masked).toBe("");
      expect(result.hasPii).toBe(false);
    });
  });
});
