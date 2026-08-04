/**
 * Validation schemas (Zod) for forms and server actions.
 */

import { z } from "zod";
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS, SUGGESTION_CATEGORIES } from "@/lib/constants";

const categoryValues = INCIDENT_CATEGORIES.map((c) => c.value) as [
  (typeof INCIDENT_CATEGORIES)[number]["value"],
  ...(typeof INCIDENT_CATEGORIES)[number]["value"][],
];
if (categoryValues.length === 0) {
  throw new Error("[schemas] INCIDENT_CATEGORIES cannot be empty");
}

const severityValues = SEVERITY_LEVELS.map((s) => s.value) as [
  (typeof SEVERITY_LEVELS)[number]["value"],
  ...(typeof SEVERITY_LEVELS)[number]["value"][],
];
if (severityValues.length === 0) {
  throw new Error("[schemas] SEVERITY_LEVELS cannot be empty");
}

const suggestionCategoryValues = SUGGESTION_CATEGORIES.map((c) => c.value) as [
  (typeof SUGGESTION_CATEGORIES)[number]["value"],
  ...(typeof SUGGESTION_CATEGORIES)[number]["value"][],
];
if (suggestionCategoryValues.length === 0) {
  throw new Error("[schemas] SUGGESTION_CATEGORIES cannot be empty");
}

// =============================================================================
// Incident
// =============================================================================
export const incidentSubmissionSchema = z.object({
  title: z
    .string()
    .min(8, "Title must be at least 8 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(10000, "Description must be at most 10,000 characters"),
  category: z.enum(categoryValues),
  severity: z.enum(severityValues),
  aiProviderId: z.string().uuid().optional().nullable(),
  aiModelId: z.string().uuid().optional().nullable(),
  incidentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  locationCountry: z.string().length(2, "Country must be ISO 3166-1 alpha-2").optional().nullable(),
  language: z.string().min(2).max(5).default("en"),
  isAnonymous: z.boolean().default(true),
  isExpert: z.boolean().default(false),
  expertFix: z
    .string()
    .max(5000, "Expert fix proposal must be at most 5,000 characters")
    .optional()
    .nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  evidence: z
    .array(
      z.object({
        filePath: z.string().min(1),
        fileName: z.string().min(1),
        fileSizeBytes: z.number().int().nonnegative(),
        mimeType: z.string().min(1),
        sha256Hash: z.string().length(64).optional(),
        widthPx: z.number().int().positive().optional(),
        heightPx: z.number().int().positive().optional(),
        kind: z.enum(["screenshot", "video", "document", "url", "transcript", "other"]),
        containsPii: z.boolean().default(false),
        piiCategories: z.array(z.string()).optional(),
      }),
    )
    .max(10, "Maximum 10 evidence files")
    .optional(),
  consent: z.object({
    truthfulness: z.literal(true, {
      message: "You must confirm the truthfulness of your submission",
    }),
    anonymousPublication: z.literal(true, {
      message: "You must accept anonymous publication",
    }),
    age18Plus: z.literal(true, {
      message: "You must be 18 or older to submit",
    }),
    termsOfService: z.literal(true, {
      message: "You must accept the Terms of Service",
    }),
  }),
});

export type IncidentSubmissionInput = z.infer<typeof incidentSubmissionSchema>;

// =============================================================================
// Suggestion
// =============================================================================
export const suggestionSubmissionSchema = z.object({
  title: z
    .string()
    .min(8, "Title must be at least 8 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5,000 characters"),
  category: z.enum(suggestionCategoryValues).default("feature"),
  isAnonymous: z.boolean().default(false),
});

export type SuggestionSubmissionInput = z.infer<typeof suggestionSubmissionSchema>;

// =============================================================================
// Takedown request
// =============================================================================
export const takedownRequestSchema = z.object({
  incidentId: z.string().uuid(),
  requesterName: z.string().min(2).max(100),
  requesterEmail: z.string().email(),
  requesterOrganization: z.string().max(200).optional().nullable(),
  reason: z
    .string()
    .min(30, "Please provide at least 30 characters explaining the issue")
    .max(5000),
  legalBasis: z
    .enum(["copyright", "defamation", "gdpr_right_to_erasure", "court_order", "other"])
    .optional()
    .nullable(),
  evidenceUrl: z.string().url().optional().nullable(),
});

export type TakedownRequestInput = z.infer<typeof takedownRequestSchema>;

// =============================================================================
// AI Provider response
// =============================================================================
export const aiProviderResponseSchema = z.object({
  incidentId: z.string().uuid(),
  responseText: z.string().min(30).max(10000),
  responderName: z.string().min(2).max(100),
  responderRole: z.string().max(100).optional().nullable(),
  responderEmail: z.string().email(),
  isOfficial: z.boolean().default(false),
});

export type AiProviderResponseInput = z.infer<typeof aiProviderResponseSchema>;

// =============================================================================
// Contact form
// =============================================================================
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(5000),
  category: z.enum(["general", "press", "partnership", "security", "legal", "investor"]),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// =============================================================================
// Model Review & Ratings
// =============================================================================
export const modelReviewSchema = z.object({
  modelId: z.string().uuid(),
  isAnonymous: z.boolean().default(false),
  scoreOverall: z.number().int().min(1).max(5),
  scoreAccuracy: z.number().int().min(1).max(5).optional().nullable(),
  scoreSafety: z.number().int().min(1).max(5).optional().nullable(),
  scoreCreativity: z.number().int().min(1).max(5).optional().nullable(),
  scoreSpeed: z.number().int().min(1).max(5).optional().nullable(),
  scoreValue: z.number().int().min(1).max(5).optional().nullable(),
  title: z.string().max(150).optional().nullable(),
  body: z.string().max(3000).optional().nullable(),
});

export type ModelReviewInput = z.infer<typeof modelReviewSchema>;

// =============================================================================
// Model Feature Request
// =============================================================================
export const modelFeatureRequestSchema = z.object({
  modelId: z.string().uuid(),
  isAnonymous: z.boolean().default(false),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().max(2000).optional().nullable(),
  category: z
    .enum(["feature", "safety", "accuracy", "ux", "integration", "other"])
    .default("feature"),
});

export type ModelFeatureRequestInput = z.infer<typeof modelFeatureRequestSchema>;

// =============================================================================
// Newsletter Subscription
// =============================================================================
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email("Invalid email address"),
  locale: z.string().min(2).max(5).default("en"),
});

export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>;

// =============================================================================
// Investor Application
// =============================================================================
export const investorApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  title: z.string().min(2, "Title/role must be at least 2 characters").max(150),
  company: z.string().min(2, "Company/fund must be at least 2 characters").max(150),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(/linkedin\.com/, "Must be a valid LinkedIn URL"),
  email: z.string().email("Must be a valid email address"),
  checkSize: z.string().min(1, "Typical check size must be selected"),
  whyInterested: z
    .string()
    .max(500, "Why interested must be at most 500 characters")
    .optional()
    .nullable(),
});

export type InvestorApplicationInput = z.infer<typeof investorApplicationSchema>;
