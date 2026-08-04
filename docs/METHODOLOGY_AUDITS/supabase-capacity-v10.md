# Supabase Capacity Audit & Relief (Item 104)

**Date:** 2026-07-16  
**Auditor:** Antigravity  
**Database:** `alparai-prod` (ref: `azszpzyvxjduhemkjsdh`)  
**Free Tier Limit:** 500.00 MB

---

## 1. SQL Size Query & Audit (Before Cleanup)

A per-table total size audit was conducted on `alparai-prod` prior to the cleanup migration.

| Table Name                 | Total Size (Table + Indexes) | Table Size | Index Size | Row Count |
| -------------------------- | ---------------------------- | ---------- | ---------- | --------- |
| `incidents`                | 5.17 MB (5168 kB)            | 1.76 MB    | 3.41 MB    | 409       |
| `k_model_scores`           | 296.00 kB                    | 120.00 kB  | 176.00 kB  | 1144      |
| `social_posts`             | 272.00 kB                    | 144.00 kB  | 128.00 kB  | 53        |
| `ecosystem_news`           | 192.00 kB                    | 112.00 kB  | 80.00 kB   | 52        |
| `autopilot_runs`           | 168.00 kB                    | 24.00 kB   | 144.00 kB  | 68        |
| `external_incidents_queue` | 144.00 kB                    | 56.00 kB   | 88.00 kB   | 99        |
| Other Tables (<100kB each) | ~1.50 MB                     | —          | —          | —         |
| **Total Database Size**    | **23.00 MB**                 | —          | —          | —         |

### Findings:

- Total database footprint is **23.00 MB**, which represents **4.6%** of the 500 MB Free Tier limit.
- The platform is **not** at risk of exceeding the 80% quota threshold. No manual or automatic plan upgrades are needed at this time.
- The largest tables are `incidents` (5.17 MB) and `k_model_scores` (296 kB).
- To prevent future bloat, `external_incidents_queue.body` (which stores the full text of parsed external articles) is nulled once processed/accepted/rejected.

---

## 2. Relief Migration & Capacity Reclaim

Applied migration `20260801000000_supabase_capacity.sql` which did the following:

1. Altered `public.external_incidents_queue.body` to be nullable (`DROP NOT NULL`).
2. Nulled the `body` column where the queue item has been processed (status is `accepted`, `published`, `rejected`, `processed`, or `duplicate`).
3. Registered a trigger `trg_null_processed_external_queue_body` on the table to automatically null `body` for any future insertions or updates changing the status away from `pending`.

### Post-Migration Stats (After Vacuum):

- **Total Database Footprint:** 23.00 MB (4.6% capacity)
- **Queue Table Size:** 160 kB (the disk pages remain allocated but empty space is marked for reuse, preventing future physical database growth as new articles flow in).
- **Trigger Integrity:** Verified that updating items triggers `body = NULL` when status changes from `pending`.
