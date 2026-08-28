import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VisitorAnalytics } from "../../src/components/admin/widgets/VisitorAnalytics";
import type { VisitorEvent } from "../../src/lib/ai/visitor-predictor";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "CEO Analitik: Canlı Ziyaretçi",
      active_visitors: "Sitedeki Aktif Kişi",
      seo_traffic: "SEO Organik Trafik",
    };
    return translations[key] || key;
  },
}));

describe("VisitorAnalytics Component — AI Predictor Integration", () => {
  it("renders correctly with default props", () => {
    render(<VisitorAnalytics />);
    expect(screen.getByText(/CEO Analitik/i)).toBeDefined();
    expect(screen.getByText(/Sitedeki Aktif Kişi/i)).toBeDefined();
    expect(screen.getByText(/SEO Organik Trafik/i)).toBeDefined();
    expect(screen.getByText(/142/i)).toBeDefined();
    expect(screen.getByText(/\+24\.5%/i)).toBeDefined();
    expect(screen.getByText(/Gelecek 1 Saat Tahmini/i)).toBeDefined();
    expect(screen.getByText(/Anomali Z-Skoru/i)).toBeDefined();
    expect(screen.getByText(/Kararlı/i)).toBeDefined();
    expect(screen.getByText(/Turing v1\.4 AI Tahmin Motoru/i)).toBeDefined();
  });

  it("renders correctly with custom props", () => {
    render(<VisitorAnalytics initialVisitors={500} growthRate="+45%" enableRealtimeSimulation={false} />);
    expect(screen.getByText(/500/i)).toBeDefined();
    expect(screen.getByText(/\+45%/i)).toBeDefined();
  });

  it("displays predicted traffic and interval breakdown correctly", () => {
    render(<VisitorAnalytics initialVisitors={200} enableRealtimeSimulation={false} />);
    expect(screen.getByText(/kişi \/ saat/i)).toBeDefined();
    expect(screen.getByText(/Tahmini Sayfa Görüntüleme/i)).toBeDefined();
    expect(screen.getByText(/Gelecek 60 Dakika Tahmin Eğrisi/i)).toBeDefined();
  });

  it("expands Markov flow and Turing engine details when toggle button is clicked", () => {
    render(<VisitorAnalytics initialVisitors={150} enableRealtimeSimulation={false} defaultExpanded={false} />);
    
    // Details initially not in DOM
    expect(screen.queryByText(/Markov Zinciri/i)).toBeNull();

    // Click details toggle
    const toggleButton = screen.getByLabelText(/AI Detaylarını Aç\/Kapat/i);
    fireEvent.click(toggleButton);

    // Details should now appear
    expect(screen.getByText(/Markov Zinciri: En Olası Gelecek Ziyaretçi Rotaları/i)).toBeDefined();
    expect(screen.getByText(/Doğruluk/i)).toBeDefined();
    expect(screen.getByText(/MAPE:/i)).toBeDefined();
    expect(screen.getByText(/RMSE:/i)).toBeDefined();
    expect(screen.getByText(/Shannon Entropi:/i)).toBeDefined();
  });

  it("accurately flags anomalies when surge event stream is ingested", () => {
    const baseTime = Date.now() - 3600 * 1000 * 2;
    const surgeEvents: VisitorEvent[] = [];

    // Normal traffic baseline
    for (let i = 0; i < 20; i++) {
      const t = baseTime + i * 5 * 60 * 1000;
      for (let k = 0; k < 4; k++) {
        surgeEvents.push({ timestamp: t + k * 100, path: "/", sessionId: `norm_${i}_${k}` });
      }
    }

    // Huge sudden surge in latest 5-min window (60 visitors instead of 4)
    const surgeTime = baseTime + 20 * 5 * 60 * 1000;
    for (let k = 0; k < 60; k++) {
      surgeEvents.push({ timestamp: surgeTime + k * 10, path: "/pricing", sessionId: `surge_${k}` });
    }

    render(
      <VisitorAnalytics
        historicalEvents={surgeEvents}
        enableRealtimeSimulation={false}
      />
    );

    // Anomaly badge should be triggered
    expect(screen.getByText(/SURGE/i)).toBeDefined();
    expect(screen.getByText(/Eşik Aşıldı/i)).toBeDefined();
  });
});
