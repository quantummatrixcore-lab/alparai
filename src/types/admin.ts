/**
 * Alparai 360° Master Executive Operating System - Type Definitions
 * src/types/admin-v2.ts
 *
 * Strict TypeScript interfaces for all 5 clusters:
 * 1. Accountability & Legal Defense (Incidents, Cross-Audit, EU AI Act, Streisand, Bounties)
 * 2. Growth & Communications (Social, Mail, SEO)
 * 3. Capital & Financials (Investors, Grants, Finance)
 * 4. Ecosystem & Technology (B2B API, Data Moat, AI Signals)
 * 5. Academy & Governance (University Review, PII Vault, Settings)
 */

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export type IngestionSource =
  "PUBLIC_CRAWL" | "HUMAN_WHISTLEBLOWER" | "ACADEMIC_PAPER" | "REGULATORY_FILING" | "GITHUB_CVE";

export type IncidentStatus = "UNDER_TRIAGE" | "VERIFIED" | "DISPUTED" | "RESOLVED" | "ARCHIVED";

export type EUAIActCategory =
  "PROHIBITED_ART5" | "HIGH_RISK_ART6" | "GPAI_SYSTEMIC_ART51" | "TRANSPARENCY_ART50" | "COMPLIANT";

export interface IncidentRecord {
  id: string;
  trackingNumber: string; // e.g. ALP-2026-2908
  title: string;
  modelTarget: string; // e.g. "OpenAI GPT-4o", "Anthropic Claude 3.5 Sonnet", "Google Gemini 1.5 Pro"
  provider: string; // "OpenAI", "Anthropic", "Google", "Meta", "DeepSeek"
  severity: SeverityLevel;
  status: IncidentStatus;
  source: IngestionSource;
  euAiActTag: EUAIActCategory;
  potentialFineEur: number; // e.g. 35000000
  slaRemainingHours: number; // e.g. 18.5 (under 72h window)
  evidenceHash: string; // SHA-256
  createdAt: string;
  humanVerified: boolean;
  affectedIndustry: string;
  summary: string;
}

export interface CrossAuditModelResult {
  modelName: string;
  verdict: "VIOLATION" | "SUSPICIOUS" | "CLEAN";
  confidence: number; // 0 to 100
  reasoning: string;
  latencyMs: number;
}

export interface CrossAuditCase {
  id: string;
  incidentId: string;
  consensusScore: number; // 0 to 100
  quorumReached: boolean;
  modelVotes: CrossAuditModelResult[];
  timestamp: string;
}

export interface EUAIActComplianceSummary {
  totalMonitoredSystems: number;
  criticalSLACountdowns: number; // Incidents with < 24h left in Art 73 SLA
  maxPotentialExposureEur: number; // Sum of fine exposures
  prohibitedPracticesDetected: number;
  highRiskSystemsCompliantRatio: number; // e.g. 0.94
}

export interface B2BEnterpriseApiKey {
  id: string;
  organizationName: string;
  clientTier: "TIER_1_GROWTH" | "TIER_2_ENTERPRISE" | "TIER_3_INSTITUTIONAL";
  monthlyRateUsd: number;
  keyPrefix: string; // e.g. "alp_live_9f8..."
  requestQuotaMonthly: number;
  requestsThisMonth: number;
  activeStatus: "ACTIVE" | "SUSPENDED" | "RATE_LIMITED";
  feedEndpoints: string[];
  lastUsedAt: string;
  createdDate: string;
}

export interface DataMoatTelemetry {
  totalIndexedIncidents: number;
  publicScrapedCount: number;
  humanWhistleblowerCount: number;
  dailyIngestionRate: number;
  activeScraperBots: number;
  deduplicationRatio: number; // e.g. 0.88
  apiDeliveryUptime: number; // e.g. 99.98
  averageApiLatencyMs: number; // e.g. 14.2
}

export interface InvestorRecord {
  id: string;
  firmName: string;
  partnerName: string;
  status: "LEAD" | "FIRST_CALL" | "DATA_ROOM_ACTIVE" | "TERM_SHEET" | "COMMITTED" | "PASSED";
  ticketSizeUsd: number;
  dataRoomAccessCount: number;
  lastContact: string;
  notes: string;
}

export interface GrantRecord {
  id: string;
  program: "TUBITAK_1507" | "TUBITAK_1511" | "KOSGEB_ARGE" | "HORIZON_EUROPE_AI" | "YC_S26";
  requestedBudgetTry: number;
  status:
    "DRAFTING" | "SUBMITTED" | "UNDER_EVALUATION" | "REVISION_REQUESTED" | "APPROVED" | "FUNDED";
  deadlineDate: string;
  completionPercentage: number;
}

export interface RedTeamBounty {
  id: string;
  challengerHandle: string;
  targetModel: string;
  vulnerabilityType: "JAILBREAK" | "PII_EXTRACTION" | "BIAS_EXPLOIT" | "SYSTEM_PROMPT_LEAK";
  payoutEur: number;
  status: "PENDING_REVIEW" | "VERIFIED_PAID" | "REJECTED";
  submittedDate: string;
}
