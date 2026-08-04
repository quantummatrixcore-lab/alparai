/**
 * CSV Parser for bulk incident import.
 *
 * Supports two source formats:
 *  - AIAAIC Registry (Google Sheets export)
 *  - AI Incident Database (AIID) export
 *
 * Each row is validated with Zod; invalid rows are collected in `errors`
 * instead of throwing so a single bad row doesn't abort the whole import.
 */

import Papa from "papaparse";
import { z } from "zod";
import type { Database } from "@/types/database";

export type IncidentSource = "aiaaic_import" | "aiid_import" | "news_curated";

export interface ImportIncidentRow {
  externalId: string;
  title: string;
  description: string;
  category: Database["public"]["Enums"]["incident_category"];
  severity: Database["public"]["Enums"]["incident_severity"];
  incidentDate: string | null;
  locationCountry: string | null;
  sourceUrl: string | null;
  importAttribution: string;
  language: string;
  euActRiskCategory: string | null;
  euActSeriousIncidentClass: string | null;
  euActHighRiskSystemCategory: string | null;
  euActReportingDeadlineDays: number | null;
}

export interface ParseResult {
  rows: ImportIncidentRow[];
  errors: { row: number; message: string }[];
  total: number;
}

// ---------------------------------------------------------------------------
// AIAAIC column mapping
// Headers (case-insensitive, trimmed):
//   "Occurred", "Title", "Summary", "Type", "Country", "Source URL"
// ---------------------------------------------------------------------------

const AIAAIC_CATEGORY_MAP: Record<string, Database["public"]["Enums"]["incident_category"]> = {
  bias: "bias",
  discrimination: "bias",
  "privacy issue": "privacy",
  privacy: "privacy",
  safety: "security",
  security: "security",
  "misleading information": "misinformation",
  misinformation: "misinformation",
  hallucination: "hallucination",
  manipulation: "manipulation",
  harassment: "harassment",
  copyright: "copyright",
  "human rights": "bias",
  transparency: "other",
  accountability: "other",
};

interface EuActMapping {
  riskCategory: string | null;
  seriousIncidentClass: string | null;
  highRiskSystemCategory: string | null;
  reportingDeadlineDays: number | null;
}

export const EU_TAXONOMY_MAP: Record<
  Database["public"]["Enums"]["incident_category"],
  EuActMapping
> = {
  bias: {
    riskCategory: "High Risk",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: "services",
    reportingDeadlineDays: 15,
  },
  privacy: {
    riskCategory: "High Risk",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: null,
    reportingDeadlineDays: 15,
  },
  security: {
    riskCategory: "High Risk",
    seriousIncidentClass: "critical-infrastructure",
    highRiskSystemCategory: "infrastructure",
    reportingDeadlineDays: 10,
  },
  manipulation: {
    riskCategory: "Unacceptable Risk",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: null,
    reportingDeadlineDays: 15,
  },
  harassment: {
    riskCategory: "Unacceptable Risk",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: null,
    reportingDeadlineDays: 15,
  },
  misinformation: {
    riskCategory: "Specific Transparency",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: null,
    reportingDeadlineDays: 15,
  },
  hallucination: {
    riskCategory: "Specific Transparency",
    seriousIncidentClass: "fundamental-rights",
    highRiskSystemCategory: null,
    reportingDeadlineDays: 15,
  },
  inaccessibility: {
    riskCategory: "Minimal",
    seriousIncidentClass: null,
    highRiskSystemCategory: null,
    reportingDeadlineDays: null,
  },
  copyright: {
    riskCategory: "Minimal",
    seriousIncidentClass: null,
    highRiskSystemCategory: null,
    reportingDeadlineDays: null,
  },
  other: {
    riskCategory: "Minimal",
    seriousIncidentClass: null,
    highRiskSystemCategory: null,
    reportingDeadlineDays: null,
  },
};

