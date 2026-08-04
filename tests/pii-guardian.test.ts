import { describe, it, expect } from "vitest";
import {
  hasPII,
  detectPIITypes,
  maskPII,
  detectContentWarning,
  hasContentWarning,
  isSensitiveCategory,
} from "@/lib/pii/guardian";

describe("PII Guardian", () => {
  describe("email", () => {
    it("detects plain email", () => {
      expect(hasPII("Contact me at john.doe@example.com please")).toBe(true);
      expect(detectPIITypes("Contact me at john.doe@example.com please")).toContain("email");
    });
    it("masks email with placeholders", () => {
      const r = maskPII("Email john.doe@example.com");
      expect(r.masked).not.toContain("john.doe@example.com");
      expect(r.masked).toMatch(/\[REDACTED-EMAIL\]/);
    });
  });

  describe("phone", () => {
    it("detects TR phone", () => {
      expect(hasPII("Ara beni: 0532 123 45 67")).toBe(true);
    });
    it("detects international phone", () => {
      expect(hasPII("Call +1 415 555 0123")).toBe(true);
    });
  });

  describe("credit card", () => {
    it("detects a Luhn-valid Visa", () => {
      expect(hasPII("Card 4111 1111 1111 1111")).toBe(true);
    });
    it("rejects non-Luhn-valid 16-digit number", () => {
      expect(detectPIITypes("Order #1234 5678 9012 3456")).not.toContain("credit_card");
    });
  });

  describe("IBAN", () => {
    it("detects and masks TR IBAN with valid mod-97", () => {
      expect(hasPII("TR29 0006 4000 0011 2345 6789 01")).toBe(true);
      const r = maskPII("My IBAN is TR29 0006 4000 0011 2345 6789 01.");
      expect(r.masked).toContain("[REDACTED-IBAN]");
      expect(r.masked).not.toContain("TR29");
    });

    it("rejects invalid mod-97 TR IBAN", () => {
      // Formats correctly but invalid checksum
      expect(hasPII("TR12 0006 4000 0011 2345 6789 01")).toBe(false);
      const r = maskPII("My IBAN is TR12 0006 4000 0011 2345 6789 01.");
      expect(r.masked).toContain("TR12 0006 4000 0011 2345 6789 01");
    });

    it("masks spaces-reformatted IBAN", () => {
      const r = maskPII("TR290006400000112345678901");
      expect(r.masked).toBe("[REDACTED-IBAN]");
    });
  });

  describe("API keys", () => {
    it("detects OpenAI key", () => {
      expect(detectPIITypes("Key: sk-proj-abcdefghij1234567890")).toContain("api_key");
    });
    it("detects xAI key", () => {
      expect(detectPIITypes("xai-abcdefghij1234567890")).toContain("api_key");
    });
    it("detects AWS access key", () => {
      expect(detectPIITypes("AKIAIOSFODNN7EXAMPLE")).toContain("api_key");
    });
  });

  describe("URL with token", () => {
    it("detects token in URL", () => {
      expect(hasPII("https://api.example.com/v1?token=abc123def456")).toBe(true);
    });
  });

  describe("clean text", () => {
    it("returns no PII for a normal incident report", () => {
      expect(
        hasPII(
          "The AI assistant gave incorrect medical advice about aspirin dosage. It recommended 5000mg, which is dangerous.",
        ),
      ).toBe(false);
    });
  });

  describe("maskPII", () => {
    it("returns original when no PII", () => {
      const r = maskPII("Clean text");
      expect(r.masked).toBe("Clean text");
      expect(r.piiFound).toBe(false);
      expect(r.redactedCount).toBe(0);
    });

    it("masks multiple PII types in one go", () => {
      const r = maskPII("Email a@b.com phone 05321234567 card 4111111111111111");
      expect(r.masked).not.toContain("a@b.com");
      expect(r.masked).not.toContain("4111111111111111");
      expect(r.piiFound).toBe(true);
      expect(r.detections.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("TC Kimlik checksum", () => {
    it("detects a valid TC Kimlik (10000000146)", () => {
      expect(hasPII("TC No: 10000000146")).toBe(true);
      expect(detectPIITypes("TC No: 10000000146")).toContain("tc_kimlik");
    });

    it("masks a valid TC Kimlik", () => {
      const r = maskPII("TC Kimlik: 10000000146");
      expect(r.masked).not.toContain("10000000146");
      expect(r.masked).toContain("[REDACTED-TC]");
      expect(r.redactedCount).toBe(1);
    });

    it("rejects an invalid TC Kimlik (12345678901)", () => {
      expect(detectPIITypes("Number 12345678901")).not.toContain("tc_kimlik");
    });

    it("does not false-positive on random 11-digit numbers", () => {
      expect(hasPII("Reference: 99887766554")).toBe(false);
      expect(detectPIITypes("Code 11111111111")).not.toContain("tc_kimlik");
    });

    it("does not match 11-digit numbers starting with 0", () => {
      expect(detectPIITypes("ID 01234567890")).not.toContain("tc_kimlik");
    });
  });

  describe("IPv6", () => {
    it("detects a full IPv6 address", () => {
      expect(hasPII("Server at 2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
      expect(detectPIITypes("Server at 2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toContain("ipv6");
    });

    it("masks a full IPv6 address", () => {
      const r = maskPII("Host: 2001:0db8:85a3:0000:0000:8a2e:0370:7334");
      expect(r.masked).not.toContain("2001:0db8");
      expect(r.masked).toContain("[REDACTED-IP]");
    });

    it("detects loopback ::1", () => {
      expect(detectPIITypes("localhost ::1")).toContain("ipv6");
    });

    it("detects abbreviated IPv6", () => {
      expect(detectPIITypes("addr fe80::1")).toContain("ipv6");
    });
  });

  describe("Turkish Tax ID (Vergi Kimlik)", () => {
    it("detects 'Vergi No: 1234567890'", () => {
      expect(hasPII("Vergi No: 1234567890")).toBe(true);
      expect(detectPIITypes("Vergi No: 1234567890")).toContain("vergi_kimlik");
    });

    it("masks tax ID with keyword context", () => {
      const r = maskPII("Firma VKN: 9876543210");
      expect(r.masked).not.toContain("9876543210");
      expect(r.masked).toContain("[REDACTED-TAX-ID]");
    });

    it("detects 'tax id 1234567890'", () => {
      expect(detectPIITypes("tax id 1234567890")).toContain("vergi_kimlik");
    });

    it("detects 'vergi kimlik numarası: 1234567890'", () => {
      expect(detectPIITypes("vergi kimlik numarası: 1234567890")).toContain("vergi_kimlik");
    });

    it("does not detect a bare 10-digit number without context", () => {
      expect(detectPIITypes("Order 1234567890")).not.toContain("vergi_kimlik");
    });
  });

  describe("Extra test coverage for T3", () => {
    describe("Passport", () => {
      it("detects and masks passport", () => {
        expect(hasPII("Passport U12345678")).toBe(true);
        const r = maskPII("Passport U12345678");
        expect(r.masked).toBe("Passport [REDACTED-PASSPORT]");
      });
    });

    describe("Date of Birth", () => {
      it("detects and masks DOB", () => {
        expect(hasPII("My birthday is 15.06.1990")).toBe(true);
        expect(hasPII("My birthday is 1990-06-15")).toBe(true);
        const r1 = maskPII("Date: 15.06.1990");
        expect(r1.masked).toBe("Date: [REDACTED-DATE]");
      });
    });

    describe("Edge Cases (empty, null, undefined)", () => {
      it("handles empty string without crashing", () => {
        const r = maskPII("");
        expect(r.masked).toBe("");
        expect(r.piiFound).toBe(false);
        expect(r.redactedCount).toBe(0);
      });

      it("handles null / undefined safely", () => {
        const r1 = maskPII(null as never);
        expect(r1.masked).toBe("");
        expect(r1.piiFound).toBe(false);

        const r2 = maskPII(undefined as never);
        expect(r2.masked).toBe("");
        expect(r2.piiFound).toBe(false);
      });
    });

    describe("Overlapping PII", () => {
      it("masks both email and TC Kimlik in same text", () => {
        const text = "Gönderen: john@example.com TC: 10000000146";
        const r = maskPII(text);
        expect(r.masked).toContain("[REDACTED-EMAIL]");
        expect(r.masked).toContain("[REDACTED-TC]");
        expect(r.masked).not.toContain("john@example.com");
        expect(r.masked).not.toContain("10000000146");
        expect(r.redactedCount).toBe(2);
      });
    });

    describe("Unicode and Turkish character emails", () => {
      it("masks emails with Turkish characters or custom domain structure", () => {
        const r = maskPII("Yaz bana: ihsan.oz@test-domain.tr");
        expect(r.masked).toContain("[REDACTED-EMAIL]");
      });
    });

    describe("Turkish address (address_tr)", () => {
      it("detects full address with street, district, city, postal code", () => {
        expect(hasPII("Ataturk Mahallesi 123 Sokak No 45 Istanbul 34000")).toBe(true);
        expect(detectPIITypes("Ataturk Mahallesi 123 Sokak No 45 Istanbul 34000")).toContain(
          "address_tr",
        );
      });
      it("detects address with postal code", () => {
        expect(hasPII("Cumhuriyet Cad No 15 Ankara 06420")).toBe(true);
      });
      it("masks full address with [REDACTED-ADDRESS]", () => {
        const r = maskPII("Adres: Istiklal Cad No 123 Beyoglu Istanbul 34421");
        expect(r.masked).toContain("[REDACTED-ADDRESS]");
        expect(r.masked).not.toContain("Istiklal");
      });
      it("does not false-positive on short text without numbers", () => {
        expect(hasPII("Cadde sokak mahalle")).toBe(false);
      });
    });

    describe("Sentinel Integration", () => {
      it("detects and redacts credentials like AWS secret key or database URL", () => {
        const r = maskPII("My postgres database URL is postgres://admin:secret@localhost:5432/db");
        expect(r.masked).toContain("[REDACTED-SECRET]");
        expect(r.masked).not.toContain("postgres://admin:secret");
        expect(r.piiFound).toBe(true);
      });

      it("detects and redacts custom token/key patterns", () => {
        const r = maskPII(
          "AWS Key: AKIAIOSFODNN7EXAMPLE and JWT: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNqPZNoaPTR",
        );
        expect(r.masked).toContain("[REDACTED-SECRET]");
        expect(r.masked).not.toContain("AKIAIOSFODNN7EXAMPLE");
        expect(r.masked).not.toContain("eyJhbGciOiJI");
      });
    });
  });

  describe("Content warnings (AI Act Article 5 — NCII/CSAM)", () => {
    it("flags English NCII descriptions", () => {
      expect(
        hasContentWarning("The model produced non-consensual intimate imagery of the user."),
      ).toBe(true);
      expect(
        detectContentWarning("The model produced non-consensual intimate imagery of the user.")
          .warnings,
      ).toContain("non_consensual_intimate_imagery_csam");
    });

    it("flags explicit CSAM terms", () => {
      expect(hasContentWarning("Report describes CSAM distribution")).toBe(true);
      expect(hasContentWarning("child sexual abuse material was generated")).toBe(true);
      expect(hasContentWarning("deepfake porn of a colleague")).toBe(true);
    });

    it("flags Turkish NCII descriptions", () => {
      expect(hasContentWarning("Model rızasız mahrem görüntü üretti.")).toBe(true);
      expect(hasContentWarning("Çocuk istismarı materyali oluşturdu.")).toBe(true);
      expect(hasContentWarning("Çocuk pornografisi paylaşıldı.")).toBe(true);
    });

    it("does not flag benign text", () => {
      expect(hasContentWarning("The AI gave incorrect medical dosage advice.")).toBe(false);
      expect(
        detectContentWarning("Hallucination caused the chatbot to invent a name.").flagged,
      ).toBe(false);
    });

    it("handles empty / null input", () => {
      expect(hasContentWarning("")).toBe(false);
      expect(detectContentWarning(null as never).flagged).toBe(false);
    });

    it("isSensitiveCategory recognises the AI Act Article 5 category", () => {
      expect(isSensitiveCategory("non_consensual_intimate_imagery_csam")).toBe(true);
      expect(isSensitiveCategory("hallucination")).toBe(false);
      expect(isSensitiveCategory("other")).toBe(false);
    });
  });
});
