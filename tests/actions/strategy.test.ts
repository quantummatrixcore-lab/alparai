import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireCEO: vi.fn(),
    requireAdvisor: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { requireCEO } from "@/lib/auth/session";
import {
  upsertSwotItemAction,
  deleteSwotItemAction,
  upsertRiskAction,
  deleteRiskAction,
  saveValuationAction,
  upsertMilestoneAction,
  deleteMilestoneAction,
  createMetricsSnapshotAction,
} from "@/actions/strategy";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
const mockCeo = createTestUser({ role: "ceo", id: "ceo-123" });

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
  vi.mocked(requireCEO).mockResolvedValue(mockCeo as never);
});

describe("SWOT Actions", () => {
  describe("upsertSwotItemAction", () => {
    it("inserts a new SWOT item when no ID is provided", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "swot-new" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      const result = await upsertSwotItemAction({
        category: "strength",
        title: "Test Strength",
        description: "Test Desc",
        weight: "high",
        action_plan: "Test Plan",
        target_date: "2026-12-31",
        status: "active",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("swot-new");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_swot_items");
      expect(mockInsert).toHaveBeenCalled();
    });

    it("updates an existing SWOT item when ID is provided", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "swot-1" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
      } as never);

      const result = await upsertSwotItemAction({
        id: "swot-1",
        category: "weakness",
        title: "Updated Weakness",
        description: "Updated Desc",
        weight: "medium",
        action_plan: "Updated Plan",
        target_date: "2026-12-31",
        status: "active",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("swot-1");
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "swot-1");
    });

    it("throws error when db insert fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "DB Error" } });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      await expect(
        upsertSwotItemAction({
          category: "threat",
          title: "Test Threat",
          description: null,
          weight: "low",
          action_plan: null,
          target_date: null,
          status: "active",
        }),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("deleteSwotItemAction", () => {
    it("deletes SWOT item by ID", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete,
      } as never);

      const result = await deleteSwotItemAction("swot-1");
      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "swot-1");
    });

    it("throws error on delete db failure", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: "Delete Failed" } });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete,
      } as never);

      await expect(deleteSwotItemAction("swot-1")).rejects.toThrow("Delete Failed");
    });
  });
});

describe("Risk Actions", () => {
  describe("upsertRiskAction", () => {
    it("inserts a new risk successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "risk-new" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      const result = await upsertRiskAction({
        code: "R1",
        title: "Security Risk",
        description: "Desc",
        probability: 3,
        impact: 4,
        mitigation_plan: "Mitigate",
        target_date: null,
        status: "active",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("risk-new");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_risks");
    });

    it("updates an existing risk successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "risk-1" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
      } as never);

      const result = await upsertRiskAction({
        id: "risk-1",
        code: "R1",
        title: "Updated Security Risk",
        description: "Desc",
        probability: 2,
        impact: 5,
        mitigation_plan: "Mitigate harder",
        target_date: "2026-10-10",
        status: "mitigated",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("risk-1");
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("deleteRiskAction", () => {
    it("deletes risk by ID", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete,
      } as never);

      const result = await deleteRiskAction("risk-1");
      expect(result.success).toBe(true);
    });
  });
});

describe("Valuation Actions", () => {
  describe("saveValuationAction", () => {
    it("inserts a new valuation successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "val-123" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      const result = await saveValuationAction({
        method: "vc",
        inputs: { test: 123 },
        result_pre_money: 5000000,
        notes: "Test Notes",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("val-123");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_valuations");
    });
  });
});

describe("Milestone / Roadmap Actions", () => {
  describe("upsertMilestoneAction", () => {
    it("inserts a new milestone successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "ms-new" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      const result = await upsertMilestoneAction({
        quarter: "2026-Q3",
        title: "Test Milestone",
        okr_text: "Okr",
        progress: 50,
        status: "in_progress",
        linked_metric: "users",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("ms-new");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_milestones");
    });

    it("updates an existing milestone successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "ms-1" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
      } as never);

      const result = await upsertMilestoneAction({
        id: "ms-1",
        quarter: "2026-Q3",
        title: "Updated Milestone",
        okr_text: "Okr",
        progress: 100,
        status: "done",
        linked_metric: "users",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("ms-1");
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("deleteMilestoneAction", () => {
    it("deletes milestone successfully", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete,
      } as never);

      const result = await deleteMilestoneAction("ms-1");
      expect(result.success).toBe(true);
    });
  });
});

describe("Metrics Snapshot Actions", () => {
  describe("createMetricsSnapshotAction", () => {
    it("creates a new metrics snapshot successfully", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "snap-1" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      } as never);

      const result = await createMetricsSnapshotAction({
        total_users: 1000,
        total_incidents: 100,
        active_providers: 10,
        media_mentions_count: 5,
        mrr_cents: 0,
        runway_months: 12,
        health_score: 95,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("snap-1");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_metrics_snapshots");
    });
  });
});
