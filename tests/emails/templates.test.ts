import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getWhistleblowerConfirmationEmail,
  getAdminNotificationEmail,
  getProviderAlertEmail,
  getProviderResponseNotificationEmail,
} from "@/emails/templates";

describe("Email Templates", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getWhistleblowerConfirmationEmail", () => {
    const defaultParams = {
      title: "Test Incident Title",
      category: "bias",
      severity: "high",
      date: "2026-06-24",
      locale: "en" as const,
    };

    it("should generate English email template with correct values", () => {
      const html = getWhistleblowerConfirmationEmail(defaultParams);

      expect(html).toContain("Incident Report Received — ALPAR AI");
      expect(html).toContain("Hello Whistleblower,");
      expect(html).toContain("Test Incident Title");
      expect(html).toContain("bias");
      expect(html).toContain("high");
      expect(html).toContain("2026-06-24");
      expect(html).toContain("This is an automated email.");
      expect(html).toContain("color: #f97316"); // high severity color
    });

    it("should generate Turkish email template with correct values", () => {
      const html = getWhistleblowerConfirmationEmail({
        ...defaultParams,
        locale: "tr",
      });

      expect(html).toContain("Olay Raporunuz Alındı — ALPAR AI");
      expect(html).toContain("Merhaba Whistleblower,");
      expect(html).toContain("Test Incident Title");
      expect(html).toContain("bias");
      expect(html).toContain("high");
      expect(html).toContain("2026-06-24");
      expect(html).toContain("Bu e-posta otomatik olarak gönderilmiştir.");
    });

    it("should apply correct severity colors for critical severity", () => {
      const html = getWhistleblowerConfirmationEmail({
        ...defaultParams,
        severity: "critical",
      });
      expect(html).toContain("color: #ef4444");
    });

    it("should apply correct severity colors for medium severity", () => {
      const html = getWhistleblowerConfirmationEmail({
        ...defaultParams,
        severity: "medium",
      });
      expect(html).toContain("color: #eab308");
    });

    it("should apply correct severity colors for low/other severity", () => {
      const html = getWhistleblowerConfirmationEmail({
        ...defaultParams,
        severity: "low",
      });
      expect(html).toContain("color: #3b82f6");
    });
  });

  describe("getAdminNotificationEmail", () => {
    const adminParams = {
      id: "inc-12345",
      title: "Critical Model Failure",
      category: "security",
      severity: "critical",
    };

    it("should generate admin notification template with correct values", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://custom-app.com";
      const html = getAdminNotificationEmail(adminParams);

      expect(html).toContain("ALERT: NEW INCIDENT SUBMITTED");
      expect(html).toContain("Critical Model Failure");
      expect(html).toContain("inc-12345");
      expect(html).toContain("security");
      expect(html).toContain("critical");
      expect(html).toContain("color: #ef4444"); // critical severity color
      expect(html).toContain("https://custom-app.com/admin/incidents");
    });

    it("should fallback to default app URL if env is missing", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const html = getAdminNotificationEmail(adminParams);

      expect(html).toContain("https://alparai.com/admin/incidents");
    });

    it("should apply correct severity colors for high severity in admin email", () => {
      const html = getAdminNotificationEmail({
        ...adminParams,
        severity: "high",
      });
      expect(html).toContain("color: #f97316");
    });

    it("should apply correct severity colors for medium severity in admin email", () => {
      const html = getAdminNotificationEmail({
        ...adminParams,
        severity: "medium",
      });
      expect(html).toContain("color: #eab308");
    });

    it("should apply correct severity colors for low severity in admin email", () => {
      const html = getAdminNotificationEmail({
        ...adminParams,
        severity: "low",
      });
      expect(html).toContain("color: #3b82f6");
    });
  });

  describe("getProviderAlertEmail", () => {
    const providerParams = {
      providerName: "OpenAI",
      incidentId: "inc-98765",
      title: "Data Leak via ChatGPT Plus",
      category: "privacy" as const,
      severity: "high" as const,
      token: "mock-token-12345-67890",
      locale: "en" as const,
    };

    it("should generate English provider alert template with correct values", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://custom-app.com";
      const html = getProviderAlertEmail(providerParams);

      expect(html).toContain("ALPAR AI PROVIDER ALERT");
      expect(html).toContain("Dear OpenAI Team,");
      expect(html).toContain("Data Leak via ChatGPT Plus");
      expect(html).toContain("privacy");
      expect(html).toContain("high");
      expect(html).toContain(
        "https://custom-app.com/incidents/inc-98765/respond?token=mock-token-12345-67890",
      );
      expect(html).toContain("color: #f97316"); // high severity color
    });

    it("should generate Turkish provider alert template with correct values", () => {
      const html = getProviderAlertEmail({
        ...providerParams,
        locale: "tr",
      });

      expect(html).toContain("Sayın OpenAI Yetkilisi,");
      expect(html).toContain("Yapay Zekanız İçin Yeni Olay Raporu");
      expect(html).toContain("Resmi Yanıt Yayınla");
    });
  });

  describe("getProviderResponseNotificationEmail", () => {
    const params = {
      title: "Model hallucinated fake legal advice",
      providerName: "Anthropic",
      actionUrl: "https://alparai.com/en/incidents/inc-123",
      locale: "en",
      unsubscribeUrl:
        "https://alparai.com/en/unsubscribe?userId=usr-123&token=tok-123&type=reporter_notifications",
    };

    it("should generate English template correctly", () => {
      const html = getProviderResponseNotificationEmail(params);

      expect(html).toContain("[ALPAR AI] Official Response Received: Anthropic");
      expect(html).toContain("Hello Reporter,");
      expect(html).toContain("An official response has been received from Anthropic");
      expect(html).toContain("Model hallucinated fake legal advice");
      expect(html).toContain("https://alparai.com/en/incidents/inc-123");
      expect(html).toContain(
        "https://alparai.com/en/unsubscribe?userId=usr-123&token=tok-123&type=reporter_notifications",
      );
      expect(html).toContain("Unsubscribe");
    });

    it("should generate Turkish template correctly", () => {
      const html = getProviderResponseNotificationEmail({
        ...params,
        locale: "tr",
      });

      expect(html).toContain("[ALPAR AI] Resmi Yanıt Alındı: Anthropic");
      expect(html).toContain("Merhaba Muhabir,");
      expect(html).toContain("Anthropic firmasından resmi bir açıklama geldi");
      expect(html).toContain("Abonelikten Çık");
    });
  });
});
