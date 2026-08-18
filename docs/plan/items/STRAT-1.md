# STRAT-1

**STRAT-1** — Measure the incident corpus and reconcile three conflicting figures. Owner: Implementer
(requires database access). Priority: **P0 before any investor material is sent.**

## Why this is now the most dangerous open item

Three different numbers are in circulation for the same asset:

| Figure   | Source                                                                                                                                                                                                                            | Status                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **2500** | Founder, 2026-08-17                                                                                                                                                                                                               | Unverified against a query |
| **992**  | `docs/DATA_ROOM/index.md:31` — "Data Moat: 992 documented incidents (largest independent public dataset)". Repeated twice in `docs/AGENT_OS_MASTER_ARCHITECTURE.md` (lines 16, 92), where it is the basis of a monetisation phase | `ölçülmedi`                |
| **371**  | Page-level count reported in an earlier audit                                                                                                                                                                                     | Unverified                 |

`docs/DATA_ROOM/` is the investor data room. This is the one number an evaluator will ask to see
reproduced on the spot, and it currently appears there unsourced. A report that the figure was
"replaced with the measured 371" was checked against `origin/master` on 2026-08-17: **992 is still
present in all three locations.**

## The likely reconciliation — to be confirmed, not assumed

The three numbers are probably not in conflict. They count different populations, because two
different count queries exist in the codebase:

- `src/app/[locale]/page.tsx` (`getHomeData`) — filters `.eq("status", "published")`
- `src/app/[locale]/admin/strategy/page.tsx:94` — `.select("id", { count: "exact", head: true })`
  with **no status filter**, so it counts every row including draft, pending_review and rejected

So ~2500 total rows and ~371 published is a coherent reading. **It must be measured, not inferred
from this note.**

## Required output — one dated run, three numbers, each with its query

```sql
-- 1. total rows
select count(*) from incidents;

-- 2. published only
select count(*) from incidents where status = 'published';

-- 3. by status, so the gap is explained rather than asserted
select status, count(*) from incidents group by status order by count(*) desc;

-- 4. date span of the corpus
select min(incident_date), max(incident_date), min(created_at), max(created_at) from incidents;
```

Record the run date, the environment it ran against (production, not local), and paste the output.

## Then, one sentence for the data room

Written so it survives being checked:

> "N incidents collected, of which M are published after moderation, spanning <first> to <last>."

That is stronger than a bare 992, because it is reproducible and because the moderation gap is
itself evidence of a process rather than a scrape.

## Also required

- **Remove 992** from `docs/DATA_ROOM/index.md` and `docs/AGENT_OS_MASTER_ARCHITECTURE.md` (×2).
  Replace with the measured pair, or with "measurement in progress" if the application is not yet
  going out. It must not stay as it is.
- **Check the "largest independent public dataset" claim** in the same line. AIID and AIAAIC are
  both public and long-running, and this repository's own importer (`src/lib/import/csv-parser.ts`)
  ingests from both — which means part of the corpus is _their_ data, re-hosted under their CC
  licences. "Largest" is very likely false and is trivially checked by a reviewer. Restate as what
  is actually defensible, for example the EU AI Act Article 73 taxonomy mapping that the importer
  applies (`EU_TAXONOMY_MAP`), which is genuinely distinctive.

## Acceptance

- The four query outputs recorded with a date and environment in `docs/plan/`
- `grep -rn "992" docs/` returns nothing outside the frozen archive
- Every incident figure in `docs/DATA_ROOM/` traces to that recorded run
- The "largest independent public dataset" wording is either sourced or replaced
