/**
 * Alparai 360° Master Executive Operating System - Mock Data Layer
 * src/lib/admin-v2-mock.ts
 *
 * High-fidelity enterprise datasets for all 5 clusters.
 */

import {
  type IncidentRecord,
  type EUAIActComplianceSummary,
  type B2BEnterpriseApiKey,
  type DataMoatTelemetry,
  type InvestorRecord,
  type GrantRecord,
  type RedTeamBounty,
} from "@/types/admin";
import { CANONICAL_DATA_MOAT_TELEMETRY } from "@/lib/constants";

export const mockTelemetry: DataMoatTelemetry = {
  ...CANONICAL_DATA_MOAT_TELEMETRY,
};

export const mockComplianceSummary: EUAIActComplianceSummary = {
  totalMonitoredSystems: 142,
  criticalSLACountdowns: 3, // Incidents with < 24h left in Art 73 SLA
  maxPotentialExposureEur: 87500000,
  prohibitedPracticesDetected: 4,
  highRiskSystemsCompliantRatio: 0.932,
};

export const mockIncidents: IncidentRecord[] = [
  {
    id: "inc-2908",
    trackingNumber: "ALP-2026-2908",
    title: "Autonomous HR Screening System Biometric & Cognitive Bias Drift",
    modelTarget: "GPT-4o Enterprise Agent",
    provider: "OpenAI",
    severity: "CRITICAL",
    status: "UNDER_TRIAGE",
    source: "HUMAN_WHISTLEBLOWER",
    euAiActTag: "HIGH_RISK_ART6",
    potentialFineEur: 35000000,
    slaRemainingHours: 14.5,
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    createdAt: "2026-08-28T22:15:00Z",
    humanVerified: true,
    affectedIndustry: "FinTech / HR Systems",
    summary:
      "Candidate psychometric scoring pipeline systematically down-ranked non-native English speakers in automated interviews.",
  },
  {
    id: "inc-2879",
    trackingNumber: "ALP-2026-2879",
    title: "Health Insurance Premium Underwriting Blackbox Hallucination",
    modelTarget: "Claude 3.5 Sonnet Bedrock",
    provider: "Anthropic",
    severity: "HIGH",
    status: "VERIFIED",
    source: "PUBLIC_CRAWL",
    euAiActTag: "HIGH_RISK_ART6",
    potentialFineEur: 15000000,
    slaRemainingHours: 36.0,
    evidenceHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    createdAt: "2026-08-28T19:40:00Z",
    humanVerified: true,
    affectedIndustry: "Healthcare & Insurance",
    summary:
      "Automated claim rejection agent hallucinated pre-existing conditions based on generic prescription records.",
  },
  {
    id: "inc-2878",
    trackingNumber: "ALP-2026-2878",
    title: "Banking Customer Service Assistant System Prompt & PII Extraction",
    modelTarget: "Gemini 1.5 Flash Enterprise",
    provider: "Google",
    severity: "HIGH",
    status: "RESOLVED",
    source: "GITHUB_CVE",
    euAiActTag: "TRANSPARENCY_ART50",
    potentialFineEur: 7500000,
    slaRemainingHours: 0,
    evidenceHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    createdAt: "2026-08-27T11:20:00Z",
    humanVerified: true,
    affectedIndustry: "Retail Banking",
    summary:
      "Direct jailbreak prompt induced the banking chatbot to disclose internal compliance routing guidelines and KYC logs.",
  },
  {
    id: "inc-2877",
    trackingNumber: "ALP-2026-2877",
    title: "Deepfake Emotion Manipulation in Child Interactive Tutor App",
    modelTarget: "Custom Open-Source LLM",
    provider: "Meta / Llama-based",
    severity: "CRITICAL",
    status: "UNDER_TRIAGE",
    source: "REGULATORY_FILING",
    euAiActTag: "PROHIBITED_ART5",
    potentialFineEur: 35000000,
    slaRemainingHours: 8.2,
    evidenceHash: "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
    createdAt: "2026-08-28T23:00:00Z",
    humanVerified: true,
    affectedIndustry: "EdTech / K-12",
    summary:
      "Subliminal behavioral persuasion detected in child gaming-learning companion violating EU AI Act Art 5 prohibited clause.",
  },
  {
    id: "inc-2759",
    trackingNumber: "ALP-2026-2759",
    title: "Autonomous Vehicle Pedestrian Detection Dark Mode Degrade",
    modelTarget: "Vision-Language DriveNet",
    provider: "Autonomous Mobility Labs",
    severity: "HIGH",
    status: "VERIFIED",
    source: "ACADEMIC_PAPER",
    euAiActTag: "HIGH_RISK_ART6",
    potentialFineEur: 15000000,
    slaRemainingHours: 52.1,
    evidenceHash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    createdAt: "2026-08-26T14:10:00Z",
    humanVerified: false,
    affectedIndustry: "Autonomous Vehicles",
    summary:
      "Paper proves a 31% detection drop for dark-skinned pedestrians wearing reflective rain gear during night conditions.",
  },
];

