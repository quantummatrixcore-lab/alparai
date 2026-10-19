import { afterAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  matchProviderAlias,
  appendAliasMapping,
  resetAliasCache,
} from "@/lib/import/provider-alias-map";
import {
  judgeProviderAttribution,
  parseJudgeResponse,
} from "@/lib/import/provider-attribution-judge";

describe("WO-014 Provider Attribution Engine", () => {
  const mockProviders = new Map([
    ["openai", { id: "p-openai", slug: "openai", name: "OpenAI" }],
    ["anthropic", { id: "p-anthropic", slug: "anthropic", name: "Anthropic" }],
    ["google", { id: "p-google", slug: "google", name: "Google" }],
    ["meta", { id: "p-meta", slug: "meta", name: "Meta" }],
    ["microsoft", { id: "p-microsoft", slug: "microsoft", name: "Microsoft" }],
    ["xai", { id: "p-xai", slug: "xai", name: "xAI" }],
    ["mistral", { id: "p-mistral", slug: "mistral", name: "Mistral AI" }],
    ["stability", { id: "p-stability", slug: "stability", name: "Stability AI" }],
    ["deepseek", { id: "p-deepseek", slug: "deepseek", name: "DeepSeek" }],
    ["alibaba", { id: "p-alibaba", slug: "alibaba", name: "Alibaba" }],
    ["baidu", { id: "p-baidu", slug: "baidu", name: "Baidu" }],
    ["amazon", { id: "p-amazon", slug: "amazon", name: "Amazon" }],
    ["jina", { id: "p-jina", slug: "jina", name: "Jina AI" }],
    ["cohere", { id: "p-cohere", slug: "cohere", name: "Cohere" }],
    ["perplexity", { id: "p-perplexity", slug: "perplexity", name: "Perplexity" }],
    ["character-ai", { id: "p-cai", slug: "character-ai", name: "Character.ai" }],
    ["runway", { id: "p-runway", slug: "runway", name: "Runway" }],
    ["pika", { id: "p-pika", slug: "pika", name: "Pika" }],
    ["midjourney", { id: "p-midjourney", slug: "midjourney", name: "Midjourney" }],
    ["inflection", { id: "p-inflection", slug: "inflection", name: "Inflection AI" }],
    ["poe", { id: "p-poe", slug: "poe", name: "Poe" }],
  ]);

  describe("1. Alias map expansion & deterministic mapping", () => {
    const testCases: [string, string, string][] = [
      ["chatgpt hallucinated legal brief", "openai", "chatgpt"],
      ["claude refused prompt injection", "anthropic", "claude"],
      ["gemini produced biased image", "google", "gemini"],
      ["llama weights leaked on torrent", "meta", "llama"],
      ["copilot auto-suggested proprietary code", "microsoft", "copilot"],
      ["grok generated controversial commentary", "xai", "grok"],
      ["mistral model breached privacy", "mistral", "mistral"],
      ["midjourney generated deepfake image", "midjourney", "midjourney"],
      ["deepseek suffered denial of service", "deepseek", "deepseek"],
      ["qwen model was jailbroken", "alibaba", "qwen"],
      ["ernie bot censored historical facts", "baidu", "ernie"],
      ["titan model degraded in benchmark", "amazon", "titan"],
      ["nova model hallucinated instructions", "amazon", "nova"],
      ["jina embedding model exposed tokens", "jina", "jina"],
      ["cohere command model failed audit", "cohere", "cohere"],
      ["perplexity cited non-existent URLs", "perplexity", "perplexity"],
      ["character-ai chatbot harassed minor", "character-ai", "character-ai"],
      ["runway generated unlicensed video", "runway", "runway"],
      ["pika generated copyrighted animation", "pika", "pika"],
    ];

    testCases.forEach(([title, expectedSlug, expectedKeyword]) => {
      it(`resolves "${title}" to provider slug "${expectedSlug}" with keyword "${expectedKeyword}"`, () => {
        const result = matchProviderAlias(
          { title, description: "Detailed test incident scenario", sourceUrl: null },
          mockProviders,
        );
        expect(result.matched).toBe(true);
        expect(result.providerSlug).toBe(expectedSlug);
        expect(result.providerId).toBe(mockProviders.get(expectedSlug)?.id);
        expect(result.attributionMethod).toBe("alias");
        expect(result.attributionKeyword?.toLowerCase()).toBe(expectedKeyword.toLowerCase());
        expect(result.needsProviderReview).toBe(false);
      });
    });
  });

  describe("1b. Ambiguity gate (generic tokens require an AI/model context)", () => {
    it("does not attribute a generic token without an AI context hint", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "Titan deployment was unstable during the migration window",
          description: "The infrastructure rollout caused a brief outage for internal tooling.",
          sourceUrl: null,
        },
        mockProviders,
      );
      expect(result.matched).toBe(false);
      expect(result.needsProviderReview).toBe(true);
    });

    it("does not attribute the token 'pi' used in a non-AI context", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "Company reported a 3.14 pi cost increase in raw material budget",
          description: "Quarterly finance report discussing unit economics and supply chain.",
          sourceUrl: null,
        },
        mockProviders,
      );
      expect(result.matched).toBe(false);
    });

    it("does not attribute 'quora' to Poe (Quora is an unrelated company)", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "Quora moderation policy dispute escalates",
          description: "The Q&A platform updated its community guidelines.",
          sourceUrl: null,
        },
        mockProviders,
      );
      expect(result.matched).toBe(false);
    });

    it("still attributes a generic token when an AI context hint is present", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "Titan model degraded in benchmark",
          description: "Amazon foundation model regressed on reasoning tasks.",
          sourceUrl: null,
        },
        mockProviders,
      );
      expect(result.matched).toBe(true);
      expect(result.providerSlug).toBe("amazon");
    });
  });

  describe("2. Four-Step Precedence Hierarchy", () => {
    it("Step 1: affectedProvider field overrides title, description, and sourceUrl", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: "Anthropic PBC",
          title: "ChatGPT incident occurred",
          description: "Google Gemini was also mentioned in passing",
          sourceUrl: "https://meta.com/ai-post",
        },
        mockProviders,
      );
      expect(result.matched).toBe(true);
      expect(result.providerSlug).toBe("anthropic");
      expect(result.attributionKeyword).toBe("anthropic");
    });

    it("Step 2: title overrides description and sourceUrl when affectedProvider is empty", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "DeepSeek API endpoint attacked",
          description: "OpenAI ChatGPT users noticed cross-chatter",
          sourceUrl: "https://google.com/security",
        },
        mockProviders,
      );
      expect(result.matched).toBe(true);
      expect(result.providerSlug).toBe("deepseek");
      expect(result.attributionKeyword).toBe("deepseek");
    });

    it("Step 3: description overrides sourceUrl when title has no match", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: "",
          title: "Major AI security breach reported in healthcare",
          description:
            "Investigators discovered that Mistral model weights were improperly secured",
          sourceUrl: "https://xai.com/news",
        },
        mockProviders,
      );
      expect(result.matched).toBe(true);
      expect(result.providerSlug).toBe("mistral");
      expect(result.attributionKeyword).toBe("mistral");
    });

    it("Step 4: sourceUrl domain matches provider when text has no keywords", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "An unexpected outage impacted users globally",
          description: "Full service disruption observed across all regions for two hours",
          sourceUrl: "https://status.perplexity.ai/incidents/10293",
        },
        mockProviders,
      );
      expect(result.matched).toBe(true);
      expect(result.providerSlug).toBe("perplexity");
      expect(result.attributionKeyword).toBe("perplexity");
    });

    it("leaves provider null and flags needsProviderReview when no matches exist", () => {
      const result = matchProviderAlias(
        {
          affectedProvider: null,
          title: "Unidentified generic algorithmic glitch",
          description: "No vendor or provider details are disclosed in this filing.",
          sourceUrl: "https://independent-news.org/article-99",
        },
        mockProviders,
      );
      expect(result.matched).toBe(false);
      expect(result.providerSlug).toBeNull();
      expect(result.providerId).toBeNull();
      expect(result.attributionMethod).toBeNull();
      expect(result.needsProviderReview).toBe(true);
    });
  });

  describe("3. Model-Judge Fallback Logic", () => {
    it("parses model JSON response accurately", () => {
      const output = parseJudgeResponse('```json\n{"provider": "openai", "confidence": 0.95}\n```');
      expect(output).toEqual({ provider: "openai", confidence: 0.95 });
    });

    it("parses model regex fallback when JSON is malformed", () => {
      const output = parseJudgeResponse(
        'Based on the text, the provider is "anthropic" with confidence: 0.88.',
      );
      expect(output).toEqual({ provider: "anthropic", confidence: 0.88 });
    });

    it("auto-assigns when confidence >= 0.8 and provider is known", async () => {
      const mockCall = vi.fn().mockResolvedValue({
        ok: true,
        data: {
          content: '{"provider": "google", "confidence": 0.85}',
          model: "qwen2.5:1.5b",
          latencyMs: 120,
        },
      });

      const res = await judgeProviderAttribution(
        {
          title: "Autonomous search engine hallucinated slander",
          description: "Search assistant displayed harmful defamatory claims",
          sourceUrl: null,
        },
        ["openai", "google", "anthropic"],
        mockProviders,
        undefined,
        mockCall,
      );

      expect(res.matched).toBe(true);
      expect(res.providerSlug).toBe("google");
      expect(res.providerId).toBe("p-google");
      expect(res.attributionMethod).toBe("model");
      expect(res.attributionConfidence).toBe(0.85);
      expect(res.needsProviderReview).toBe(false);
    });

    it("flags for human review when confidence < 0.8", async () => {
      const mockCall = vi.fn().mockResolvedValue({
        ok: true,
        data: {
          content: '{"provider": "google", "confidence": 0.65}',
          model: "qwen2.5:1.5b",
          latencyMs: 120,
        },
      });

      const res = await judgeProviderAttribution(
        {
          title: "Ambiguous AI failure report",
          description: "It might be Google or something else",
          sourceUrl: null,
        },
        ["openai", "google"],
        mockProviders,
        undefined,
        mockCall,
      );

      expect(res.matched).toBe(false);
      expect(res.providerSlug).toBeNull();
      expect(res.needsProviderReview).toBe(true);
      expect(res.attributionConfidence).toBe(0.65);
    });
  });

  describe("4. Learning Loop (appendAliasMapping)", () => {
    // Belt-and-braces: even if the temp-path redirect ever fails, the
    // committed dictionary is restored after this suite runs.
    const realPath = path.join(process.cwd(), "src", "lib", "import", "provider-aliases.json");
    let originalContent: string | null = null;
    try {
      if (fs.existsSync(realPath)) {
        originalContent = fs.readFileSync(realPath, "utf-8");
      }
    } catch {
      originalContent = null;
    }
    afterAll(() => {
      try {
        if (originalContent !== null) {
          fs.writeFileSync(realPath, originalContent, "utf-8");
        }
      } catch {
        // restore is best-effort; temp redirect is the primary guard
      }
      resetAliasCache();
    });

    it("appends a new keyword and enables future matching", async () => {
      const keyword = "test_custom_alias_token_" + Date.now();
      const slug = "anthropic";

      const before = matchProviderAlias(
        { title: `Incident with ${keyword} model`, description: "desc" },
        mockProviders,
      );
      expect(before.matched).toBe(false);

      const appended = await appendAliasMapping(keyword, slug);
      expect(appended).toBe(true);

      const after = matchProviderAlias(
        { title: `Incident with ${keyword} model`, description: "desc" },
        mockProviders,
      );
      expect(after.matched).toBe(true);
      expect(after.providerSlug).toBe("anthropic");
      expect(after.attributionKeyword).toBe(keyword);
    });
  });
});
