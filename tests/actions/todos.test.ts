import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireCEO: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { requireCEO } from "@/lib/auth/session";
import { toggleTodoAction, deleteTodoAction, createTodoAction } from "@/actions/todos";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
const mockCeo = createTestUser({ role: "ceo", id: "ceo-123" });

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
  vi.mocked(requireCEO).mockResolvedValue(mockCeo as never);
});

describe("toggleTodoAction", () => {
  it("toggles a todo to completed", async () => {
    const result = await toggleTodoAction("todo-1", true);
    expect(result.success).toBe(true);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_todos");
    expect(mockSupabaseClient._mocks.mockUpdate).toHaveBeenCalled();
  });

  it("toggles a todo to incomplete", async () => {
    const result = await toggleTodoAction("todo-1", false);
    expect(result.success).toBe(true);
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: { message: "DB Error" } });
    await expect(toggleTodoAction("todo-1", true)).rejects.toThrow("DB Error");
  });

  it("throws if requireCEO fails", async () => {
    vi.mocked(requireCEO).mockRejectedValue(new Error("Unauthorized"));
    await expect(toggleTodoAction("todo-1", true)).rejects.toThrow("Unauthorized");
  });
});

describe("deleteTodoAction", () => {
  it("deletes a todo by id", async () => {
    const result = await deleteTodoAction("todo-1");
    expect(result.success).toBe(true);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_todos");
    expect(mockSupabaseClient._mocks.mockDelete).toHaveBeenCalled();
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockDeleteEq.mockResolvedValue({
      error: { message: "Delete Failed" },
    });
    await expect(deleteTodoAction("todo-1")).rejects.toThrow("Delete Failed");
  });
});

describe("createTodoAction", () => {
  it("creates a new todo successfully", async () => {
    mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: { id: "todo-new" },
      error: null,
    });
    const result = await createTodoAction("New task", 1);
    expect(result.success).toBe(true);
    expect(result.id).toBe("todo-new");
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("strategy_todos");
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: null,
      error: { message: "Insert Failed" },
    });
    await expect(createTodoAction("Fail task", 1)).rejects.toThrow("Insert Failed");
  });
});
