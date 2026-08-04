/**
 * Common application types.
 */

import type { Database } from "@/types/database";

export type IncidentCategory = Database["public"]["Enums"]["incident_category"];
export type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
export type IncidentStatus = Database["public"]["Enums"]["incident_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type SuggestionStatus = Database["public"]["Enums"]["suggestion_status"];

export type AIProvider = Database["public"]["Tables"]["ai_providers"]["Row"];
export type AIModel = Database["public"]["Tables"]["ai_models"]["Row"];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface IncidentListItem {
  id: string;
  title_masked: string;
  description_masked: string;
  title_tr: string | null;
  description_tr: string | null;
  translated_title: string | null;
  translated_description: string | null;
  machine_translated: boolean;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  is_anonymous: boolean;
  incident_date: string;
  created_at: string;
  view_count: number;
  vote_count: number;
  evidence_count: number;
  affected_count?: number;
  shares_count: number;
  author_name: string | null;
  provider_name: string;
  provider_slug: string;
  cross_audit_truth_score: number | null;
  cross_audit_confidence: number | null;
  incident_source?: string;
  import_external_id?: string | null;
  import_attribution?: string | null;
  is_expert?: boolean;
  expert_fix?: string | null;
  is_seed?: boolean;
  source_badge?: "community" | "imported" | "seed" | "expert-verified" | null;
  processing_stage?: string;
}

export interface IncidentDetail {
  id: string;
  title_masked: string;
  description_masked: string;
  title_tr: string | null;
  description_tr: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  is_anonymous: boolean;
  incident_date: string;
  created_at: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  affected_count?: number;
  author_name: string | null;
  provider_name: string;
  provider_slug: string;
  model_name: string | null;
  language: string;
  cross_audit_truth_score: number | null;
  cross_audit_confidence: number | null;
  cross_audit_reasoning: string | null;
  cross_audit_model: string | null;
  incident_source?: string;
  import_external_id?: string | null;
  import_attribution?: string | null;
  eu_act_risk_category?: string | null;
  eu_act_serious_incident_class?: string | null;
  eu_act_high_risk_system_category?: string | null;
  eu_act_reporting_deadline_days?: number | null;
  is_expert?: boolean;
  expert_fix?: string | null;
  is_seed?: boolean;
  source_badge?: "community" | "imported" | "seed" | "expert-verified" | null;
}

export interface EvidenceItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

export interface ProviderResponse {
  id: string;
  response: string;
  verified: boolean;
  created_at: string;
  provider_name: string;
}

export interface SuggestionListItem {
  id: string;
  title: string;
  description: string;
  title_tr?: string | null;
  description_tr?: string | null;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  author_name: string | null;
}

export interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: SuggestionStatus;
  upvote_count: number;
  comment_count: number;
  is_anonymous: boolean;
  created_at: string;
  author: {
    id: string | null;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  hasVoted?: boolean;
}

export interface LeaderboardEntry {
  provider_id: string;
  provider_name: string;
  provider_slug: string;
  incident_count: number;
  resolved_count: number;
  avg_severity: number;
  trend: number;
  trust_score?: number;
  response_rate?: number;
  is_verified_respondent?: boolean;
}

export interface TakedownRequestItem {
  id: string;
  incidentId: string | null;
  requesterName: string;
  requesterEmail: string;
  requesterOrganization: string | null;
  reason: string;
  legalBasis: string | null;
  evidenceUrl: string | null;
  status: "received" | "under_review" | "approved" | "rejected" | "escalated";
  assignedModeratorId: string | null;
  resolutionNotes: string | null;
  slaDueAt: string;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  published: number;
  taken_down: number;
  users: number;
  providers: number;
  takedown_requests: number;
  recent_24h: number;
}

export interface ModelReview {
  id: string;
  model_id: string;
  user_id: string | null;
  is_anonymous: boolean;
  score_overall: number;
  score_accuracy: number | null;
  score_safety: number | null;
  score_creativity: number | null;
  score_speed: number | null;
  score_value: number | null;
  title: string | null;
  body: string | null;
  status: "published" | "pending" | "rejected";
  helpful_count: number;
  created_at: string;
  author_name?: string | null;
  has_voted?: boolean;
}

export interface ModelFeatureRequest {
  id: string;
  model_id: string;
  user_id: string | null;
  is_anonymous: boolean;
  title: string;
  description: string | null;
  category: "feature" | "safety" | "accuracy" | "ux" | "integration" | "other";
  status: "open" | "planned" | "in_progress" | "completed" | "declined";
  votes_count: number;
  created_at: string;
  author_name?: string | null;
  has_voted?: boolean;
}

export interface ModelScoreSummary {
  model_id: string;
  score_overall: number;
  score_accuracy: number;
  score_safety: number;
  score_creativity: number;
  score_speed: number;
  score_value: number;
  reviews_count: number;
}

export interface SwotItem {
  id: string;
  category: "strength" | "weakness" | "opportunity" | "threat";
  title: string;
  description: string | null;
  weight: "low" | "medium" | "high";
  owner_user_id: string | null;
  action_plan: string | null;
  target_date: string | null;
  status: "active" | "done" | "archived";
  created_at: string;
  updated_at: string;
}

export interface StrategyRisk {
  id: string;
  code: string;
  title: string;
  description: string | null;
  probability: number; // 1-5
  impact: number; // 1-5
  owner_user_id: string | null;
  mitigation_plan: string | null;
  target_date: string | null;
  status: "active" | "mitigated" | "triggered" | "closed";
  created_at: string;
  updated_at: string;
}

export interface StrategyValuation {
  id: string;
  method: "berkus" | "scorecard" | "vc" | "revenue" | "average";
  inputs: Record<string, unknown>;
  result_pre_money: number;
  notes: string | null;
  snapshot_date: string;
  created_by: string | null;
  created_at: string;
}

export interface StrategyMilestone {
  id: string;
  quarter: string;
  title: string;
  okr_text: string | null;
  progress: number; // 0-100
  status: "planned" | "in_progress" | "done" | "missed";
  linked_metric: string | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrategyMetricsSnapshot {
  id: string;
  snapshot_date: string;
  total_users: number;
  total_incidents: number;
  active_providers: number;
  media_mentions_count: number;
  mrr_cents: number;
  runway_months: number | null;
  health_score: number; // 0-100
  created_at: string;
}

export interface StrategyTodo {
  id: string;
  priority: number;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalIncidentQueueItem {
  id: string;
  source: string;
  external_url: string;
  title: string;
  body: string;
  source_score: number;
  status: "pending" | "accepted" | "rejected" | "duplicate";
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface StrategyInnovation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "idea" | "in_progress" | "done";
  created_at: string;
  updated_at: string;
}

export interface StateSupport {
  id: string;
  code: string;
  name: string;
  country: string;
  region: string | null;
  grantor: string;
  category: "rd" | "market_entry" | "regulatory" | "grant" | "tax_incentive" | "equity" | "loan";
  max_amount_eur: number | null;
  currency: string;
  deadline: string | null;
  status: "open" | "applied" | "awarded" | "closed" | "rejected";
  priority: 1 | 2 | 3 | 4;
  fit_score: number;
  notes: string | null;
  url: string | null;
  applied_at: string | null;
  awarded_at: string | null;
  awarded_amount_eur: number | null;
  created_at: string;
  updated_at: string;
}
