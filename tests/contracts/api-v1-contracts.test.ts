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
};

describe("API v1 Contract Coverage", () => {
  it("should have a contract schema defined for every API v1 route directory", () => {
    const v1Dir = path.resolve(__dirname, "../../src/app/api/v1");
    const routes = getRoutePaths(v1Dir);

    expect(routes.length).toBeGreaterThan(0);

    for (const route of routes) {
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
});
