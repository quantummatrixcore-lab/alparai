import { vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

afterEach(async () => {
  vi.unstubAllEnvs();
  if (typeof document !== "undefined") {
    try {
      const { cleanup } = await import("@testing-library/react");
      cleanup();
    } catch (_) {}
    document.body.innerHTML = "";
  }
});


