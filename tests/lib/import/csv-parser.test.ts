import { describe, expect, it } from "vitest";
import { parseIncidentCSV } from "@/lib/import/csv-parser";

// ---------------------------------------------------------------------------
// AIAAIC format tests
// ---------------------------------------------------------------------------
describe("parseIncidentCSV — AIAAIC", () => {
  const buildCsv = (rows: string) => `ID,Title,Summary,Type,Country,Source URL\n${rows}`;

  it("parses a valid AIAAIC row", () => {
    const csv = buildCsv(
      "42,AI system misidentified suspects,A facial recognition system incorrectly flagged 28 innocent people as criminals during a police operation in Brazil.,bias,BR,https://example.com/source",
    );
    const { rows, errors } = parseIncidentCSV(csv, "aiaaic_import");
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.externalId).toBe("aiaaic-42");
    expect(rows[0]!.category).toBe("bias");
    expect(rows[0]!.locationCountry).toBe("BR");
    expect(rows[0]!.importAttribution).toContain("AIAAIC");
  });

  it("skips row with title too short", () => {
    const csv = buildCsv(
      "1,Short,Some very long description that exceeds the minimum requirement,bias,,",
    );
    const { rows, errors } = parseIncidentCSV(csv, "aiaaic_import");
    expect(rows).toHaveLength(0);
    expect(errors[0]!.message).toContain("title too short");
  });

  it("skips row with description too short", () => {
    const csv = buildCsv("2,A very long enough title here,Too short,bias,,");
    const { rows, errors } = parseIncidentCSV(csv, "aiaaic_import");
    expect(rows).toHaveLength(0);
    expect(errors[0]!.message).toContain("description too short");
  });

  it("maps unknown type to 'other'", () => {
    const csv = buildCsv(
      "5,Some AI incident title here,A detailed description of an AI incident that occurred in a hospital system and affected multiple patients.,unknown_type,,",
    );
    const { rows } = parseIncidentCSV(csv, "aiaaic_import");
    expect(rows[0]!.category).toBe("other");
  });

  it("parses date in ISO format", () => {
    const csv = buildCsv(
      "6,AI chatbot spread misinformation widely,A chatbot produced false medical claims that were shared by thousands of users on social media platforms.,misinformation,,https://example.com\n",
    );
    const { rows } = parseIncidentCSV(csv, "aiaaic_import");
    expect(rows[0]!.incidentDate).toBeNull();
  });

  it("parses multiple rows", () => {
    const csv = buildCsv(
      "1,First AI system incident title,Detailed description of what happened in this specific AI incident case.,bias,US,https://example.com\n" +
        "2,Second incident happened here,Another detailed description of a different AI incident that affected many people.,privacy,UK,https://example2.com",
    );
    const { rows, errors } = parseIncidentCSV(csv, "aiaaic_import");
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// AIID format tests
// ---------------------------------------------------------------------------
describe("parseIncidentCSV — AIID", () => {
  const buildCsv = (rows: string) => `incident_id,title,description,url,date_published\n${rows}`;

  it("parses a valid AIID row", () => {
    const csv = buildCsv(
      "100,Autonomous vehicle caused pedestrian fatality,An autonomous vehicle operating in autopilot mode struck and fatally injured a pedestrian crossing the road.,https://example.com,2023-03-15",
    );
    const { rows, errors } = parseIncidentCSV(csv, "aiid_import");
    expect(errors).toHaveLength(0);
    expect(rows[0]!.externalId).toBe("aiid-100");
    expect(rows[0]!.importAttribution).toContain("incidentdatabase.ai");
    expect(rows[0]!.incidentDate).toBe("2023-03-15");
  });

  it("handles missing date gracefully", () => {
    const csv = buildCsv(
      "200,AI content moderation failed badly,An automated content moderation system incorrectly removed thousands of legitimate posts.,https://example.com,",
    );
    const { rows } = parseIncidentCSV(csv, "aiid_import");
    expect(rows[0]!.incidentDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Generic news_curated format tests
// ---------------------------------------------------------------------------
describe("parseIncidentCSV — news_curated", () => {
  const buildCsv = (rows: string) =>
    `title,description,category,severity,date,country,source_url,external_id\n${rows}`;

  it("parses a valid generic row", () => {
    const csv = buildCsv(
      "AI recruitment tool discriminated,A hiring algorithm systematically rejected candidates from minority backgrounds over a period of three years.,bias,high,2024-01-10,US,https://example.com,news-001",
    );
    const { rows, errors } = parseIncidentCSV(csv, "news_curated");
    expect(errors).toHaveLength(0);
    expect(rows[0]!.severity).toBe("high");
    expect(rows[0]!.category).toBe("bias");
    expect(rows[0]!.externalId).toBe("news-001");
  });

  it("defaults severity to medium when missing", () => {
    const csv = buildCsv(
      "AI system made error in judgment,The automated decision system made a critical error that impacted many people in a significant way.,,,,,,",
    );
    const { rows } = parseIncidentCSV(csv, "news_curated");
    expect(rows[0]!.severity).toBe("medium");
    expect(rows[0]!.category).toBe("other");
  });

  it("rejects invalid severity enum", () => {
    const csv = buildCsv(
      "AI system had a serious issue,This is a very detailed description of the AI incident that caused significant harm.,bias,extreme,,,, ",
    );
    const { errors } = parseIncidentCSV(csv, "news_curated");
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("parseIncidentCSV — edge cases", () => {
  it("returns empty rows for empty CSV (headers only)", () => {
    const { rows, errors, total } = parseIncidentCSV(
      "title,description,category\n",
      "news_curated",
    );
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(total).toBe(0);
  });

  it("handles CSV with Windows line endings", () => {
    const csv =
      "title,description,category,severity\r\nA windows CRLF incident title here,Description of incident that spans enough characters to pass validation checks.,bias,high\r\n";
    const { rows } = parseIncidentCSV(csv, "news_curated");
    expect(rows).toHaveLength(1);
  });

  it("sets externalId auto-index when field missing in AIID", () => {
    const csv =
      "incident_id,title,description,url\n,Long enough title here for test,Long enough description here that passes the minimum validation requirement.,https://example.com";
    const { rows } = parseIncidentCSV(csv, "aiid_import");
    expect(rows[0]!.externalId).toMatch(/^aiid-/);
  });
});
