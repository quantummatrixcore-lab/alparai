import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient, createTestUser } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireCEO: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/dehost/server";
import { requireCEO } from "@/lib/auth/session";
import { toggleTodoAction, deleteTodoAction, createTodoAction } from "@/actions/todos";

let mockDeHostClient: ReturnType<typeof createMockDeHostClient>;
const mockCeo = createTestUser({ role: "ceo", id: "ceo-123" });

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHostClient = createMockDeHostClient();
  vi.mocked(createServerClient).mockResolvedValue(mockDeHostClient as never);
  vi.mocked(requireCEO).mockResolvedValue(mockCeo as never);
});

describe("toggleTodoAction", () => {
  it("toggles a strategy task to completed", async () => {
    const result = await toggleTodoAction("strat-task-1", true);
    expect(result.success).toBe(true);
    expect(mockDeHostClient.from).toHaveBeenCalledWith("strategy_todos");
    expect(mockDeHostClient._mocks.mockUpdate).toHaveBeenCalled();
  });

  it("toggles a strategy task to incomplete", async () => {
    const result = await toggleTodoAction("strat-task-1", false);
    expect(result.success).toBe(true);
  });

  it("throws on db error", async () => {
    mockDeHostClient._mocks.mockUpdateEq.mockResolvedValue({ error: { message: "DB Error" } });
    await expect(toggleTodoAction("strat-task-1", true)).rejects.toThrow("DB Error");
  });

  it("throws if requireCEO fails", async () => {
    vi.mocked(requireCEO).mockRejectedValue(new Error("Unauthorized"));
    await expect(toggleTodoAction("strat-task-1", true)).rejects.toThrow("Unauthorized");
  });
});

describe("deleteTodoAction", () => {
  it("deletes a strategy task by id", async () => {
    const result = await deleteTodoAction("strat-task-1");
    expect(result.success).toBe(true);
    expect(mockDeHostClient.from).toHaveBeenCalledWith("strategy_todos");
    expect(mockDeHostClient._mocks.mockDelete).toHaveBeenCalled();
  });

  it("throws on db error", async () => {
    mockDeHostClient._mocks.mockDeleteEq.mockResolvedValue({
      error: { message: "Delete Failed" },
    });
    await expect(deleteTodoAction("strat-task-1")).rejects.toThrow("Delete Failed");
  });
});

describe("createTodoAction", () => {
  it("creates a new strategy task successfully", async () => {
    mockDeHostClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: { id: "strat-task-new" },
      error: null,
    });
    const result = await createTodoAction("New task", 1);
    expect(result.success).toBe(true);
    expect(result.id).toBe("strat-task-new");
    expect(mockDeHostClient.from).toHaveBeenCalledWith("strategy_todos");
  });

  it("throws on db error", async () => {
    mockDeHostClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: null,
      error: { message: "Insert Failed" },
    });
    await expect(createTodoAction("Fail task", 1)).rejects.toThrow("Insert Failed");
  });
});
