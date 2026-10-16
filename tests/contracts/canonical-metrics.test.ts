import { describe, it, expect } from "vitest";
import {
  CANONICAL_INCIDENT_COUNT,
  CANONICAL_COUNTS_BY_SOURCE,
  CANONICAL_DATA_MOAT_TELEMETRY,
  resolveIncidentCount,
  resolveCountsBySource,
} from "@/lib/constants/canonical-stats";
import { mockTelemetry } from "@/lib/admin-mock";

describe("Canonical Metrics Single Source of Truth Suite", () => {
  it("enforces 3115 as canonical incident count", () => {
    expect(CANONICAL_INCIDENT_COUNT).toBe(3115);
    expect(CANONICAL_DATA_MOAT_TELEMETRY.totalIndexedIncidents).toBe(3115);
    expect(mockTelemetry.totalIndexedIncidents).toBe(3115);
  });

  it("verifies source breakdown sum matches total indexed incidents perfectly", () => {
    const sum =
      CANONICAL_COUNTS_BY_SOURCE.user_submitted +
      CANONICAL_COUNTS_BY_SOURCE.aiaaic_import +
      CANONICAL_COUNTS_BY_SOURCE.aiid_import +
      CANONICAL_COUNTS_BY_SOURCE.news_curated +
      CANONICAL_COUNTS_BY_SOURCE.court_record;

    expect(sum).toBe(3115);
  });

  it("verifies telemetry public scraped + whistleblower sum equals 3115", () => {
    const scrapedAndWhistleblower =
      CANONICAL_DATA_MOAT_TELEMETRY.publicScrapedCount +
      CANONICAL_DATA_MOAT_TELEMETRY.humanWhistleblowerCount;
    expect(scrapedAndWhistleblower).toBe(3115);
  });

  it("resolveIncidentCount fallback behavior", () => {
    expect(resolveIncidentCount(null)).toBe(3115);
    expect(resolveIncidentCount(undefined)).toBe(3115);
    expect(resolveIncidentCount(0)).toBe(3115);
    expect(resolveIncidentCount(-5)).toBe(3115);
    expect(resolveIncidentCount(3500)).toBe(3500);
  });

  it("resolveIncidentCount never double-counts live DB rows", () => {
    expect(resolveIncidentCount(500)).toBe(500);
    expect(resolveIncidentCount(3115)).toBe(3115);
  });

  it("resolveCountsBySource fallback behavior", () => {
    const fallback = resolveCountsBySource(null);
    expect(fallback.user_submitted).toBe(61);
    expect(fallback.news_curated).toBe(2691);

    const custom = resolveCountsBySource([
      { incident_source: "user_submitted" },
      { incident_source: "news_curated" },
    ]);
    expect(custom.user_submitted).toBe(1);
    expect(custom.news_curated).toBe(1);
  });
});
