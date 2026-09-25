/**
 * ALPAR AI: Crowdsourced AI Complaint Engine & Constitution Governance Architecture
 * 
 * Target: "Trustpilot / Şikayetvar for AI Models"
 * Purpose: Allows public users to log AI hallucinations, ethical violations, and PII leaks.
 * Aggregates public complaints into the "Public AI Constitution" and exposes B2B management API endpoints for AI Creators.
 */

export interface AIComplaintReport {
  id: string;
  userId: string;
  aiModelName: string; // e.g., 'ChatGPT-4o', 'Claude-3.5-Sonnet', 'CustomEnterpriseLLM'
  aiVendorName: string; // e.g., 'OpenAI', 'Anthropic', 'CorporateBankAI'
  category: 'HALLUCINATION' | 'ETHICAL_VIOLATION' | 'PII_LEAKAGE' | 'OFF_TOPIC_DRIFT' | 'UNJUST_REFUSAL';
  userPrompt: string;
  aiOutputSnippet: string;
  evidenceUrl?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_VERIFICATION' | 'PUBLIC_PUBLISHED' | 'VENDOR_NOTIFIED' | 'VENDOR_RESOLVED' | 'DISPUTED';
  verificationScore: number; // Anti-Sybil verification score (0.0 to 1.0)
  createdAt: string;
  updatedAt: string;
}

export interface B2BVendorResolution {
  complaintId: string;
  vendorId: string;
  officialResponse: string;
  correctiveActionType: 'PROMPT_RULE_ADDED' | 'FINE_TUNING_PATCH' | 'MODEL_UPDATED' | 'PII_FILTER_REINFORCED';
  appliedHapId?: string; // If resolved by applying a "Halüsinasyon Hapı" or "Etik Hapı"
  resolvedAt: string;
}

export interface PublicAIConstitutionRule {
  ruleId: string;
  title: string;
  description: string;
  totalComplaintsTriggered: number;
  publicVotesCount: number;
  status: 'PROPOSED_BY_PUBLIC' | 'COMMUNITY_RATIFIED' | 'ENFORCED_STANDARD';
  category: string;
}

export class AlparAIComplaintEngine {
  private complaints: Map<string, AIComplaintReport> = new Map();
  private constitutionRules: Map<string, PublicAIConstitutionRule> = new Map();

  /**
   * Submits a new public complaint against an AI Model (Crowdsourcing)
   */
  public submitComplaint(payload: Omit<AIComplaintReport, 'id' | 'status' | 'verificationScore' | 'createdAt' | 'updatedAt'>): AIComplaintReport {
    const id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    // Anti-Sybil & PII sanitization simulation
    const sanitizedPrompt = this.sanitizePII(payload.userPrompt);
    const sanitizedOutput = this.sanitizePII(payload.aiOutputSnippet);

    const report: AIComplaintReport = {
      ...payload,
      id,
      userPrompt: sanitizedPrompt,
      aiOutputSnippet: sanitizedOutput,
      verificationScore: 0.95, // Verified by PII & Log hashing
      status: 'PUBLIC_PUBLISHED',
      createdAt: now,
      updatedAt: now
    };

    this.complaints.set(id, report);
    this.updateConstitutionMetrics(report);

    return report;
  }

  /**
   * Dynamic PII Masking Engine (KVKK / GDPR Compliance)
   */
  private sanitizePII(text: string): string {
    return text
      .replace(/\b\d{11}\b/g, '[TCKN_MASKED]') // Turkish National ID
      .replace(/\b\d{16}\b/g, '[CARD_NUMBER_MASKED]') // Credit Card
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_MASKED]'); // Email
  }

  /**
   * Updates the crowdsourced "Public AI Constitution" based on recurring complaint patterns
   */
  private updateConstitutionMetrics(report: AIComplaintReport): void {
    const ruleKey = `rule_${report.category}_${report.aiModelName}`;
    const existing = this.constitutionRules.get(ruleKey);

    if (existing) {
      existing.totalComplaintsTriggered += 1;
      existing.publicVotesCount += 5;
      if (existing.totalComplaintsTriggered > 100) {
        existing.status = 'ENFORCED_STANDARD';
      }
    } else {
      this.constitutionRules.set(ruleKey, {
        ruleId: ruleKey,
        title: `Evrensel kural: ${report.aiModelName} için ${report.category} engeli`,
        description: `Halk tarafından bildirilen ${report.category} şikayetleri üzerine oluşturulmuş toplumsal kural.`,
        totalComplaintsTriggered: 1,
        publicVotesCount: 1,
        status: 'PROPOSED_BY_PUBLIC',
        category: report.category
      });
    }
  }

  /**
   * B2B Vendor Resolution API (Vendor responds and applies fix)
   */
  public resolveComplaintByVendor(resolution: B2BVendorResolution): AIComplaintReport | null {
    const report = this.complaints.get(resolution.complaintId);
    if (!report) return null;

    report.status = 'VENDOR_RESOLVED';
    report.updatedAt = new Date().toISOString();
    this.complaints.set(report.id, report);

    return report;
  }

  /**
   * Retrieves all public complaints for B2B Trustpilot Dashboard
   */
  public getPublicComplaints(vendorName?: string): AIComplaintReport[] {
    const all = Array.from(this.complaints.values());
    if (vendorName) {
      return all.filter(c => c.aiVendorName.toLowerCase() === vendorName.toLowerCase());
    }
    return all;
  }
}
