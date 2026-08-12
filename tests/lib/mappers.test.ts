import { describe, it, expect } from "vitest";
import { toIncidentListItem, toIncidentListItems } from "@/lib/mappers";

describe("mappers", () => {
  describe("toIncidentListItem", () => {
    it("should correctly map a complete raw incident row", () => {
      const rawRow = {
        id: "incident-1",
        title_masked: "Masked Title",
        title: "Original Title",
        title_tr: "Turkish Title",
        description_masked: "Masked Description",
        description: "Original Description",
        description_tr: "Turkish Description",
        severity: "high",
        status: "verified",
        category: "bias",
        is_anonymous: true,
        incident_date: "2026-06-24",
        created_at: "2026-06-23",
        views_count: 10,
        upvotes_count: 5,
        comments_count: 2,
        shares_count: 4,
        provider_name: "OpenAI",
        provider_slug: "openai",
        user_id: "user-123",
        author_name: "John Doe",
        ai_provider_id: "openai-provider",
        cross_audit_truth_score: 85,
        cross_audit_confidence: 90,
        affected_users_count: 1000,
        is_expert: true,
        expert_fix: "Perform data sanitation",
      };

      const result = toIncidentListItem(rawRow);

      expect(result).toEqual({
        id: "incident-1",
        title_masked: "Masked Title",
        description_masked: "Masked Description",
        title_tr: "Turkish Title",
        description_tr: "Turkish Description",
        translated_title: null,
        translated_description: null,
        machine_translated: false,
        severity: "high",
        status: "verified",
        category: "bias",
        is_anonymous: true,
        incident_date: "2026-06-24",
        created_at: "2026-06-23",
        view_count: 10,
        vote_count: 5,
        evidence_count: 2,
        shares_count: 4,
        author_name: "John Doe",
        provider_name: "OpenAI",
        provider_slug: "openai",
        cross_audit_truth_score: 85,
        cross_audit_confidence: 90,
        affected_count: 1000,
        is_expert: true,
        expert_fix: "Perform data sanitation",
        incident_source: undefined,
        processing_stage: undefined,
      });
    });

    it("should handle missing optional fields with default values", () => {
      const rawRow = {
        id: "incident-2",
      };

      const result = toIncidentListItem(rawRow);

      expect(result).toEqual({
        id: "incident-2",
        title_masked: "",
        description_masked: "",
        title_tr: null,
        description_tr: null,
        translated_title: null,
        translated_description: null,
        machine_translated: false,
        severity: undefined,
        status: undefined,
        category: undefined,
        is_anonymous: false,
        incident_date: "",
        created_at: "",
        view_count: 0,
        vote_count: 0,
        evidence_count: 0,
        shares_count: 0,
        author_name: null,
        provider_name: "",
        provider_slug: "",
        cross_audit_truth_score: null,
        cross_audit_confidence: null,
        affected_count: 0,
        is_expert: false,
        expert_fix: null,
        incident_source: undefined,
        processing_stage: undefined,
      });
    });

    it("should fall back to title and description when masked equivalents are missing", () => {
      const rawRow = {
        id: "incident-3",
        title: "Fallback Title",
        description: "Fallback Description",
      };

      const result = toIncidentListItem(rawRow);

      expect(result.title_masked).toBe("Fallback Title");
      expect(result.description_masked).toBe("Fallback Description");
    });

    it("should fall back to created_at for incident_date if incident_date is missing", () => {
      const rawRow = {
        id: "incident-4",
        created_at: "2026-06-22",
      };

      const result = toIncidentListItem(rawRow);

      expect(result.incident_date).toBe("2026-06-22");
    });
  });

  describe("toIncidentListItems", () => {
    it("should return empty array if rows is not an array", () => {
      expect(toIncidentListItems(null)).toEqual([]);
      expect(toIncidentListItems({})).toEqual([]);
      expect(toIncidentListItems("not-an-array")).toEqual([]);
    });

    it("should map array of raw rows", () => {
      const rawRows = [
        { id: "1", title: "Incident 1" },
        { id: "2", title: "Incident 2" },
      ];

      const result = toIncidentListItems(rawRows);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("1");
      expect(result[0]?.title_masked).toBe("Incident 1");
      expect(result[1]?.id).toBe("2");
      expect(result[1]?.title_masked).toBe("Incident 2");
    });
  });
});
