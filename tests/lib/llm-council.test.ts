import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { runLLMCouncil } from "@/lib/ai/llm-council";
import * as openrouterGateway from "@/lib/ai/openrouter-gateway";

vi.mock("@/lib/ai/openrouter-gateway", async () => {
  const actual = await vi.importActual<typeof openrouterGateway>("@/lib/ai/openrouter-gateway");
  return {
    ...actual,
    callWithFailover: vi.fn(),
  };
});

const mockUsage = { promptTokens: 50, completionTokens: 100, totalTokens: 150 };

describe("LLM Council Deliberation Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully completes all 3 stages of deliberation with structured JSON chairman synthesis", async () => {
    const mockCall = vi.mocked(openrouterGateway.callWithFailover);

    // Stage 1: 3 member opinions
    mockCall
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Model A response on safety.",
          model: "gemini-1.5-flash",
          usage: mockUsage,
          latencyMs: 120,
        },
        attemptedModels: ["google:gemini-1.5-flash"],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Model B response on safety.",
          model: "llama-3.1-70b",
          usage: mockUsage,
          latencyMs: 150,
        },
        attemptedModels: ["nvidia:meta/llama-3.1-70b-instruct"],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Model C response on safety.",
          model: "deepseek-chat",
          usage: mockUsage,
          latencyMs: 180,
        },
        attemptedModels: ["openrouter:deepseek/deepseek-chat"],
      })
      // Stage 2: 3 peer reviews
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Review A: Response A is sound.",
          model: "gemini-1.5-flash",
          usage: mockUsage,
          latencyMs: 100,
        },
        attemptedModels: ["google:gemini-1.5-flash"],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Review B: Response B is thorough.",
          model: "llama-3.1-70b",
          usage: mockUsage,
          latencyMs: 110,
        },
        attemptedModels: ["nvidia:meta/llama-3.1-70b-instruct"],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: "Review C: Response C agrees.",
          model: "deepseek-chat",
          usage: mockUsage,
          latencyMs: 130,
        },
        attemptedModels: ["openrouter:deepseek/deepseek-chat"],
      })
      // Stage 3: Chairman Synthesis
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            consensusScore: 92,
            summaryReasoning: "Strong alignment across all council members.",
            finalAnswer: "Synthesized consensus answer on safety.",
          }),
          model: "gemini-1.5-pro",
          usage: mockUsage,
          latencyMs: 300,
        },
        attemptedModels: ["google:gemini-1.5-pro"],
      });

    const result = await runLLMCouncil({
      prompt: "What are the key safety requirements for AI systems?",
    });

    expect(result.ok).toBe(true);
    expect(result.opinions).toHaveLength(3);
    expect(result.opinions[0]?.memberId).toBe("Response A");
    expect(result.opinions[0]?.response).toBe("Model A response on safety.");
    expect(result.peerReviews).toHaveLength(3);
    expect(result.synthesis.consensusScore).toBe(92);
    expect(result.synthesis.finalAnswer).toBe("Synthesized consensus answer on safety.");
    expect(result.synthesis.summaryReasoning).toBe("Strong alignment across all council members.");
  });

  it("handles Stage 1 complete failure gracefully when no models return valid responses", async () => {
    const mockCall = vi.mocked(openrouterGateway.callWithFailover);

    mockCall.mockResolvedValue({
      ok: false,
      error: { code: "timeout", message: "Timeout", model: "gemini-1.5-flash" },
      attemptedModels: ["google:gemini-1.5-flash"],
    });

    const result = await runLLMCouncil({
      prompt: "Test query",
    });

    expect(result.ok).toBe(false);
    expect(result.opinions).toHaveLength(0);
    expect(result.peerReviews).toHaveLength(0);
    expect(result.synthesis.consensusScore).toBe(0);
    expect(result.error).toContain("Stage 1 failed");
  });

  it("handles Chairman synthesis raw text fallback gracefully when JSON parsing fails", async () => {
    const mockCall = vi.mocked(openrouterGateway.callWithFailover);

    // Stage 1 opinion
    mockCall.mockResolvedValueOnce({
      ok: true,
      data: { content: "Opinion 1", model: "gemini-1.5-flash", usage: mockUsage, latencyMs: 100 },
      attemptedModels: ["google:gemini-1.5-flash"],
    });

    // Stage 2 review
    mockCall.mockResolvedValueOnce({
      ok: true,
      data: { content: "Review 1", model: "gemini-1.5-flash", usage: mockUsage, latencyMs: 100 },
      attemptedModels: ["google:gemini-1.5-flash"],
    });

    // Stage 3 Chairman non-JSON response
    mockCall.mockResolvedValueOnce({
      ok: true,
      data: {
        content: "This is a plain text synthesis without JSON.",
        model: "gemini-1.5-pro",
        usage: mockUsage,
        latencyMs: 200,
      },
      attemptedModels: ["google:gemini-1.5-pro"],
    });

    const result = await runLLMCouncil({
      prompt: "Test query",
      memberChains: [openrouterGateway.TRIAGE_SLOT_1_CHAIN],
    });

    expect(result.ok).toBe(true);
    expect(result.synthesis.finalAnswer).toBe("This is a plain text synthesis without JSON.");
    expect(result.synthesis.consensusScore).toBe(75);
  });
});
