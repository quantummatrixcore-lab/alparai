
import { test, vi, expect } from "vitest";

test("mock update", () => {
  const mockUpdateChain: { eq?: ReturnType<typeof vi.fn> } = {};
  const mockUpdateEq = vi.fn().mockImplementation(() => mockUpdateChain);
  const mockUpdate = vi.fn().mockImplementation(() => mockUpdateChain);

  mockUpdateChain.eq = mockUpdateEq;

  const result = mockUpdate();
  expect(result).toBeDefined();
  expect(result.eq).toBeDefined();
});

