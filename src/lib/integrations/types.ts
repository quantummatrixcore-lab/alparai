export type ServiceCategory =
  | "version-control"
  | "hosting"
  | "database"
  | "cache"
  | "cdn-security"
  | "error-tracking"
  | "email"
  | "payments"
  | "ci-cd"
  | "testing"
  | "code-quality"
  | "auth"
  | "analytics"
  | "monitoring"
  | "bot-detection"
  | "vault"
  | "ai-models"
  | "ai-agents";

export type ServiceStatus = "connected" | "missing_key" | "error" | "not_configured";

export interface IntegrationAlternative {
  id: string;
  name: string;
  description: string;
  rating?: number | null;
  pros: string[];
  cons: string[];
  pricing: string;
  website: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  logo: string;
  brandColor: string;
  envVars: string[];
  costKey?: string;
  healthKey?: string;
  alternatives: string[];
  url?: string;
  docsUrl?: string;
}

export interface IntegrationStatus {
  serviceId: string;
  status: ServiceStatus;
  envPresent: number;
  envTotal: number;
  monthlyCost?: number;
  budgetLimit?: number;
  uptime?: number;
  lastHeartbeat?: string | null;
}

export interface IntegrationResponse {
  services: IntegrationStatus[];
  alternatives: Record<string, IntegrationAlternative[]>;
  lastUpdated: string;
}
