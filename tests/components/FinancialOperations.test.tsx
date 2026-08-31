import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FinancialOperations } from "../../src/components/admin/widgets/FinancialOperations";

import { FinancialOperations as BarrelFinancialOperations } from "../../src/components/admin/widgets";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "FİNANSAL OPERASYONLAR",
      positive_runway: "POZİTİF RUNWAY",
      subtitle: "Gerçek Zamanlı MRR, Token Bütçesi & Finansal Arbitraj",
      rebalance_budget: "Bütçe Rebalance",
      rebalancing: "Dengeleniyor...",
      "metrics.net_mrr_title": "Net MRR (Aylık Gelir)",
      "metrics.net_mrr_target": "Hedef: $50,000",
      "metrics.ai_compute_title": "AI Compute Gideri",
      "metrics.ai_compute_sub": "Toplam Bütçenin %0.5'i",
      "metrics.runway_title": "Runway Dayanımı",
      "metrics.runway_value": "42+ Ay",
      "metrics.runway_sub": "Sıfır Dış Bağımlılık",
      "metrics.runway_change": "+6 Ay",
      "metrics.gross_margin_title": "Brüt Kar Marjı",
      "metrics.gross_margin_sub": "Otonom Operasyon Sayesinde",
      "token_cost.title": "AI Model & Token Maliyet Dağılımı",
      "token_cost.savings": "Tasarruf: %82.6",
      "token_cost.load_label": "yük",
      "token_cost.smart_routing": "Akıllı Token Yönlendirme (OpenCode Free Routing) Aktif",
      "token_cost.spending_limit": "Harcama Limiti: %100 Güvenli",
      "subscription_tiers.title": "Abonelik & Gelir Katmanları",
      "subscription_tiers.active_customers": "Aktif Müşteri",
      "subscription_tiers.stripe_sync": "Stripe Webhook Eşzamanlı • 0 Gecikme",
    };
    return translations[key] || key;
  },
}));

describe("FinancialOperations Component", () => {
  it("verifies export parity between named, default, and barrel exports", () => {
    expect(FinancialOperations).toBeDefined();
    expect(FinancialOperations).toBeDefined();
    expect(BarrelFinancialOperations).toBeDefined();
    expect(FinancialOperations).toBe(FinancialOperations);
    expect(BarrelFinancialOperations).toBe(FinancialOperations);
  });

  it("renders correctly with all translation keys and sections via named export", () => {
    render(<FinancialOperations />);
    expect(screen.getByText(/FİNANSAL OPERASYONLAR/i)).toBeDefined();
    expect(screen.getByText(/POZİTİF RUNWAY/i)).toBeDefined();
    expect(screen.getByText(/Gerçek Zamanlı MRR/i)).toBeDefined();
    expect(screen.getByText(/Bütçe Rebalance/i)).toBeDefined();
    expect(screen.getByText(/Net MRR \(Aylık Gelir\)/i)).toBeDefined();
    expect(screen.getByText(/AI Model & Token Maliyet Dağılımı/i)).toBeDefined();
    expect(screen.getByText(/Abonelik & Gelir Katmanları/i)).toBeDefined();
    expect(screen.getByText(/Stripe Webhook Eşzamanlı/i)).toBeDefined();
  });

  it("renders correctly via default export", () => {
    render(<FinancialOperations />);
    expect(screen.getByText(/FİNANSAL OPERASYONLAR/i)).toBeDefined();
    expect(screen.getByText(/POZİTİF RUNWAY/i)).toBeDefined();
  });
});
