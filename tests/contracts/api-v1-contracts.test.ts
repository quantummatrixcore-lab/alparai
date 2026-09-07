/* eslint-disable @typescript-eslint/consistent-type-imports */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { z } from "zod";
import * as schemas from "../../src/contracts/api";

// 1. Helper to find all API v1 route files recursively
function getRoutePaths(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results.push(...getRoutePaths(filePath, baseDir));
    } else if (file === "route.ts") {
      const relative = path.relative(baseDir, dir).replace(/\\/g, "/");
      results.push(relative);
    }
  }
  return results;
}

// Map of route paths to Zod schemas
const routeSchemaMap: Record<string, z.ZodTypeAny> = {
  auditor: schemas.auditorRootResponseSchema,
  "auditor/audit-logs": schemas.auditorAuditLogsResponseSchema,
  "auditor/k-benchmark": schemas.auditorBenchmarkResponseSchema,
  "auditor/methodology": schemas.auditorMethodologyResponseSchema,
  "dsar/download": schemas.dsarDownloadResponseSchema,
  "dsar/export": schemas.dsarExportResponseSchema,
  "dsar/portable": schemas.dsarPortableResponseSchema,
  extract: schemas.extractResponseSchema,
  incidents: schemas.incidentsResponseSchema,
  "incidents/export": schemas.incidentsExportResponseSchema,
  "incidents/voice": schemas.voiceIncidentResponseSchema,
  "incidents/[id]": schemas.incidentDetailResponseSchema,
  leaderboard: schemas.leaderboardResponseSchema,
  "oecd/feed": schemas.oecdFeedResponseSchema,
  providers: schemas.providersResponseSchema,
  "ratings/[modelSlug]": schemas.ratingsResponseSchema,
  "risk/audit": schemas.riskAuditResponseSchema,
  stats: schemas.statsResponseSchema,
  regulators: schemas.regulatorsResponseSchema,
  slopsquatting: schemas.slopsquattingResponseSchema,
  playbooks: schemas.playbooksResponseSchema,
  jailbreaks: schemas.jailbreaksResponseSchema,
  provenance: schemas.provenanceResponseSchema,
  "trust-ranking": schemas.trustRankingResponseSchema,
  "bench-tr": schemas.benchTrResponseSchema,
  whistleblower: schemas.whistleblowerResponseSchema,
  "litigation/export": schemas.litigationExportResponseSchema,
  "compliance/article50": schemas.article50ResponseSchema,
  "k-benchmark": schemas.auditorBenchmarkResponseSchema,
  "personas/[twinId]/completions": schemas.personasCompletionsResponseSchema,
  "eu-ai-act": schemas.euAiActResponseSchema,
  "agora-t/cases": schemas.agoraTCasesResponseSchema,
  "agora-t/cases/[id]": schemas.agoraTCaseDetailResponseSchema,
  "agora-t/cases/[id]/resolve": schemas.agoraTResolveResponseSchema,
  "agora-t/cases/[id]/vote": schemas.agoraTVoteResponseSchema,
  "agora-t/jurors": schemas.agoraTJurorsResponseSchema,
  "anti-sybil/check": schemas.antiSybilCheckResponseSchema,
  "anti-sybil/reputation/[userId]": schemas.antiSybilReputationUserResponseSchema,
  "anti-sybil/reputation/adjust": schemas.antiSybilReputationAdjustResponseSchema,
  "jury/vote": schemas.juryVoteResponseSchema,
  "rap-sheet": schemas.rapSheetResponseSchema,
  "rap-sheet/[id]": schemas.rapSheetDetailResponseSchema,
  "rap-sheet/export": schemas.rapSheetExportResponseSchema,
  "compliance/verify": schemas.complianceVerifyResponseSchema,
  "oracle/trust-score": schemas.trustScoreOracleResponseSchema,
};

describe("API v1 Contract Coverage", () => {
  it("should have a contract schema defined for every API v1 route directory", () => {
    const v1Dir = path.resolve(__dirname, "../../src/app/api/v1");
    const routes = getRoutePaths(v1Dir);

    expect(routes.length).toBeGreaterThan(0);

    for (const route of routes) {
      if (route === "webhooks" || route.startsWith("webhooks/")) continue;
      const hasSchema = route in routeSchemaMap;
      expect(
        hasSchema,
        `CI Contract Missing: The API v1 route directory "${route}" does not have a registered Zod contract schema in "tests/contracts/api-v1-contracts.test.ts" / "src/contracts/api.ts". Please define the response schema and register it.`,
      ).toBe(true);
    }
  });
});

