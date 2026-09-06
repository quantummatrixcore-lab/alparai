import { describe, expect, it, vi } from "vitest";
import { GRANT_PORTAL_CATALOG, verifyGrantPortalsViaCDP } from "../grant-portal-verifier";

vi.mock("ws", async () => {
  const { EventEmitter } = await import("events");

  class MockGrantWebSocket extends EventEmitter {
    static instances: MockGrantWebSocket[] = [];
    constructor(public url: string) {
      super();
      MockGrantWebSocket.instances.push(this);
      setTimeout(() => this.emit("open"), 10);
    }
    send(data: string) {
      const parsed = JSON.parse(data);
      if (parsed.method === "Page.navigate") {
        setTimeout(() => {
          this.emit(
            "message",
            Buffer.from(JSON.stringify({ id: parsed.id, result: { frameId: "frame-grant-1" } })),
          );
        }, 10);
      }
    }
    close() {
      this.emit("close");
    }
  }

  return { default: MockGrantWebSocket };
});

describe("grant-portal-verifier", () => {
  it("contains exactly 8 eligible portals and 1 excluded portal in catalog", () => {
    const eligible = GRANT_PORTAL_CATALOG.filter((p) => p.isEligible);
    const excluded = GRANT_PORTAL_CATALOG.filter((p) => !p.isEligible);

    expect(eligible).toHaveLength(8);
    expect(excluded).toHaveLength(1);
    expect(excluded[0]?.id).toBe("yz-fabrikasi");
  });

  it("returns unreachable status for eligible portals when CDP port is unavailable", async () => {
    const result = await verifyGrantPortalsViaCDP("http://127.0.0.1:99999");
    expect(result).toHaveLength(9);

    const unreachable = result.filter((r) => r.status === "unreachable");
    const excluded = result.filter((r) => r.status === "excluded");

    expect(unreachable).toHaveLength(8);
    expect(excluded).toHaveLength(1);
  });

  it("executes real WebSocket CDP cycle and returns verified status for eligible portals", async () => {
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { type: "page", webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/page/grant-1" },
      ],
    } as unknown as Response);

    try {
      const result = await verifyGrantPortalsViaCDP("http://127.0.0.1:9222");
      expect(result).toHaveLength(9);

      const verified = result.filter((r) => r.status === "verified");
      const excluded = result.filter((r) => r.status === "excluded");

      expect(verified).toHaveLength(8);
      expect(excluded).toHaveLength(1);
    } finally {
      global.fetch = origFetch;
    }
  });
});
