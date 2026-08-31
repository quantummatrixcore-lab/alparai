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
  it("enforces 2908 as canonical incident count", () => {
    expect(CANONICAL_INCIDENT_COUNT).toBe(2908);
    expect(CANONICAL_DATA_MOAT_TELEMETRY.totalIndexedIncidents).toBe(2908);
    expect(mockTelemetry.totalIndexedIncidents).toBe(2908);
  });

  it("verifies source breakdown sum matches total indexed incidents perfectly", () => {
    const sum =
      CANONICAL_COUNTS_BY_SOURCE.user_submitted +
      CANONICAL_COUNTS_BY_SOURCE.aiaaic_import +
      CANONICAL_COUNTS_BY_SOURCE.aiid_import +
      CANONICAL_COUNTS_BY_SOURCE.news_curated +
      CANONICAL_COUNTS_BY_SOURCE.court_record;

    expect(sum).toBe(2908);
  });

  it("verifies telemetry public scraped + whistleblower sum equals 2908", () => {
    const scrapedAndWhistleblower =
      CANONICAL_DATA_MOAT_TELEMETRY.publicScrapedCount +
      CANONICAL_DATA_MOAT_TELEMETRY.humanWhistleblowerCount;
    expect(scrapedAndWhistleblower).toBe(2908);
  });

  it("resolveIncidentCount fallback behavior", () => {
    expect(resolveIncidentCount(null)).toBe(2908);
    expect(resolveIncidentCount(undefined)).toBe(2908);
    expect(resolveIncidentCount(0)).toBe(2908);
    expect(resolveIncidentCount(-5)).toBe(2908);
    expect(resolveIncidentCount(3500)).toBe(3500);
  });

  it("resolveCountsBySource fallback behavior", () => {
    const fallback = resolveCountsBySource(null);
    expect(fallback.user_submitted).toBe(526);
    expect(fallback.news_curated).toBe(785);

    const custom = resolveCountsBySource([
      { incident_source: "user_submitted" },
      { incident_source: "news_curated" },
    ]);
    expect(custom.user_submitted).toBe(1);
    expect(custom.news_curated).toBe(1);
  });
});