function mapAiaaic(
  raw: Record<string, string>,
  rowIndex: number,
): { row: ImportIncidentRow | null; error: string | null } {
  const title = (raw["Title"] ?? raw["title"] ?? "").trim();
  const description = (raw["Summary"] ?? raw["summary"] ?? raw["Description"] ?? "").trim();
  const externalId = (raw["ID"] ?? raw["id"] ?? String(rowIndex)).trim();
  const sourceUrl = (raw["Source URL"] ?? raw["source_url"] ?? "").trim() || null;
  const locationCountry =
    (raw["Country"] ?? raw["country"] ?? "").trim().slice(0, 2).toUpperCase() || null;
  const incidentDate = parseDate(raw["Occurred"] ?? raw["occurred"] ?? "");
  const rawType = (raw["Type"] ?? raw["type"] ?? "other").trim().toLowerCase();
  const category: Database["public"]["Enums"]["incident_category"] =
    AIAAIC_CATEGORY_MAP[rawType] ?? "other";

  if (!title || title.length < 8) {
    return { row: null, error: `Row ${rowIndex}: title too short ("${title}")` };
  }
  if (!description || description.length < 20) {
    return { row: null, error: `Row ${rowIndex}: description too short` };
  }

  const euActMapping = EU_TAXONOMY_MAP[category];

  return {
    row: {
      externalId: `aiaaic-${externalId}`,
      title,
      description,
      category,
      severity: "medium",
      incidentDate,
      locationCountry,
      sourceUrl,
      importAttribution: "AIAAIC Registry (CC BY 4.0) — aiaaic.org",
      language: "en",
      euActRiskCategory: euActMapping.riskCategory,
      euActSeriousIncidentClass: euActMapping.seriousIncidentClass,
      euActHighRiskSystemCategory: euActMapping.highRiskSystemCategory,
      euActReportingDeadlineDays: euActMapping.reportingDeadlineDays,
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// AIID column mapping
// Headers: "incident_id", "title", "description", "url", "date_published"
// ---------------------------------------------------------------------------

function mapAiid(
  raw: Record<string, string>,
  rowIndex: number,
): { row: ImportIncidentRow | null; error: string | null } {
  const title = (raw["title"] ?? raw["Title"] ?? "").trim();
  const description = (raw["description"] ?? raw["Description"] ?? raw["text"] ?? "").trim();
  const externalId = (raw["incident_id"] ?? raw["id"] ?? String(rowIndex)).trim();
  const sourceUrl = (raw["url"] ?? raw["source_url"] ?? "").trim() || null;
  const incidentDate = parseDate(raw["date_published"] ?? raw["date"] ?? "");

  if (!title || title.length < 8) {
    return { row: null, error: `Row ${rowIndex}: title too short ("${title}")` };
  }
  if (!description || description.length < 20) {
    return { row: null, error: `Row ${rowIndex}: description too short` };
  }

  const euActMapping = EU_TAXONOMY_MAP["other"];

  return {
    row: {
      externalId: `aiid-${externalId}`,
      title,
      description,
      category: "other",
      severity: "medium",
      incidentDate,
      locationCountry: null,
      sourceUrl,
      importAttribution: "AI Incident Database (CC BY-SA 4.0) — incidentdatabase.ai",
      language: "en",
      euActRiskCategory: euActMapping.riskCategory,
      euActSeriousIncidentClass: euActMapping.seriousIncidentClass,
      euActHighRiskSystemCategory: euActMapping.highRiskSystemCategory,
      euActReportingDeadlineDays: euActMapping.reportingDeadlineDays,
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Generic news_curated mapping
// Required headers: "title", "description"
// Optional: "category", "severity", "date", "country", "source_url", "external_id"
// ---------------------------------------------------------------------------

const genericRowSchema = z.object({
  title: z.string().min(8).max(200),
  description: z.string().min(20).max(10000),
  category: z
    .enum([
      "hallucination",
      "bias",
      "privacy",
      "security",
      "misinformation",
      "harassment",
      "manipulation",
      "inaccessibility",
      "copyright",
      "other",
    ])
    .optional()
    .default("other"),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  country: z.string().length(2).optional().nullable(),
  source_url: z.string().url().optional().nullable(),
  external_id: z.string().optional(),
});

function mapGeneric(
  raw: Record<string, string>,
  rowIndex: number,
): { row: ImportIncidentRow | null; error: string | null } {
  const parsed = genericRowSchema.safeParse({
    title: (raw["title"] ?? "").trim(),
    description: (raw["description"] ?? "").trim(),
    category: (raw["category"] ?? "other").trim() || undefined,
    severity: (raw["severity"] ?? "medium").trim() || undefined,
    date: (raw["date"] ?? "").trim() || undefined,
    country: (raw["country"] ?? "").trim().slice(0, 2).toUpperCase() || undefined,
    source_url: (raw["source_url"] ?? "").trim() || undefined,
    external_id: (raw["external_id"] ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return {
      row: null,
      error: `Row ${rowIndex}: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
    };
  }

  const d = parsed.data;
  const extId = d.external_id ?? `news-${rowIndex}`;

  const euActMapping = EU_TAXONOMY_MAP[d.category];

  return {
    row: {
      externalId: extId,
      title: d.title,
      description: d.description,
      category: d.category,
      severity: d.severity,
      incidentDate: d.date ?? null,
      locationCountry: d.country ?? null,
      sourceUrl: d.source_url ?? null,
      importAttribution: "Curated news source",
      language: "en",
      euActRiskCategory: euActMapping.riskCategory,
      euActSeriousIncidentClass: euActMapping.seriousIncidentClass,
      euActHighRiskSystemCategory: euActMapping.highRiskSystemCategory,
      euActReportingDeadlineDays: euActMapping.reportingDeadlineDays,
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function parseIncidentCSV(csvText: string, source: IncidentSource): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (value: string) => value.trim(),
  });

  const rows: ImportIncidentRow[] = [];
  const errors: { row: number; message: string }[] = [];

  (parsed.data as Record<string, string>[]).forEach((raw, index) => {
    const rowIndex = index + 2;
    let mapped: { row: ImportIncidentRow | null; error: string | null };

    if (source === "aiaaic_import") {
      mapped = mapAiaaic(raw, rowIndex);
    } else if (source === "aiid_import") {
      mapped = mapAiid(raw, rowIndex);
    } else {
      mapped = mapGeneric(raw, rowIndex);
    }

    if (mapped.error) {
      errors.push({ row: rowIndex, message: mapped.error });
    } else if (mapped.row) {
      rows.push(mapped.row);
    }
  });

  return { rows, errors, total: (parsed.data as unknown[]).length };
}
