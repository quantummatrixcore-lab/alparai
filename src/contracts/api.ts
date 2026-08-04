import { z } from "zod";

// 1. GET /api/v1/incidents
export const incidentsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      category: z.string(),
      eu_act_risk_category: z.string().nullable(),
      eu_act_serious_incident_class: z.string().nullable(),
      eu_act_high_risk_system_category: z.string().nullable(),
      eu_act_reporting_deadline_days: z.number().nullable(),
      is_anonymous: z.boolean(),
      incident_date: z.string(),
      views: z.number(),
      upvotes: z.number(),
      provider: z
        .object({
          name: z.string(),
          slug: z.string(),
        })
        .nullable(),
      model: z.string().nullable(),
      truth_score: z.number().nullable(),
      confidence: z.number().nullable(),
      verification_level: z.enum(["expert", "community"]),
      expert_fix: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  meta: z.object({
    count: z.number(),
    limit: z.number(),
    tier: z.enum(["free", "developer", "enterprise"]),
    generated_at: z.string(),
  }),
});

// 1b. GET /api/v1/incidents/export
export const incidentsExportResponseSchema = z.object({
  license: z.string(),
  provider: z.string(),
  total_records: z.number(),
  dataset: z.array(z.record(z.string(), z.unknown())),
  exported_at: z.string(),
});
export const incidentDetailResponseSchema = z.object({
  data: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    category: z.string(),
    is_anonymous: z.boolean(),
    incident_date: z.string(),
    views: z.number(),
    upvotes: z.number(),
    model: z.string().nullable(),
    truth_score: z.number().nullable(),
    confidence: z.number().nullable(),
    verification_level: z.enum(["expert", "community"]),
    expert_fix: z.string().nullable(),
    created_at: z.string(),
  }),
});

// 3. GET /api/v1/leaderboard
export const leaderboardResponseSchema = z.object({
  data: z.array(
    z.object({
      rank: z.number(),
      id: z.string().uuid(),
      slug: z.string(),
      name: z.string(),
      logo_url: z.string().nullable(),
      is_verified: z.boolean(),
      website_url: z.string().nullable(),
      trust_score: z.number(),
      incident_count: z.number(),
      response_count: z.number(),
      response_rate: z.number().nullable(),
    }),
  ),
  meta: z.object({
    count: z.number(),
    generated_at: z.string(),
  }),
});

// 4. GET /api/v1/ratings/[modelSlug]
export const ratingsResponseSchema = z.object({
  model_id: z.string().uuid(),
  model_name: z.string(),
  status: z.enum(["active", "retired"]),
  composite_score: z.number(),
  ratings: z.array(
    z.object({
      category_id: z.string().uuid().optional(),
      category_name: z.string().optional(),
      score: z.number(),
      wilson_interval: z.object({
        lower: z.number().nullable(),
        upper: z.number().nullable(),
      }),
      sample_size: z.number(),
      last_audited_at: z.string(),
    }),
  ),
});

// 5. POST /api/v1/extract
export const extractResponseSchema = z.object({
  url: z.string().url(),
  providerId: z.string(),
  providerName: z.string(),
  title: z.string(),
  description: z.string(),
  extractedAt: z.string(),
});

// 6. GET /api/v1/oecd/feed
export const oecdFeedResponseSchema = z.object({
  feed_format: z.string(),
  generated_at: z.string(),
  count: z.number(),
  incidents: z.array(
    z.object({
      incident_id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      category: z.string(),
      location_country: z.string(),
      incident_date: z.string(),
      created_at: z.string(),
      oecd_classification: z.object({
        people_planet: z.string(),
        business_model: z.string(),
        ai_system: z.string(),
        data_input: z.string(),
        action_output: z.string(),
      }),
    }),
  ),
});

// 7. GET /api/v1/providers
export const providersResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
      website_url: z.string().nullable(),
      logo_url: z.string().nullable(),
      is_verified: z.boolean(),
      trust_score: z.number(),
    }),
  ),
  meta: z.object({
    count: z.number(),
    generated_at: z.string(),
  }),
});

