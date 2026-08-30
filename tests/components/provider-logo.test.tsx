import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import fs from "fs";
import path from "path";
import {
  ProviderLogo,
} from "@/components/leaderboard/provider-logo";
import {
  hasProviderIcon,
  normalizeProviderKey,
  PROVIDER_ICON_MAP,
} from "@/components/leaderboard/provider-icons";

describe("AI Provider Logos & Icons Architecture", () => {
  const topProviders = [
    { input: "openai", expectedKey: "openai" },
    { input: "OpenAI (ChatGPT)", expectedKey: "openai" },
    { input: "anthropic", expectedKey: "anthropic" },
    { input: "Anthropic (Claude)", expectedKey: "anthropic" },
    { input: "google", expectedKey: "google" },
    { input: "Google (Gemini)", expectedKey: "gemini" },
    { input: "Google DeepMind", expectedKey: "deepmind" },
    { input: "meta", expectedKey: "meta" },
    { input: "Meta (Llama)", expectedKey: "meta" },
    { input: "xai", expectedKey: "xai" },
    { input: "xAI (Grok)", expectedKey: "xai" },
    { input: "mistral", expectedKey: "mistral" },
    { input: "Mistral AI", expectedKey: "mistral" },
    { input: "cohere", expectedKey: "cohere" },
    { input: "deepseek", expectedKey: "deepseek" },
    { input: "DeepSeek AI", expectedKey: "deepseek" },
    { input: "perplexity", expectedKey: "perplexity" },
    { input: "qwen", expectedKey: "qwen" },
    { input: "Alibaba Cloud", expectedKey: "qwen" },
    { input: "microsoft", expectedKey: "microsoft" },
    { input: "apple", expectedKey: "apple" },
    { input: "amazon", expectedKey: "amazon" },
    { input: "nvidia", expectedKey: "nvidia" },
    { input: "huggingface", expectedKey: "huggingface" },
    { input: "midjourney", expectedKey: "midjourney" },
    { input: "stability", expectedKey: "stability" },
    { input: "elevenlabs", expectedKey: "elevenlabs" },
    { input: "groq", expectedKey: "groq" },
    { input: "suno", expectedKey: "suno" },
    { input: "scale", expectedKey: "scale" },
    { input: "runway", expectedKey: "runway" },
    { input: "cognition", expectedKey: "cognition" },
    { input: "leonardo", expectedKey: "leonardo" },
  ];

  it("should correctly normalize all major AI provider names and slugs", () => {
    topProviders.forEach(({ input, expectedKey }) => {
      const normalized = normalizeProviderKey(input);
      expect(normalized).toBe(expectedKey);
      expect(hasProviderIcon(input)).toBe(true);
      expect(PROVIDER_ICON_MAP[expectedKey]).toBeDefined();
    });
  });

  it("renders vector SVG logo for OpenAI", () => {
    const { container } = render(
      <ProviderLogo name="OpenAI (ChatGPT)" slug="openai" size="sm" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("aria-label")).toBe("OpenAI logo");
  });

  it("renders vector SVG logo for Anthropic", () => {
    const { container } = render(
      <ProviderLogo name="Anthropic (Claude)" slug="anthropic" size="md" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("aria-label")).toBe("Anthropic logo");
  });

  it("renders vector SVG logo for DeepSeek", () => {
    const { container } = render(
      <ProviderLogo name="DeepSeek" slug="deepseek" size="lg" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("aria-label")).toBe("DeepSeek logo");
  });

  it("renders vector SVG logo for Google DeepMind and Gemini", () => {
    const { container: c1 } = render(
      <ProviderLogo name="Google DeepMind" slug="deepmind" size="md" />
    );
    expect(c1.querySelector("svg")?.getAttribute("aria-label")).toBe("Google DeepMind logo");

    const { container: c2 } = render(
      <ProviderLogo name="Gemini" slug="gemini" size="md" />
    );
    expect(c2.querySelector("svg")?.getAttribute("aria-label")).toBe("Google Gemini logo");

    const { container: c3 } = render(
      <ProviderLogo name="Google" slug="google" size="md" />
    );
    expect(c3.querySelector("svg")?.getAttribute("aria-label")).toBe("Google logo");
  });

  it("renders fallback initials for unknown provider", () => {
    render(<ProviderLogo name="Quantum Horizon Labs" slug="quantum-horizon" size="sm" />);
    expect(screen.getByText("QL")).toBeDefined();
  });

  it("verifies static SVG files in public/logos/providers directory", () => {
    const publicDir = path.resolve(process.cwd(), "public/logos/providers");
    const requiredFiles = [
      "openai.svg",
      "anthropic.svg",
      "google.svg",
      "gemini.svg",
      "deepmind.svg",
      "meta.svg",
      "xai.svg",
      "mistral.svg",
      "cohere.svg",
      "deepseek.svg",
      "perplexity.svg",
      "qwen.svg",
      "microsoft.svg",
      "apple.svg",
      "amazon.svg",
      "nvidia.svg",
      "huggingface.svg",
      "midjourney.svg",
      "stability.svg",
      "elevenlabs.svg",
      "groq.svg",
      "suno.svg",
      "scale.svg",
      "runway.svg",
      "cognition.svg",
      "leonardo.svg",
      "together.svg",
    ];

    requiredFiles.forEach((file) => {
      const fullPath = path.join(publicDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, "utf8");
      expect(content).toContain("<svg");
      expect(content).toContain("</svg>");
    });
  });
});