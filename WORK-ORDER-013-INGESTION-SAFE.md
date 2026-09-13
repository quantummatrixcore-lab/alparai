# WORK-ORDER-013 — INGESTION-SAFE CUTOVER (scraped incidents keep flowing)

## Why (Auditor-verified)

- `src/lib/import/incident-importer.ts:177` sets `ai_provider_id: matchedProviderId` (null when feed names no known provider) and never sets `provider_custom_name`. After the new CHECK, every unattributed import row would be REJECTED — ingestion silently dies.
- Same hole in `src/actions/incidents.ts:167-170` (manual submit without provider).
- Prod recon: 2497 incidents need provider backfill, 476 model backfill; TYPE changes recon-safe (4/4 uuid, 9/9 null). Dupe listing already ordered in WO-012 Phase A — do not duplicate, reuse its report.

## Phase A — Do now (no prod writes)

1. Importer: when `matchedProviderId` is null, set `provider_custom_name` to the ROW's vendor text if the feed carries one, else `"Unknown"`. NEVER write the feed/source name (aiaaic_import etc.) into the provider field — source attribution already lives in `incident_source` / `import_attribution` / `source_url` and is displayed as badges (`incident-card.tsx`, `incident-detail.tsx`). Same for model when absent.
2. Form action (`incidents.ts:167-170`): when no provider chosen and no custom text, default `provider_custom_name` to `"Unknown"` (matches existing public-API `?? "Unknown"` fallbacks).
3. `pnpm typecheck` + importer/incident tests green. `## WO-013` entry FIRST. TREE_LOCK_LAW.md applies.

## Phase B — GATED (forbidden until owner says "prod-yaz")

4. Backfill prod (2497 + 476) + TYPE changes + dedupe per WO-012 report.
5. Staging acceptance re-run, then prod-clone rehearsal.

Reply in Turkish, then start with Phase A.