// 8. GET /api/v1/stats
export const statsResponseSchema = z.object({
  data: z.object({
    total_incidents: z.number(),
    total_providers: z.number(),
    average_trust_score: z.number(),
    by_category: z.record(z.string(), z.number()),
  }),
  meta: z.object({
    generated_at: z.string(),
  }),
});

// 9. POST /api/v1/risk/audit
export const riskAuditResponseSchema = z.object({
  eu_act_risk_category: z.enum(["minimal", "limited", "high", "unacceptable"]),
  eu_act_serious_incident_class: z.string().nullable(),
  risk_score: z.number().min(0).max(1),
  reasoning: z.string(),
});

// 10. GET /api/v1/dsar/export
export const dsarExportResponseSchema = z.object({
  export_meta: z.object({
    platform: z.string(),
    legal_basis: z.string(),
    generated_at: z.string(),
    request_id: z.string(),
    sla_due_date: z.string(),
  }),
  user_identity: z.object({
    id: z.string().uuid(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    last_sign_in_at: z.string().nullable().optional(),
  }),
  profile: z.any().nullable(),
  incidents: z.array(z.any()),
  comments: z.array(z.any()),
  votes: z.array(z.any()),
  expert_applications: z.array(z.any()),
}); // 11. GET /api/v1/dsar/download
export const dsarDownloadResponseSchema = z.union([
  z.object({
    user_id: z.string().uuid(),
    email: z.string().nullable().optional(),
    generated_at: z.string(),
    profile: z.any().nullable(),
    incidents: z.array(z.any()),
    comments: z.array(z.any()),
    votes: z.array(z.any()),
  }),
  z.string(), // CSV format is plain string
]);

// 12. GET /api/v1/auditor
export const auditorRootResponseSchema = z.object({
  service: z.string(),
  version: z.string(),
  status: z.string(),
  grid: z.object({
    active_engines: z.number(),
    fast_route_cache: z.boolean(),
    zero_latency: z.boolean(),
  }),
  stats: z.object({
    total_incidents: z.number(),
    k_benchmark_evaluations: z.number(),
    monitored_models: z.number(),
  }),
  endpoints: z.object({
    audit_logs: z.string(),
    k_benchmark: z.string(),
    methodology: z.string(),
  }),
  timestamp: z.string(),
});

// 12b. GET /api/v1/auditor/k-benchmark
export const auditorBenchmarkResponseSchema = z.object({
  data: z.array(
    z.object({
      category_id: z.string(),
      model_id: z.string(),
      score: z.number(),
      status: z.string(),
      sample_size: z.number(),
      created_at: z.string().nullable().optional(),
    }),
  ),
});

// 13. GET /api/v1/auditor/methodology
export const auditorMethodologyResponseSchema = z.object({
  data: z.array(
    z.object({
      version: z.string(),
      description: z.string(),
      created_at: z.string(),
    }),
  ),
});

// 14. GET /api/v1/auditor/audit-logs
export const auditorAuditLogsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().uuid(),
      actor_id: z.string().uuid().nullable().optional(),
      action: z.string(),
      entity_type: z.string(),
      entity_id: z.string().uuid().nullable().optional(),
      created_at: z.string(),
    }),
  ),
});

// 15. GET /api/v1/dsar/portable
export const dsarPortableResponseSchema = z.any(); // Returns ZIP binary stream

// 16. GET /api/v1/regulators
export const regulatorsResponseSchema = z.union([
  z.object({
    authority: z.string(),
    authority_label: z.string(),
    compliance_framework: z.string(),
    generated_at: z.string(),
    count: z.number(),
    incidents: z.array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        severity: z.string(),
        incident_date: z.string().nullable(),
        reported_at: z.string(),
        source_url: z.string().nullable(),
        country: z.string().nullable(),
        provider: z.string().nullable(),
        eu_ai_act: z.object({
          risk_category: z.string().nullable(),
          serious_incident_class: z.string().nullable(),
          reporting_deadline_days: z.number().nullable(),
        }),
        alpar_provenance: z.string(),
        passport_url: z.string(),
      }),
    ),
  }),
  z.string(),
]);

