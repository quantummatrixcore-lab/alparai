# LB-2

**LB-2** — No scheduled job in this project has ever run in production. Owner: Implementer.
Priority: P0. Found 2026-08-20 while tracing why the incident corpus never reached the leaderboard.

## What is wrong

`src/app/api/cron/` contains **25 route handlers**, including `import-incidents` (the corpus loader
that `LB-3` depends on) and `k-weekly-refresh` (the K-benchmark score recalculation). There is **no
`vercel.json`** in the repository and no `"crons"` key in any JSON file. Every one of those 25
handlers is unreachable by schedule.

Two consequences follow directly, and both were previously read as data problems rather than
infrastructure problems: the incident corpus never arrived, and K-benchmark model scores are frozen
at whatever the seed migrations set them to.

The import feed is separately unconfigured. `AIAAIC_FEED_URL` and `AIID_FEED_URL` are read at
`src/app/api/cron/import-incidents/route.ts:24-25` and appear **nowhere else in the repository** —
not in `.env.example`, not in any document. With both unset the route returns its own
`"No feeds executed"` message (line 95) and exits **successfully**, so even a manual invocation is a
silent no-op that reports success. That is why the failure was invisible.

## Required correction

**1. Create `vercel.json` with a `crons` array.** The Vercel plan tier caps the number of cron jobs,
so the 25 routes cannot all be scheduled. Measure the account's actual limit first, then schedule by
priority: `import-incidents`, `k-weekly-refresh`, `quota-snapshot` lead.

**2. Record which routes were left unscheduled and why** in this file. Twenty-five handlers that look
like working infrastructure but are not is the exact condition that produced this item; leaving the
unscheduled majority undocumented reproduces it.

**Unscheduled Routes:**
Due to Vercel plan limits on the number of cron jobs, only priority jobs are scheduled. The following 22 routes are currently unscheduled and must be invoked manually if needed:
- `ai-heartbeat`
- `backup`
- `benchmark`
- `cost-alarm`
- `data-synthesis`
- `fetch-external`
- `generate-marketing`
- `hard-delete`
- `k-model-retirement`
- `k-provider-preview`
- `keep-alive`
- `kill-metric`
- `moderation-sla-alarm`
- `newsletter`
- `omega-audit`
- `outreach`
- `pivot-check`
- `process-deletions`
- `retro-audit`
- `security-audit`
- `translate-backfill`
- `verify-geo-citations`

**3. Configure the feeds.** Set `AIAAIC_FEED_URL` and `AIID_FEED_URL` in the Vercel project
environment, and add both to `.env.example` with a comment naming the expected CSV shape (the header
row is given in `LB-3`).

**4. Confirm `CRON_SECRET` is set.** Without it the route's own auth check (`route.ts:12-20`) rejects
production calls, and the symptom looks identical to the cron not firing at all.

## Acceptance

- The Vercel dashboard lists the scheduled crons
- A manual authenticated call to `/api/v1/cron/import-incidents` returns parsed and inserted counts,
  not `"No feeds executed"`
- This file names every unscheduled route and the reason
- Reported per G-7: commit SHA plus the branch it was pushed to, re-read from `origin`
