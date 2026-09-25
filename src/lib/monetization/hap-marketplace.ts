/**
 * ALPAR AI & DECASHUB: Hap (Solution Pill) Marketplace & Data Monetization Engine
 * 
 * Provides APIs for AI Creators to buy "Solution Pills" (Etik Hapı, Halüsinasyon Hapı, Hukuk Hapı)
 * generated from aggregated public complaint data.
 */

export interface SolutionHap {
  hapId: string;
  name: string; // e.g. 'Halüsinasyon Hapı v2', 'EU AI Act Hukuk Hapı'
  type: 'HALLUCINATION_INTERCEPTOR' | 'ETHICS_GUARDRAIL' | 'LAW_COMPLIANCE' | 'DATA_INSURANCE_FEED';
  priceMonthlyUSD: number;
  description: string;
  activeDeployments: number;
}

export class HapMarketplaceEngine {
  private hapCatalog: Map<string, SolutionHap> = new Map();

  constructor() {
    this.seedCatalog();
  }

  private seedCatalog(): void {
    this.hapCatalog.set('hap_halucination_runtime', {
      hapId: 'hap_halucination_runtime',
      name: 'Halüsinasyon Hapı (Runtime Interceptor)',
      type: 'HALLUCINATION_INTERCEPTOR',
      priceMonthlyUSD: 1890,
      description: 'Halk şikayetlerinden beslenen ve yapay zekanın uydurma cevaplarını anında engelleyen tak-çalıştır kalkan.',
      activeDeployments: 42
    });

    this.hapCatalog.set('hap_ethics_agora', {
      hapId: 'hap_ethics_agora',
      name: 'Etik Hapı (Agora-T Community Standard)',
      type: 'ETHICS_GUARDRAIL',
      priceMonthlyUSD: 690,
      description: 'Toplumsal yapay zeka anayasası kurallarını dinamik olarak zorunlu kılan etik filtresi.',
      activeDeployments: 128
    });

    this.hapCatalog.set('hap_law_euaiact', {
      hapId: 'hap_law_euaiact',
      name: 'EU AI Act Hukuk Hapı (Madde 72 Uyum)',
      type: 'LAW_COMPLIANCE',
      priceMonthlyUSD: 2400,
      description: 'AB Yapay Zeka Yasası kapsamında yüksek riskli sistemlerin otonom ihlal raporlama ve şeffaflık kalkanı.',
      activeDeployments: 19
    });
  }

  public getCatalog(): SolutionHap[] {
    return Array.from(this.hapCatalog.values());
  }

  public purchaseHapLicense(vendorId: string, hapId: string): { success: boolean; licenseKey: string; hap: SolutionHap } {
    const hap = this.hapCatalog.get(hapId);
    if (!hap) throw new Error(`Hap ${hapId} bulunamadı.`);

    hap.activeDeployments += 1;
    this.hapCatalog.set(hapId, hap);

    const licenseKey = `HAP-KEY-${vendorId.toUpperCase()}-${Date.now()}`;
    return { success: true, licenseKey, hap };
  }
}
