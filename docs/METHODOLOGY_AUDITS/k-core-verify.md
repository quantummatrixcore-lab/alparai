# K-CORE verification report — 2026-07-12

=========================================

## 1. Context & Naming Clarification

As per Rule #18 (code-reality reconciliation), the table `cross_audit_results` listed in MASTER_PLAN v8.4 does not exist in the database schema. Instead, the multi-model cross-audit results are persisted directly inside the `incidents` table under dedicated columns:

- `cross_audit_truth_score`
- `cross_audit_confidence`
- `cross_audit_model`
- `cross_audit_reasoning`
- `cross_audit_triage_models`
- `cross_audit_completed_at`

## 2. Cron Job Execution Verification

The retrospective batch audit cron (`/api/cron/retro-audit`) queries pending published incidents that haven't been audited yet (`is("cross_audit_truth_score", null)`) and processes them:

```typescript
const { data: pendingIncidents } = await admin
  .from("incidents")
  .select("id, title_masked")
  .is("cross_audit_truth_score", null)
  .eq("status", "published")
  .neq("source_badge", "community")
  .limit(10);
```

## 3. Automated Test Verification

Run logs for `tests/api/cron/retro-audit.test.ts`:

```bash
 RUN  v3.2.6 D:/Alparai
 ✓ tests/api/cron/retro-audit.test.ts (1 test) 10ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

The test verifies that the batch cron correctly queries the `incidents` table and filters out community incidents properly while triggering the `runCrossAudit` pipeline.
