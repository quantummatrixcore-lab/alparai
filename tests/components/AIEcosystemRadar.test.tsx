import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  AIEcosystemRadar,
  type RadarData,
} from "../../src/components/admin/widgets/AIEcosystemRadar";
import DefaultAIEcosystemRadar from "../../src/components/admin/widgets/AIEcosystemRadar";
import { AIEcosystemRadar as BarrelAIEcosystemRadar } from "../../src/components/admin/widgets";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      title: "Yapay Zeka Ekosistem Radarı",
      current_leader: "Şu Anki Lider Model",
      iq_score: params?.score ? `IQ: ${params.score}` : "IQ",
      token_trend: "Genel Token Fiyat Trendi",
      openai_api: "OpenAI API",
      anthropic_api: "Anthropic API",
    };
    return translations[key] || key;
  },
}));

describe("AIEcosystemRadar Component", () => {
  const mockData: RadarData = {
    leader: "Test Model 1",
    iq_score: "999",
    openai_status: "Maintenance",
    anthropic_status: "Down",
    token_trend: "+5%",
  };

  it("verifies export parity between named, default, and barrel exports", () => {
    expect(DefaultAIEcosystemRadar).toBeDefined();
    expect(AIEcosystemRadar).toBeDefined();
    expect(BarrelAIEcosystemRadar).toBeDefined();
    expect(DefaultAIEcosystemRadar).toBe(AIEcosystemRadar);
    expect(BarrelAIEcosystemRadar).toBe(AIEcosystemRadar);
  });

  it("renders correctly with default data via named export", () => {
    render(<AIEcosystemRadar />);
    expect(screen.getByText(/Ekosistem/i)).toBeDefined();
    expect(screen.getByText(/Claude 3.5 Sonnet/i)).toBeDefined();
    expect(screen.getByText(/1287/i)).toBeDefined();
  });

  it("renders correctly with custom data via default export", () => {
    render(<DefaultAIEcosystemRadar data={mockData} />);
    expect(screen.getByText(/Test Model 1/i)).toBeDefined();
    expect(screen.getByText(/999/i)).toBeDefined();
    expect(screen.getByText(/Maintenance/i)).toBeDefined();
    expect(screen.getByText(/Down/i)).toBeDefined();
    expect(screen.getByText(/\+5%/i)).toBeDefined();
  });
});