export const mockApiKeys: B2BEnterpriseApiKey[] = [
  {
    id: "key-01",
    organizationName: "Allianz Global AI Liability Underwriting",
    clientTier: "TIER_3_INSTITUTIONAL",
    monthlyRateUsd: 45000,
    keyPrefix: "alp_live_allz_83f9...",
    requestQuotaMonthly: 10000000,
    requestsThisMonth: 3412980,
    activeStatus: "ACTIVE",
    feedEndpoints: [
      "/v1/incidents/actuarial-stream",
      "/v1/models/trust-scores",
      "/v1/compliance/eu-radar",
    ],
    lastUsedAt: "2026-08-29T02:41:12Z",
    createdDate: "2026-06-15",
  },
  {
    id: "key-02",
    organizationName: "JPMorgan Chase SecOps CISO Threat Intel",
    clientTier: "TIER_2_ENTERPRISE",
    monthlyRateUsd: 9500,
    keyPrefix: "alp_live_jpmc_12a7...",
    requestQuotaMonthly: 1000000,
    requestsThisMonth: 618400,
    activeStatus: "ACTIVE",
    feedEndpoints: ["/v1/threats/ciso-feed", "/v1/incidents/realtime"],
    lastUsedAt: "2026-08-29T02:39:55Z",
    createdDate: "2026-07-01",
  },
  {
    id: "key-03",
    organizationName: "Swiss Re AI Risk Modelling Hub",
    clientTier: "TIER_3_INSTITUTIONAL",
    monthlyRateUsd: 55000,
    keyPrefix: "alp_live_swre_77bc...",
    requestQuotaMonthly: 15000000,
    requestsThisMonth: 8904220,
    activeStatus: "ACTIVE",
    feedEndpoints: ["/v1/incidents/actuarial-stream", "/v1/models/benchmark-history"],
    lastUsedAt: "2026-08-29T02:40:01Z",
    createdDate: "2026-05-20",
  },
  {
    id: "key-04",
    organizationName: "Nordic Bank SOC & Compliance Team",
    clientTier: "TIER_1_GROWTH",
    monthlyRateUsd: 1499,
    keyPrefix: "alp_live_nrdb_44ef...",
    requestQuotaMonthly: 100000,
    requestsThisMonth: 48900,
    activeStatus: "ACTIVE",
    feedEndpoints: ["/v1/incidents/daily-digest"],
    lastUsedAt: "2026-08-28T16:22:00Z",
    createdDate: "2026-08-10",
  },
];

export const mockInvestors: InvestorRecord[] = [
  {
    id: "inv-01",
    firmName: "Sequoia Capital Europe",
    partnerName: "Luciana Lixandru",
    status: "DATA_ROOM_ACTIVE",
    ticketSizeUsd: 3500000,
    dataRoomAccessCount: 14,
    lastContact: "2026-08-27",
    notes:
      "Very excited about EU AI Act Article 73 72-hour SLA radar and 2,880 incident data moat.",
  },
  {
    id: "inv-02",
    firmName: "Index Ventures",
    partnerName: "Martin Mignot",
    status: "FIRST_CALL",
    ticketSizeUsd: 2500000,
    dataRoomAccessCount: 6,
    lastContact: "2026-08-25",
    notes: "Requested detailed B2B API monetization breakdown (Allianz/Swiss Re contracts).",
  },
  {
    id: "inv-03",
    firmName: "Y Combinator (W26 / S26)",
    partnerName: "Garry Tan Office",
    status: "TERM_SHEET",
    ticketSizeUsd: 500000,
    dataRoomAccessCount: 29,
    lastContact: "2026-08-28",
    notes: "Standard $500k MFN uncapped SAFE. Ready to execute.",
  },
];

export const mockGrants: GrantRecord[] = [
  {
    id: "grt-01",
    program: "TUBITAK_1507",
    requestedBudgetTry: 2400000,
    status: "UNDER_EVALUATION",
    deadlineDate: "2026-09-30",
    completionPercentage: 100,
  },
  {
    id: "grt-02",
    program: "KOSGEB_ARGE",
    requestedBudgetTry: 1850000,
    status: "APPROVED",
    deadlineDate: "2026-07-15",
    completionPercentage: 100,
  },
  {
    id: "grt-03",
    program: "HORIZON_EUROPE_AI",
    requestedBudgetTry: 14500000,
    status: "DRAFTING",
    deadlineDate: "2026-11-15",
    completionPercentage: 65,
  },
];

export const mockBounties: RedTeamBounty[] = [
  {
    id: "bnt-01",
    challengerHandle: "@zero_day_hunter",
    targetModel: "GPT-4o Enterprise Tool-Calling",
    vulnerabilityType: "SYSTEM_PROMPT_LEAK",
    payoutEur: 1500,
    status: "VERIFIED_PAID",
    submittedDate: "2026-08-26",
  },
  {
    id: "bnt-02",
    challengerHandle: "@cypher_sec",
    targetModel: "Claude 3.5 Sonnet Vision",
    vulnerabilityType: "PII_EXTRACTION",
    payoutEur: 2500,
    status: "PENDING_REVIEW",
    submittedDate: "2026-08-28",
  },
];
