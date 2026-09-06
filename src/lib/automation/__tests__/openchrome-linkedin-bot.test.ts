import { describe, expect, it, vi } from "vitest";
import {
  type LinkedInBotResult,
  type LinkedInOutreachContact,
  runLinkedInOutreachBot,
} from "../openchrome-linkedin-bot";

vi.mock("ws", async () => {
  const { EventEmitter } = await import("events");

  class MockCDPWebSocket extends EventEmitter {
    static instances: MockCDPWebSocket[] = [];
    constructor(public url: string) {
      super();
      MockCDPWebSocket.instances.push(this);
      setTimeout(() => this.emit("open"), 10);
    }
    send(data: string) {
      const parsed = JSON.parse(data);
      if (parsed.id === 100) {
        // Mock Page.navigate response with frameId
        setTimeout(() => {
          this.emit(
            "message",
            Buffer.from(JSON.stringify({ id: 100, result: { frameId: "frame-123" } })),
          );
        }, 10);
      } else if (parsed.id === 101) {
        // Mock Runtime.evaluate response with post-send verified DOM signals
        setTimeout(() => {
          this.emit(
            "message",
            Buffer.from(
              JSON.stringify({
                id: 101,
                result: { result: { value: { connected: true, messageSent: true } } },
              }),
            ),
          );
        }, 10);
      }
    }
    close() {
      this.emit("close");
    }
  }

  return { default: MockCDPWebSocket };
});

describe("openchrome-linkedin-bot", () => {
  const sampleContacts: LinkedInOutreachContact[] = [
    {
      id: "1",
      fullName: "Yann LeCun",
      title: "VP & Chief AI Scientist, Meta",
      profileUrl: "https://www.linkedin.com/in/yann-lecun",
      messageTemplate: "Hi Yann, love to connect!",
      status: "to_add",
    },
    {
      id: "2",
      fullName: "Demis Hassabis",
      title: "CEO, Google DeepMind",
      profileUrl: "https://www.linkedin.com/in/demishassabis",
      status: "skipped",
    },
  ];

  it("runs gracefully in dry-run mode when CDP endpoint is unreachable", async () => {
    const result: LinkedInBotResult = await runLinkedInOutreachBot(
      sampleContacts,
      "http://127.0.0.1:99999",
    );

    expect(result.processedCount).toBe(2);
    expect(result.navigatedCount).toBe(0);
    expect(result.connectedCount).toBe(0);
    expect(result.messageSentCount).toBe(0);
    expect(result.skippedCount).toBe(2);
    expect(result.logs.some((l) => l.includes("CDP port http://127.0.0.1:99999 unavailable"))).toBe(
      true,
    );
  });

  it("correctly calculates metrics when all contacts are skipped", async () => {
    const skippedContacts: LinkedInOutreachContact[] = [
      {
        id: "3",
        fullName: "Sam Altman",
        title: "CEO, OpenAI",
        profileUrl: "https://www.linkedin.com/in/samaltman",
        status: "skipped",
      },
    ];

    const result = await runLinkedInOutreachBot(skippedContacts, "http://127.0.0.1:99999");

    expect(result.processedCount).toBe(1);
    expect(result.navigatedCount).toBe(0);
    expect(result.connectedCount).toBe(0);
    expect(result.messageSentCount).toBe(0);
    expect(result.skippedCount).toBe(1);
  });

  it("executes real CDP WebSocket cycle and computes connectedCount & messageSentCount correctly", async () => {
    // Mock global fetch for CDP port 9222 active tab response
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { type: "page", webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/page/1" },
      ],
    } as unknown as Response);

    try {
      const activeContacts: LinkedInOutreachContact[] = [
        {
          id: "10",
          fullName: "Geoffrey Hinton",
          title: "Turing Award Winner",
          profileUrl: "https://www.linkedin.com/in/geoffreyhinton",
          messageTemplate: "Hello Geoffrey!",
          status: "to_add",
        },
      ];

      const result = await runLinkedInOutreachBot(activeContacts, "http://127.0.0.1:9222");

      expect(result.processedCount).toBe(1);
      expect(result.navigatedCount).toBe(1);
      expect(result.connectedCount).toBe(1);
      expect(result.messageSentCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(
        result.logs.some((l) => l.includes("Connection request & customized note transmitted")),
      ).toBe(true);
    } finally {
      global.fetch = origFetch;
    }
  });
});
