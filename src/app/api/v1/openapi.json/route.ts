import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Internal-Client",
  "Access-Control-Max-Age": "86400",
};

const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "ALPAR AI Trust Infrastructure & Accountability Sovereign API",
    version: "1.0.0",
    description:
      "Official REST & Sovereign Bridge API specification for ALPAR AI. Provides actuarial AI incident tracking, Moody's-style AI provider trust ratings, EU AI Act compliance telemetry, cryptographic trust score oracles, and InsurTech underwriting risk feeds.",
    contact: {
      name: "Ercüment Erden (Founder & Chief Architect)",
      url: "https://ercumenterden.com",
      email: "ercument.erden@alparai.com",
    },
    license: {
      name: "AGPL-3.0",
      url: "https://www.gnu.org/licenses/agpl-3.0.html",
    },
  },
  servers: [
    {
      url: "https://alparai.com",
      description: "Production Gateway (Global Edge)",
    },
    {
      url: "http://localhost:3000",
      description: "Local Sovereign Development Gateway",
    },
  ],
  paths: {
    "/api/v1/stats": {
      get: {
        summary: "Global Platform Telemetry & Differential Privacy Stats",
        description:
          "Aggregated platform statistics including total published incidents, registered AI providers, average network trust score, and category distribution with optional Laplace differential privacy noise.",
        operationId: "getV1Stats",
        tags: ["Telemetry"],
        parameters: [
          {
            name: "dp",
            in: "query",
            required: false,
            description: "Apply differential privacy to category distribution counts",
            schema: {
              type: "boolean",
              default: false,
            },
          },
          {
            name: "epsilon",
            in: "query",
            required: false,
            description: "Laplace privacy budget parameter epsilon (0.1 - 5.0)",
            schema: {
              type: "number",
              minimum: 0.1,
              maximum: 5.0,
              default: 1.0,
            },
          },
        ],
        responses: {
          "200": {
            description: "Platform statistics successfully retrieved",
            headers: {
              "X-RateLimit-Limit": { $ref: "#/components/headers/X-RateLimit-Limit" },
              "X-RateLimit-Remaining": { $ref: "#/components/headers/X-RateLimit-Remaining" },
              "X-RateLimit-Reset": { $ref: "#/components/headers/X-RateLimit-Reset" },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatsResponse" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      options: {
        summary: "CORS preflight for stats endpoint",
        operationId: "optionsV1Stats",
        tags: ["Telemetry"],
        responses: {
          "204": { description: "CORS preflight successful" },
        },
      },
    },
    "/api/v1/incidents": {
      get: {
        summary: "List Verified AI Incidents (Public Zero-PII Projection)",
        description:
          "Retrieves verified, published AI incidents sanitized through PII Guardian. Requires a valid API Key.",
        operationId: "getV1Incidents",
        tags: ["Incidents"],
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        responses: {
          "200": {
            description: "List of published incidents",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IncidentsResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/providers": {
      get: {
        summary: "List Evaluated AI Providers with Trust Scores",
        description:
          "Returns all registered AI providers, their verification status, and their computed Moody's-style trust scores.",
        operationId: "getV1Providers",
        tags: ["Trust & Ratings"],
        responses: {
          "200": {
            description: "AI providers list",
            headers: {
              "X-RateLimit-Limit": { $ref: "#/components/headers/X-RateLimit-Limit" },
              "X-RateLimit-Remaining": { $ref: "#/components/headers/X-RateLimit-Remaining" },
              "X-RateLimit-Reset": { $ref: "#/components/headers/X-RateLimit-Reset" },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProvidersResponse" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      options: {
        summary: "CORS preflight for providers endpoint",
        operationId: "optionsV1Providers",
        tags: ["Trust & Ratings"],
        responses: {
          "204": { description: "CORS preflight successful" },
        },
      },
    },
    "/api/v1/leaderboard": {
      get: {
        summary: "Live AI Accountability & Incident Resolution Leaderboard",
        description:
          "Canonical leaderboard ranking AI providers by trust score, incident volume, and response rate under ISO/IEC 27037 standards.",
        operationId: "getV1Leaderboard",
        tags: ["Trust & Ratings"],
        responses: {
          "200": {
            description: "Leaderboard rankings list",
            headers: {
              "X-RateLimit-Limit": { $ref: "#/components/headers/X-RateLimit-Limit" },
              "X-RateLimit-Remaining": { $ref: "#/components/headers/X-RateLimit-Remaining" },
              "X-RateLimit-Reset": { $ref: "#/components/headers/X-RateLimit-Reset" },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LeaderboardResponse" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      options: {
        summary: "CORS preflight for leaderboard endpoint",
        operationId: "optionsV1Leaderboard",
        tags: ["Trust & Ratings"],
        responses: {
          "204": { description: "CORS preflight successful" },
        },
      },
    },
    "/api/v1/oracle/trust-score": {
      get: {
        summary: "Cryptographic Trust Score Oracle for AI Models",
        description:
          "Calculates an actuarial trust score (0-100) and letter grade with SHA-256 cryptographic oracle signature for a given AI model and provider.",
        operationId: "getV1OracleTrustScore",
        tags: ["Oracle"],
        parameters: [
          {
            name: "model_id",
            in: "query",
            required: true,
            description: "Model slug or identifier (e.g. gpt-4o, claude-3-5-sonnet)",
            schema: { type: "string" },
          },
          {
            name: "provider_id",
            in: "query",
            required: false,
            description: "Optional provider slug or identifier",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Cryptographically signed trust score payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TrustScoreOracleResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/insurtech/risk-model": {
      get: {
        summary: "Actuarial Risk & MTBF Feed for InsurTech Underwriting",
        description:
          "Provides actuarial incident distributions, weighted risk indices, and MTBF proxies for AI risk underwriting with metered internal and B2B billing.",
        operationId: "getV1InsurtechRiskModel",
        tags: ["InsurTech"],
        security: [{ ApiKeyAuth: [] }, { InternalClientAuth: [] }],
        parameters: [
          {
            name: "provider_slug",
            in: "query",
            required: false,
            description: "Optional provider slug to filter risk telemetry",
            schema: { type: "string" },
          },
          {
            name: "epsilon",
            in: "query",
            required: false,
            description: "Differential privacy epsilon parameter",
            schema: { type: "number", minimum: 0.1, maximum: 5.0, default: 1.0 },
          },
        ],
        responses: {
          "200": {
            description: "Actuarial risk model data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RiskModelResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/eu-ai-act": {
      get: {
        summary: "EU AI Act Compliance Radar & Risk Tier Catalog",
        description:
          "Live legal telemetry mapping Regulation (EU) 2024/1689 compliance requirements, incident reporting deadlines (Article 73 72-hour window), and Article 50 provenance endpoints.",
        operationId: "getV1EuAiActRadar",
        tags: ["Compliance"],
        responses: {
          "200": {
            description: "EU AI Act framework data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EuAiActResponse" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      options: {
        summary: "CORS preflight for EU AI Act endpoint",
        operationId: "optionsV1EuAiActRadar",
        tags: ["Compliance"],
        responses: {
          "204": { description: "CORS preflight successful" },
        },
      },
    },
    "/api/v1/public/domain-count": {
      get: {
        summary: "Query Domain Incident Count for Browser Extensions",
        description:
          "Public, unauthenticated, rate-limited endpoint returning strictly the incident count for a queried domain. Zero PII returned.",
        operationId: "getV1DomainCount",
        tags: ["Public Utility"],
        parameters: [
          {
            name: "domain",
            in: "query",
            required: true,
            description: "Target domain name (e.g. openai.com, anthropic.com)",
            schema: {
              type: "string",
              minLength: 3,
              maxLength: 253,
            },
          },
        ],
        responses: {
          "200": {
            description: "Domain incident count",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DomainCountResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/health/unified": {
      get: {
        summary: "Unified System Health & Subsystem Probes",
        description:
          "Active end-to-end health check executing real round-trip queries against Database, Auth, Redis, and AI Gateways. Returns 200 when healthy, 503 when degraded or down.",
        operationId: "getUnifiedHealth",
        tags: ["Health & Operations"],
        responses: {
          "200": {
            description: "System is operational and healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UnifiedHealthResponse" },
              },
            },
          },
          "503": {
            description: "One or more critical subsystems are degraded or down",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UnifiedHealthResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "ALPAR AI Enterprise API Key (`alp_live_*`) for programmatic access.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase / DeHost bearer authorization token.",
      },
      InternalClientAuth: {
        type: "apiKey",
        in: "header",
        name: "x-internal-client",
        description: "Sovereign bridge token for ErcuOS / microservice mesh inter-communication.",
      },
    },
    headers: {
      "X-RateLimit-Limit": {
        description: "The maximum number of requests allowed in the current rate limit window.",
        schema: { type: "integer", example: 100 },
      },
      "X-RateLimit-Remaining": {
        description: "The number of remaining requests allowed in the current rate limit window.",
        schema: { type: "integer", example: 87 },
      },
      "X-RateLimit-Reset": {
        description: "Seconds until the rate limit window resets.",
        schema: { type: "integer", example: 60 },
      },
      "Retry-After": {
        description: "Number of seconds to back off before retrying when rate-limited.",
        schema: { type: "integer", example: 60 },
      },
    },
    responses: {
      BadRequest: {
        description: "Invalid request parameters or payload",
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
      Unauthorized: {
        description: "Missing, malformed, or invalid credentials",
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
      RateLimited: {
        description: "Rate limit or internal quota exceeded",
        headers: {
          "Retry-After": { $ref: "#/components/headers/Retry-After" },
          "X-RateLimit-Limit": { $ref: "#/components/headers/X-RateLimit-Limit" },
          "X-RateLimit-Remaining": { $ref: "#/components/headers/X-RateLimit-Remaining" },
          "X-RateLimit-Reset": { $ref: "#/components/headers/X-RateLimit-Reset" },
        },
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
      InternalError: {
        description: "Internal server processing failure",
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
          "application/json": {
            schema: { $ref: "#/components/schemas/ProblemDetails" },
          },
        },
      },
    },
    schemas: {
      ProblemDetails: {
        type: "object",
        properties: {
          error: { type: "string", description: "Human-readable error description" },
          code: { type: "string", description: "Machine-readable status code" },
          status: { type: "integer", description: "HTTP status code" },
          timestamp: { type: "string", format: "date-time" },
          retryAfter: { type: "integer", description: "Seconds before retry" },
          details: { type: "object", additionalProperties: true },
        },
        required: ["error", "code", "status", "timestamp"],
      },
      StatsResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              total_incidents: { type: "integer", example: 3115 },
              total_providers: { type: "integer", example: 42 },
              average_trust_score: { type: "number", example: 78.45 },
              by_category: {
                type: "object",
                additionalProperties: { type: "number" },
                example: { hallucination: 1204, bias: 412, security: 890 },
              },
            },
            required: [
              "total_incidents",
              "total_providers",
              "average_trust_score",
              "by_category",
            ],
          },
          meta: {
            type: "object",
            properties: {
              generated_at: { type: "string", format: "date-time" },
              differential_privacy: {
                type: "object",
                properties: {
                  enabled: { type: "boolean" },
                  epsilon: { type: "number" },
                  mechanism: { type: "string", example: "laplace" },
                },
                required: ["enabled"],
              },
            },
            required: ["generated_at", "differential_privacy"],
          },
        },
        required: ["data", "meta"],
      },
      Incident: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", example: "published" },
          incident_date: { type: "string", format: "date-time", nullable: true },
          views_count: { type: "integer", nullable: true },
          upvotes_count: { type: "integer", nullable: true },
          cross_audit_truth_score: { type: "number", nullable: true },
          cross_audit_confidence: { type: "number", nullable: true },
          ai_provider_id: { type: "string", format: "uuid", nullable: true },
          ai_model_id: { type: "string", format: "uuid", nullable: true },
          is_expert: { type: "boolean", nullable: true },
          expert_fix: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          published_at: { type: "string", format: "date-time", nullable: true },
          source_url: { type: "string", nullable: true },
        },
        required: ["id", "title", "description", "category", "severity", "status", "created_at"],
      },
      IncidentsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Incident" },
          },
          count: { type: "integer", example: 100 },
        },
        required: ["data", "count"],
      },
      Provider: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true },
          website_url: { type: "string", nullable: true },
          logo_url: { type: "string", nullable: true },
          is_verified: { type: "boolean" },
          trust_score: { type: "number", nullable: true },
        },
        required: ["id", "name", "slug", "is_verified"],
      },
      ProvidersResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Provider" },
          },
          meta: {
            type: "object",
            properties: {
              count: { type: "integer" },
              generated_at: { type: "string", format: "date-time" },
            },
            required: ["count", "generated_at"],
          },
        },
        required: ["data", "meta"],
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          rank: { type: "integer", example: 1 },
          id: { type: "string" },
          slug: { type: "string" },
          name: { type: "string" },
          logo_url: { type: "string", nullable: true },
          is_verified: { type: "boolean" },
          website_url: { type: "string", nullable: true },
          trust_score: { type: "number", example: 94.2 },
          incident_count: { type: "integer", example: 12 },
          response_count: { type: "integer", example: 11 },
          response_rate: { type: "number", nullable: true, example: 92 },
        },
        required: [
          "rank",
          "id",
          "slug",
          "name",
          "is_verified",
          "trust_score",
          "incident_count",
          "response_count",
        ],
      },
      LeaderboardResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/LeaderboardEntry" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              generated_at: { type: "string", format: "date-time" },
              docs: { type: "string", example: "https://alparai.com/api-docs" },
            },
            required: ["total", "generated_at", "docs"],
          },
        },
        required: ["data", "meta"],
      },
      TrustScoreOracleResponse: {
        type: "object",
        properties: {
          model_id: { type: "string", example: "gpt-4o" },
          provider: { type: "string", example: "openai" },
          trust_score: { type: "number", example: 89.4 },
          grade: { type: "string", example: "A" },
          verified_incidents_count: { type: "integer", example: 8 },
          hallucination_rate_pct: { type: "number", example: 1.4 },
          bias_index: { type: "number", example: 0.051 },
          compliance_status: {
            type: "object",
            properties: {
              eu_ai_act: { type: "string", enum: ["compliant", "review_required"] },
              kvkk_gdpr: { type: "string", enum: ["compliant", "non_compliant"] },
              oecd_principles: { type: "string", example: "aligned" },
            },
            required: ["eu_ai_act", "kvkk_gdpr", "oecd_principles"],
          },
          last_updated: { type: "string", format: "date-time" },
          oracle_signature: {
            type: "string",
            example: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
        },
        required: [
          "model_id",
          "provider",
          "trust_score",
          "grade",
          "verified_incidents_count",
          "hallucination_rate_pct",
          "bias_index",
          "compliance_status",
          "last_updated",
          "oracle_signature",
        ],
      },
      RiskModelResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              sample_size: { type: "integer", example: 1000 },
              by_severity: {
                type: "object",
                additionalProperties: { type: "number" },
                example: { critical: 24, high: 98, medium: 310, low: 568 },
              },
              risk_index: { type: "number", example: 34 },
              provider_slug: { type: "string", nullable: true, example: "anthropic" },
            },
            required: ["sample_size", "by_severity", "risk_index"],
          },
          meta: {
            type: "object",
            properties: {
              generated_at: { type: "string", format: "date-time" },
              differential_privacy: {
                type: "object",
                properties: {
                  enabled: { type: "boolean" },
                  epsilon: { type: "number" },
                },
                required: ["enabled", "epsilon"],
              },
              billing: {
                type: "object",
                properties: {
                  metered: { type: "boolean" },
                  unit: { type: "string", example: "query" },
                  internal_client: { type: "string", nullable: true },
                },
                required: ["metered", "unit"],
              },
            },
            required: ["generated_at", "differential_privacy", "billing"],
          },
        },
        required: ["data", "meta"],
      },
      EuAiActRiskTier: {
        type: "object",
        properties: {
          tier: { type: "string", example: "High-Risk AI Systems" },
          articles: {
            type: "array",
            items: { type: "string" },
            example: ["Article 6", "Article 72", "Article 73"],
          },
          description: { type: "string" },
          status: { type: "string", nullable: true },
          incidentReportingDeadlineHours: { type: "integer", nullable: true, example: 72 },
          passportExportEndpoint: { type: "string", nullable: true },
          provenanceEndpoint: { type: "string", nullable: true },
        },
        required: ["tier", "description"],
      },
      EuAiActResponse: {
        type: "object",
        properties: {
          framework: { type: "string", example: "EU AI Act (Regulation EU 2024/1689)" },
          version: { type: "string", example: "2024.1" },
          riskTiers: {
            type: "array",
            items: { $ref: "#/components/schemas/EuAiActRiskTier" },
          },
          documentationUrl: { type: "string" },
          supportEmail: { type: "string", format: "email" },
        },
        required: ["framework", "version", "riskTiers", "documentationUrl", "supportEmail"],
      },
      DomainCountResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              domain: { type: "string", example: "openai.com" },
              count: { type: "integer", example: 142 },
            },
            required: ["domain", "count"],
          },
          meta: {
            type: "object",
            properties: {
              generated_at: { type: "string", format: "date-time" },
            },
            required: ["generated_at"],
          },
        },
        required: ["data", "meta"],
      },
      SubsystemStatus: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: [
              "db",
              "api",
              "auth",
              "email",
              "cdn",
              "redis",
              "storage",
              "ai_gateway",
              "cron",
            ],
          },
          status: { type: "string", enum: ["healthy", "degraded", "down"] },
          latencyMs: { type: "number", example: 14 },
          message: { type: "string", nullable: true },
        },
        required: ["name", "status", "latencyMs"],
      },
      UnifiedHealthResponse: {
        type: "object",
        properties: {
          overall: { type: "string", enum: ["healthy", "degraded", "down"] },
          timestamp: { type: "string", format: "date-time" },
          subsystems: {
            type: "array",
            items: { $ref: "#/components/schemas/SubsystemStatus" },
          },
        },
        required: ["overall", "timestamp", "subsystems"],
      },
    },
  },
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
