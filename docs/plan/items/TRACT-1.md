# TRACT-1

**TRACT-1** — There is no usage figure to put in any application. Owner: Implementer.
Priority: **P1 — it gates `FUND-3` and every venture conversation.** Measured 2026-08-20.

The pitch deck's traction slide offers a 56-route dashboard and 203 migrations. Those measure effort,
not demand, and a reviewer reads the substitution precisely: a company counting its own commits has
no users to count.

No published figure exists for visitors, signups, newsletter subscribers, API calls or incident
submissions. `funnel_events` exists but `BH` — the source parameter that makes it interpretable — has
not landed, so even the visits already recorded cannot be attributed to a channel.

**Every funding route in `FUND-3` asks for evidence of use.** An application submitted before this
works has an empty results section, and that is the section the reviewer reads first.

## Required work

Land `BH` (source attribution into `funnel_events`), then define the small set of figures this project
will report and report consistently: unique visitors, signups, newsletter subscribers, incident
submissions, API calls by tier. Surface them in the admin panel from live queries — not as a new
widget with placeholder values, which is the defect `ADMIN-6` exists to remove.

Report the real numbers whatever they are. Early figures are small; small and true is a fundable
position, and it is the only one that survives a follow-up question.

## Acceptance

- Every figure above is produced by a query against a live table, visible in the admin panel
- A channel breakdown exists for at least one week of traffic
- The deck's traction slide cites those figures, dated, and no longer cites route or migration counts