describe("API v1 Contract Schema Validators", () => {
  it("should validate a valid extract response", () => {
    const data: z.infer<typeof schemas.extractResponseSchema> = {
      url: "https://chatgpt.com/share/example",
      providerId: "provider-openai",
      providerName: "ChatGPT",
      title: "Sample Conversation",
      description: "Automatically imported evidence from ChatGPT",
      extractedAt: new Date().toISOString(),
    };
    const result = schemas.extractResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid incidents response", () => {
    const data: z.infer<typeof schemas.incidentsResponseSchema> = {
      data: [
        {
          id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          title: "Hallucination Example",
          description: "Model hallucinated incorrect coordinates.",
          severity: "low",
          category: "hallucination",
          eu_act_risk_category: "limited",
          eu_act_serious_incident_class: null,
          eu_act_high_risk_system_category: null,
          eu_act_reporting_deadline_days: null,
          is_anonymous: false,
          incident_date: "2026-07-12",
          views: 12,
          upvotes: 4,
          provider: {
            name: "OpenAI",
            slug: "openai",
          },
          model: "GPT-4",
          truth_score: 0.9,
          confidence: 0.95,
          verification_level: "community",
          expert_fix: null,
          created_at: "2026-07-12T12:00:00Z",
        },
      ],
      meta: {
        count: 1,
        limit: 20,
        tier: "free",
        generated_at: new Date().toISOString(),
      },
    };
    const result = schemas.incidentsResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid incident detail response", () => {
    const data: z.infer<typeof schemas.incidentDetailResponseSchema> = {
      data: {
        id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
        title: "Bias Example",
        description: "Discriminatory output detected in resume parsing.",
        severity: "high",
        category: "bias",
        is_anonymous: true,
        incident_date: "2026-07-10",
        views: 154,
        upvotes: 23,
        model: "Claude 3 Opus",
        truth_score: 0.85,
        confidence: 0.9,
        verification_level: "expert",
        expert_fix: "Corrected training biases.",
        created_at: "2026-07-10T09:30:00Z",
      },
    };
    const result = schemas.incidentDetailResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid leaderboard response", () => {
    const data: z.infer<typeof schemas.leaderboardResponseSchema> = {
      data: [
        {
          rank: 1,
          id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          slug: "google",
          name: "Google DeepMind",
          logo_url: null,
          is_verified: true,
          website_url: "https://deepmind.google",
          trust_score: 95.5,
          incident_count: 2,
          response_count: 2,
          response_rate: 100,
        },
      ],
      meta: {
        count: 1,
        generated_at: new Date().toISOString(),
      },
    };
    const result = schemas.leaderboardResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid ratings response", () => {
    const data: z.infer<typeof schemas.ratingsResponseSchema> = {
      model_id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
      model_name: "Gemini 1.5 Flash",
      status: "active",
      composite_score: 88,
      ratings: [
        {
          category_id: "a7c6cf08-9d39-4798-b75b-f0602d4cefe1",
          category_name: "Truthfulness",
          score: 91,
          wilson_interval: {
            lower: 0.85,
            upper: 0.94,
          },
          sample_size: 400,
          last_audited_at: "2026-07-12T12:00:00Z",
        },
      ],
    };
    const result = schemas.ratingsResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid OECD feed response", () => {
    const data: z.infer<typeof schemas.oecdFeedResponseSchema> = {
      feed_format: "ALPAR-OECD-v1",
      generated_at: new Date().toISOString(),
      count: 1,
      incidents: [
        {
          incident_id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          title: "Privacy Leak",
          description: "Leaked PII in public chatbot logs.",
          severity: "critical",
          category: "privacy",
          location_country: "Turkey",
          incident_date: "2026-07-11",
          created_at: "2026-07-11T14:20:00Z",
          oecd_classification: {
            people_planet: "Impact on Security & Privacy",
            business_model: "OpenAI - IT & Cyber Security",
            ai_system: "Generative AI System / Large Language Model",
            data_input: "Personal Identifiable Information (PII)",
            action_output: "High-severity incorrect output / System failure",
          },
        },
      ],
    };
    const result = schemas.oecdFeedResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid providers response", () => {
    const data: z.infer<typeof schemas.providersResponseSchema> = {
      data: [
        {
          id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          name: "Anthropic",
          slug: "anthropic",
          description: "AI safety and research company.",
          website_url: "https://anthropic.com",
          logo_url: null,
          is_verified: true,
          trust_score: 92.0,
        },
      ],
      meta: {
        count: 1,
        generated_at: new Date().toISOString(),
      },
    };
    const result = schemas.providersResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid stats response", () => {
    const data: z.infer<typeof schemas.statsResponseSchema> = {
      data: {
        total_incidents: 45,
        total_providers: 8,
        average_trust_score: 87.4,
        by_category: {
          hallucination: 12,
          bias: 8,
          privacy: 15,
          security: 10,
        },
      },
      meta: {
        generated_at: new Date().toISOString(),
      },
    };
    const result = schemas.statsResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid risk audit response", () => {
    const data: z.infer<typeof schemas.riskAuditResponseSchema> = {
      eu_act_risk_category: "high",
      eu_act_serious_incident_class: "Annex III.1",
      risk_score: 0.82,
      reasoning: "Critical safety risk identified",
    };
    const result = schemas.riskAuditResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid auditor root response", () => {
    const data: z.infer<typeof schemas.auditorRootResponseSchema> = {
      service: "alpar-auditor-service",
      version: "1.0.0",
      status: "healthy",
      grid: {
        active_engines: 41,
        fast_route_cache: true,
        zero_latency: true,
      },
      stats: {
        total_incidents: 2908,
        k_benchmark_evaluations: 150,
        monitored_models: 25,
      },
      endpoints: {
        audit_logs: "/api/v1/auditor/audit-logs",
        k_benchmark: "/api/v1/auditor/k-benchmark",
        methodology: "/api/v1/auditor/methodology",
      },
      timestamp: new Date().toISOString(),
    };
    const result = schemas.auditorRootResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid EU AI Act response", () => {
    const data: z.infer<typeof schemas.euAiActResponseSchema> = {
      framework: "EU AI Act Regulation (EU) 2024/1689",
      version: "2024.1",
      riskTiers: [
        {
          tier: "Unacceptable Risk",
          articles: ["Article 5"],
          description: "Prohibited AI practices",
          status: "Enforced",
        },
      ],
      documentationUrl: "https://alpar.ai/docs/eu-ai-act",
      supportEmail: "compliance@alpar.ai",
    };
    const result = schemas.euAiActResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid whistleblower receipt response", () => {
    const data: z.infer<typeof schemas.whistleblowerResponseSchema> = {
      message: "Whistleblower report secured with zero-knowledge encryption.",
      receipt: {
        submission_id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
        receipt_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        submitted_at: new Date().toISOString(),
        anonymity_status: "cryptographically_isolated",
      },
    };
    const result = schemas.whistleblowerResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid provenance response", () => {
    const data: z.infer<typeof schemas.provenanceResponseSchema> = {
      provenance: {
        c2pa_detected: true,
        c2pa_manifest_url: "https://manifest.c2pa.org/v1/sample",
        synthid_detected: false,
        media_hash: "sha256:abcd1234efgh5678",
        verification_status: "verified_authentic",
        verified_at: new Date().toISOString(),
        alpar_provenance_seal: "ALPAR-SEAL-2026-OK",
      },
    };
    const result = schemas.provenanceResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid slopsquatting response", () => {
    const data: z.infer<typeof schemas.slopsquattingResponseSchema> = {
      count: 1,
      reports: [
        {
          id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          package_name: "colors-ai-extended",
          ecosystem: "npm",
          first_seen_at: "2026-07-01T00:00:00Z",
          confirmed_real: false,
          source_url: null,
          hallucinated_by_model_id: "gpt-4o",
        },
      ],
      _meta: {
        ecosystem: "npm",
        limit: 10,
      },
    };
    const result = schemas.slopsquattingResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a valid playbooks response", () => {
    const data: z.infer<typeof schemas.playbooksResponseSchema> = {
      count: 1,
      playbooks: [
        {
          id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
          sector: "finance",
          title: "Algorithmic Trading Compliance Playbook",
          framework: "EU AI Act & MiFID II",
          summary: "Checklist for algorithmic model risk management.",
          checklist: { steps: ["Pre-trade checks", "Stress testing"] },
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-07-01T00:00:00Z",
        },
      ],
      _meta: {
        sector: "finance",
        limit: 10,
      },
    };
    const result = schemas.playbooksResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