// 17. GET /api/v1/slopsquatting
export const slopsquattingResponseSchema = z.object({
  count: z.number(),
  reports: z.array(
    z.object({
      id: z.string().uuid(),
      package_name: z.string(),
      ecosystem: z.string(),
      first_seen_at: z.string(),
      confirmed_real: z.boolean(),
      source_url: z.string().nullable(),
      hallucinated_by_model_id: z.string().nullable(),
    }),
  ),
  _meta: z.object({
    ecosystem: z.string(),
    limit: z.number(),
  }),
});

// 18. GET /api/v1/playbooks
export const playbooksResponseSchema = z.object({
  count: z.number(),
  playbooks: z.array(
    z.object({
      id: z.string().uuid(),
      sector: z.string(),
      title: z.string(),
      framework: z.string(),
      summary: z.string(),
      checklist: z.any(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
  _meta: z.object({
    sector: z.string(),
    limit: z.number(),
  }),
});

// 19. GET /api/v1/jailbreaks
export const jailbreaksResponseSchema = z.object({
  count: z.number(),
  jailbreaks: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      technique: z.string(),
      severity: z.string(),
      prompt_masked: z.string(),
      target_model: z.string(),
      reproducible: z.boolean(),
      mitigation: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  _meta: z.object({
    technique: z.string(),
    limit: z.number(),
  }),
});

// 20. POST /api/v1/provenance
export const provenanceResponseSchema = z.object({
  provenance: z.object({
    c2pa_detected: z.boolean(),
    c2pa_manifest_url: z.string().nullable(),
    synthid_detected: z.boolean(),
    media_hash: z.string().nullable(),
    verification_status: z.string(),
    verified_at: z.string(),
    alpar_provenance_seal: z.string(),
  }),
});

// 21. GET /api/v1/trust-ranking
export const trustRankingResponseSchema = z.object({
  count: z.number(),
  rankings: z.array(
    z.object({
      id: z.string().uuid(),
      provider_slug: z.string(),
      provider_name: z.string(),
      composite_score: z.number(),
      incident_penalty: z.number(),
      response_rate_bonus: z.number(),
      ranking_tier: z.string(),
      last_evaluated_at: z.string(),
    }),
  ),
  generated_at: z.string(),
});

// 22. GET /api/v1/bench-tr
export const benchTrResponseSchema = z.object({
  count: z.number(),
  evaluations: z.array(
    z.object({
      id: z.string().uuid(),
      model_name: z.string(),
      provider_slug: z.string(),
      tr_grammar_score: z.number(),
      tr_bias_score: z.number(),
      tr_factuality_pct: z.number(),
      eval_dataset_ver: z.string(),
      created_at: z.string(),
    }),
  ),
  benchmark: z.string(),
  generated_at: z.string(),
});

// 23. POST /api/v1/whistleblower
export const whistleblowerResponseSchema = z.object({
  message: z.string(),
  receipt: z.object({
    submission_id: z.string().uuid(),
    receipt_hash: z.string(),
    submitted_at: z.string(),
    anonymity_status: z.string(),
  }),
});

// 24. GET /api/v1/litigation/export
export const litigationExportResponseSchema = z.object({
  litigation_package: z.object({
    package_id: z.string(),
    court_admissible_notice: z.string(),
    incident_evidence: z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      severity: z.string(),
      incident_date: z.string().nullable(),
      reported_at: z.string(),
      provider: z.string().nullable(),
      source_url: z.string().nullable(),
      country: z.string().nullable(),
    }),
    chain_of_custody: z.object({
      sha256_integrity_hash: z.string(),
      custody_timestamp: z.string(),
      provenance_authority: z.string(),
    }),
  }),
});
