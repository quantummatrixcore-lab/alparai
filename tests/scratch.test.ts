
import { test, vi, expect } from "vitest";

test("mock update", () => {
  const mockUpdateChain = {} as any;
  const mockUpdateEq = vi.fn().mockImplementation(() => mockUpdateChain);
  const mockUpdate = vi.fn().mockImplementation(() => mockUpdateChain);
  
  mockUpdateChain.eq = mockUpdateEq;

  const result = mockUpdate();
  console.log("RESULT:", result);
  expect(result).toBeDefined();
  expect(result.eq).toBeDefined();
});

