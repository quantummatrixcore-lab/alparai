/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

const mockAdminClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockAdminClient,
}));

const { callWithFailoverMock, generateImageMock, generateHfImageMock } = vi.hoisted(() => ({
  callWithFailoverMock: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      content: JSON.stringify({
        x_post: "This is a tweet about the AI incident.",
        linkedin_post: "This is a LinkedIn post about the AI incident.",
        image_prompt: "An artistic high-quality 3D render of AI failure.",
      }),
    },
  }),
  generateImageMock: vi.fn().mockResolvedValue({
    ok: true,
    base64: "dGVzdC1iYXNlNjQ=",
    mimeType: "image/png",
  }),
  generateHfImageMock: vi.fn().mockResolvedValue({
    ok: false,
    error: "HUGGINGFACE_API_KEY is not configured.",
  }),
}));

vi.mock(
  "@/lib/ai/openrouter-gateway",
  async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      callWithFailover: () => callWithFailoverMock(),
    };
  },
);

vi.mock("@/lib/ai/adapters/vertex-imagen", () => ({
  VertexImagenAdapter: vi.fn().mockImplementation(() => ({
    generateImage: generateImageMock,
  })),
}));

vi.mock("@/lib/ai/adapters/huggingface", () => ({
  HuggingFaceAdapter: vi.fn().mockImplementation(() => ({
    generateImage: generateHfImageMock,
  })),
}));

import { publishToX } from "@/lib/marketing/publishers/x";
import { publishToLinkedIn } from "@/lib/marketing/publishers/linkedin";
import { generateMarketingAssets, generateNewsSocialPosts } from "@/lib/marketing/content-engine";

describe("Marketing Content Engine & Publishers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("X_API_KEY", "");
    vi.stubEnv("X_API_KEY_SECRET", "");
    vi.stubEnv("X_ACCESS_TOKEN", "");
    vi.stubEnv("X_ACCESS_TOKEN_SECRET", "");
    vi.stubEnv("LINKEDIN_ACCESS_TOKEN", "");
    vi.stubEnv("LINKEDIN_ORGANIZATION_ID", "");
  });

  describe("publishToX", () => {
    it("returns error when credentials are missing", async () => {
      const res = await publishToX("test post");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Missing API credentials");
    });

    it("returns success when credentials are set", async () => {
      vi.stubEnv("X_API_KEY", "key");
      vi.stubEnv("X_API_KEY_SECRET", "secret");
      vi.stubEnv("X_ACCESS_TOKEN", "token");
      vi.stubEnv("X_ACCESS_TOKEN_SECRET", "token-secret");

      const res = await publishToX("test post");
      expect(res.success).toBe(true);
      expect(res.postId).toBeDefined();
    });
  });

  describe("publishToLinkedIn", () => {
    it("returns error when credentials are missing", async () => {
      const res = await publishToLinkedIn("test post", "title");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Missing API credentials");
    });

    it("returns success when credentials are set", async () => {
      vi.stubEnv("LINKEDIN_ACCESS_TOKEN", "token");
      vi.stubEnv("LINKEDIN_ORGANIZATION_ID", "org-123");

      const res = await publishToLinkedIn("test post", "title");
      expect(res.success).toBe(true);
      expect(res.shareId).toBeDefined();
    });
  });

  describe("generateMarketingAssets", () => {
    it("generates drafts and image asset successfully via Hugging Face", async () => {
      generateHfImageMock.mockResolvedValueOnce({
        ok: true,
        base64: "dGVzdC1iYXNlNjQ=",
        mimeType: "image/png",
      });
      // Mock Supabase Database calls
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        single: () =>
          Promise.resolve({
            data: {
              id: "inc-123",
              title_masked: "AI Medical Hallucination",
              description_masked: "The chatbot suggested a lethal cure.",
              category: "hallucination",
              severity: "critical",
              eu_act_risk_category: "High-Risk",
            },
            error: null,
          }),
        insert: () => Promise.resolve({ error: null }),
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://public.url/img.png" } }),
      };

      mockAdminClient.from.mockImplementation(() => builder);
      (mockAdminClient as any).storage = {
        from: () => builder,
      };

      const success = await generateMarketingAssets("inc-123");
      expect(success).toBe(true);
    });

    it("falls back to Vertex Imagen if Hugging Face fails", async () => {
      generateHfImageMock.mockResolvedValueOnce({
        ok: false,
        error: "HF API Overloaded",
      });
      generateImageMock.mockResolvedValueOnce({
        ok: true,
        base64: "dGVzdC1iYXNlNjQ=",
        mimeType: "image/jpeg",
      });
      // Mock Supabase Database calls
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        single: () =>
          Promise.resolve({
            data: {
              id: "inc-123",
              title_masked: "AI Medical Hallucination",
              description_masked: "The chatbot suggested a lethal cure.",
              category: "hallucination",
              severity: "critical",
              eu_act_risk_category: "High-Risk",
            },
            error: null,
          }),
        insert: () => Promise.resolve({ error: null }),
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://public.url/img.png" } }),
      };

      mockAdminClient.from.mockImplementation(() => builder);
      (mockAdminClient as any).storage = {
        from: () => builder,
      };

      const success = await generateMarketingAssets("inc-123");
      expect(success).toBe(true);
    });

    it("returns false if incident details fetch fails", async () => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        single: () => Promise.resolve({ data: null, error: new Error("DB error") }),
      };
      mockAdminClient.from.mockImplementation(() => builder);

      const success = await generateMarketingAssets("inc-invalid");
      expect(success).toBe(false);
    });
  });

  describe("generateNewsSocialPosts", () => {
    it("generates news social post drafts successfully", async () => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        single: () =>
          Promise.resolve({
            data: {
              id: "news-123",
              title_en: "AI Safety Regulation",
              summary_en: "The EU passes new rules for AI systems.",
              category: "news",
              severity: "medium",
            },
            error: null,
          }),
        insert: () => Promise.resolve({ error: null }),
      };
      mockAdminClient.from.mockImplementation(() => builder);

      const success = await generateNewsSocialPosts("news-123");
      expect(success).toBe(true);
    });

    it("returns false if news details fetch fails", async () => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        single: () => Promise.resolve({ data: null, error: new Error("DB error") }),
      };
      mockAdminClient.from.mockImplementation(() => builder);

      const success = await generateNewsSocialPosts("news-invalid");
      expect(success).toBe(false);
    });
  });
});
