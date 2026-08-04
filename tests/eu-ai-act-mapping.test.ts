import { describe, it, expect } from "vitest";
import { EU_TAXONOMY_MAP } from "@/lib/import/csv-parser";

describe("EU AI Act Taxonomy Mapping", () => {
  it("maps bias category correctly as High Risk", () => {
    const mapping = EU_TAXONOMY_MAP["bias"];
    expect(mapping.riskCategory).toBe("High Risk");
    expect(mapping.seriousIncidentClass).toBe("fundamental-rights");
    expect(mapping.highRiskSystemCategory).toBe("services");
    expect(mapping.reportingDeadlineDays).toBe(15);
  });

  it("maps privacy category correctly as High Risk", () => {
    const mapping = EU_TAXONOMY_MAP["privacy"];
    expect(mapping.riskCategory).toBe("High Risk");
    expect(mapping.seriousIncidentClass).toBe("fundamental-rights");
    expect(mapping.highRiskSystemCategory).toBeNull();
    expect(mapping.reportingDeadlineDays).toBe(15);
  });

  it("maps security category correctly as High Risk with shorter deadline", () => {
    const mapping = EU_TAXONOMY_MAP["security"];
    expect(mapping.riskCategory).toBe("High Risk");
    expect(mapping.seriousIncidentClass).toBe("critical-infrastructure");
    expect(mapping.highRiskSystemCategory).toBe("infrastructure");
    expect(mapping.reportingDeadlineDays).toBe(10);
  });

  it("maps manipulation category correctly as Prohibited/Unacceptable Risk", () => {
    const mapping = EU_TAXONOMY_MAP["manipulation"];
    expect(mapping.riskCategory).toBe("Unacceptable Risk");
    expect(mapping.seriousIncidentClass).toBe("fundamental-rights");
    expect(mapping.reportingDeadlineDays).toBe(15);
  });

  it("maps misinformation category correctly as Specific Transparency", () => {
    const mapping = EU_TAXONOMY_MAP["misinformation"];
    expect(mapping.riskCategory).toBe("Specific Transparency");
    expect(mapping.seriousIncidentClass).toBe("fundamental-rights");
    expect(mapping.reportingDeadlineDays).toBe(15);
  });

  it("maps copyright category correctly as Minimal Risk", () => {
    const mapping = EU_TAXONOMY_MAP["copyright"];
    expect(mapping.riskCategory).toBe("Minimal");
    expect(mapping.seriousIncidentClass).toBeNull();
    expect(mapping.reportingDeadlineDays).toBeNull();
  });

  it("maps other category correctly as Minimal Risk", () => {
    const mapping = EU_TAXONOMY_MAP["other"];
    expect(mapping.riskCategory).toBe("Minimal");
    expect(mapping.seriousIncidentClass).toBeNull();
    expect(mapping.reportingDeadlineDays).toBeNull();
  });
});
