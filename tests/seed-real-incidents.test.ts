import { describe, it, expect } from "vitest";
import { seedRealIncidents, REAL_INCIDENTS_SEED_DATA } from "../scripts/seed-real-incidents";
import { CANONICAL_FALLBACK_INCIDENTS, CANONICAL_FALLBACK_PROVIDERS } from "../src/lib/constants/canonical-stats";

describe("Seed Real Incidents & Fallback Integrity", () => {
  it("should process and sanitize real incidents seed data", async () => {
    const processed = await seedRealIncidents(false);
    expect(processed).toHaveLength(5);
    expect(processed[0]?.title_masked).toBeTruthy();
    expect(processed[0]?.description_masked).toBeTruthy();
  });

  it("should contain valid real seed incidents dataset", () => {
    expect(REAL_INCIDENTS_SEED_DATA.length).toBeGreaterThanOrEqual(5);
    for (const item of REAL_INCIDENTS_SEED_DATA) {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.provider_slug).toBeTruthy();
    }
  });

  it("should verify canonical fallback incidents and providers", () => {
    expect(CANONICAL_FALLBACK_INCIDENTS.length).toBeGreaterThanOrEqual(5);
    expect(CANONICAL_FALLBACK_PROVIDERS.length).toBeGreaterThanOrEqual(50);
  });
});
