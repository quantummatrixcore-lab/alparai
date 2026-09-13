import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only before route import
vi.mock("server-only", () => ({}));

// Mock rate-limit
vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true, retryAfter: 0 }),
  RATE_LIMIT_KEYS: {
    api_general: "rl:api_general",
  },
}));

// Mock DeHost server client
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(
    new Map([["x-forwarded-for", "127.0.0.1"]])
  ),
}));

import { GET, POST } from "../../src/app/api/v1/compliance/verify/route";

describe("EU AI Act B2B Automated Verification API (/api/v1/compliance/verify)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns framework overview, legal citations, and sample request", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.service).toContain("ALPAR AI");
    expect(json.regulation).toContain("2024/1689");
    expect(json.supported_frameworks).toBeDefined();
    expect(json.sample_request).toBeDefined();
  });

  it("POST flags Article 5 Prohibited AI practices with 403 and zero score", async () => {
    const payload = {
      model_name: "ShadowScore-DeepAI",
      provider_name: "OmniCorp Ltd",
      system_category: "essential_services",
      intended_use: "Evaluating social trust scores to restrict public transit access",
      prohibited_signals: ["social_scoring", "subliminal_manipulation"],
      safety_measures: {},
    };

    const request = new Request("http://localhost/api/v1/compliance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.data.verdict).toBe("UNACCEPTABLE_RISK_PROHIBITED");
    expect(json.data.compliance_score).toBe(0);
    expect(json.data.is_deployable_in_eu).toBe(false);
    expect(json.data.violations).toHaveLength(2);
    expect(json.data.violations[0]).toContain("Article 5");
  });

  it("POST approves fully compliant High-Risk AI system with cryptographic seal", async () => {
    const payload = {
      model_name: "MediScan-Diagnostic-v4",
      provider_name: "Apex Health AI AG",
      system_category: "essential_services",
      intended_use: "Assisting physicians in emergency triage prioritization",
      prohibited_signals: [],
      safety_measures: {
        human_oversight_enabled: true,
        risk_management_system: true,
        data_governance_bias_audited: true,
        technical_documentation: true,
        automated_record_logging: true,
        user_transparency_notices: true,
        cybersecurity_accuracy_robustness: true,
        c2pa_watermark_provenance: false,
      },
    };

    const request = new Request("http://localhost/api/v1/compliance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data.verdict).toBe("FULLY_COMPLIANT");
    expect(json.data.compliance_score).toBe(100);
    expect(json.data.is_deployable_in_eu).toBe(true);
    expect(json.data.remediations).toHaveLength(0);
    expect(json.data.certificate.certificate_id).toHaveLength(64);
    expect(json.data.certificate.audit_seal).toContain("ALPAR_SEAL_v2.5_");
  });

  it("POST identifies missing Article 9-15 controls on High-Risk systems and outputs concrete remediations", async () => {
    const payload = {
      model_name: "HireFast-Screener-v1",
      provider_name: "HR Talent Dynamics",
      system_category: "employment_hr", // Annex III High-Risk
      intended_use: "Automated CV filtering and candidate ranking for employment",
      prohibited_signals: [],
      safety_measures: {
        human_oversight_enabled: false, // Missing Art. 14
        risk_management_system: false, // Missing Art. 9
        data_governance_bias_audited: false, // Missing Art. 10
        technical_documentation: true,
        automated_record_logging: false, // Missing Art. 12
        user_transparency_notices: true,
        cybersecurity_accuracy_robustness: true,
        c2pa_watermark_provenance: false,
      },
    };

    const request = new Request("http://localhost/api/v1/compliance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data.verdict).toBe("NON_COMPLIANT_HIGH_RISK");
    expect(json.data.is_deployable_in_eu).toBe(false);
    expect(json.data.compliance_score).toBeLessThan(70);
    expect(json.data.remediations.length).toBeGreaterThanOrEqual(4);

    const articles = json.data.remediations.map((r: { article: string }) => r.article);
    expect(articles).toContain("Article 9");
    expect(articles).toContain("Article 10");
    expect(articles).toContain("Article 12");
    expect(articles).toContain("Article 14");
  });

  it("POST enforces Article 50 transparency on generative AI systems", async () => {
    const payload = {
      model_name: "PixelDream-Video-Gen",
      provider_name: "SynthVision Studio",
      system_category: "generative_synthetic",
      intended_use: "Generating hyper-realistic video avatars",
      prohibited_signals: [],
      safety_measures: {
        user_transparency_notices: false,
        c2pa_watermark_provenance: false,
      },
    };

    const request = new Request("http://localhost/api/v1/compliance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.data.compliance_score).toBe(40);
    expect(json.data.remediations).toHaveLength(2);

    const articles = json.data.remediations.map((r: { article: string }) => r.article);
    expect(articles).toContain("Article 50(1)");
    expect(articles).toContain("Article 50(2)");
  });

  it("POST rejects invalid payloads with 400 Bad Request", async () => {
    const request = new Request("http://localhost/api/v1/compliance/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: "", // Invalid empty name
        system_category: "invalid_category",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("invalid_payload");
  });
});