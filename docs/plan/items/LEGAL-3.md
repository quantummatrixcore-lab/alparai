# LEGAL-3

**LEGAL-3** — Wire `/dashboard/legal` to the legal tables that already exist. Owner: Implementer.
Priority: P1. Raised by the Founder, 2026-08-17: the page is empty and the accumulated incident data
should populate it.

## Measured

`src/app/[locale]/dashboard/legal/page.tsx` is **69 lines with no data fetch** — placeholder
metadata, a skeleton grid at 50% opacity with `pointer-events: none`, and a centred empty state.

The data model behind it is complete and unused:

| Table                   | Columns of interest                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `takedown_requests`     | `reason`, `status` (received / under_review / approved / rejected / escalated), `sla_due_at`, `evidence_url`, `incident_id`, `requester_name`, `requester_email`, `organization`, `country`, `reviewed_at`, `resolution_notes` |
| `takedown_appeals`      | `takedown_id`, `incident_id`, `appellant_name`, `appellant_email`, `reason`, `status`, `resolved_at`                                                                                                                           |
| `cease_and_desist_logs` | `provider_id`, `threat_level` (low / medium / high / critical / existential), `legal_text`, `our_response`, `published_at`                                                                                                     |

`src/app/[locale]/admin/takedown/page.tsx` already queries `takedown_requests` — reuse its query
shape rather than inventing one. `/admin/legal-tracker` displays Case #001 and six institution
notifications, all **hardcoded**, from no table.

This is the fifth instance of the pattern recorded in v13.49: `.agents/skills/` read by nothing,
`docs/adr/` unreferenced since June, `agent_episodic_memory` built and unwired, `agent-os` imported
before it was written — and now three legal tables behind a stub page.

## Scope

**No new schema.** Query what exists.

**Public dashboard — aggregates only.** `takedown_requests` carries `requester_name`,
`requester_email` and `organization`. Per-request detail stays admin-only behind RLS; the public
view shows:

- takedown volume by status
- median time from `created_at` to `reviewed_at`, and the share resolved within `sla_due_at`
- cease-and-desist count by `threat_level`
- the **published** C&D texts (`legal_text` with `our_response`, where `published_at` is not null) —
  the genuinely distinctive asset here, and the reason a competitor cannot reproduce this page

**Empty state stays honest.** If a table has no rows, the page says so with the count. It must not
render a plausible-looking chart from no data.

**Do not hardcode.** If Case #001 belongs on this page, it comes from a table. The existing
hardcoded copies in `/admin/legal-tracker` and `src/app/[locale]/cases/page.tsx` are a separate
cleanup, not a template to follow.

## Acceptance

- `/en/dashboard/legal` renders counts that change when a row is inserted
- An anonymous session cannot see `requester_email`, `requester_name` or `organization` — negative
  test, per control C-1
- With zero rows the page states zero rather than rendering a skeleton
- No new table or migration in the diff
- EN and TR strings present (this is a public route, so per `CLAUDE.md` all five locales apply)

## Still open — commit message overclaimed (2026-08-18)

`11ee0f16` ("chore: address investment room data gaps and **legal dashboard**") resolved `STRAT-1`
and the `case_001` status wording genuinely, but **did not touch this item**. Checked directly:
`src/app/[locale]/dashboard/legal/page.tsx` is unchanged — 68 lines (was 69), no
`createServerClient` or `dehost` reference (`grep -c` → 0), same skeleton grid and empty state.
The commit title's mention of "legal dashboard" refers to the `case_001` status correction, not to
wiring this page. Recorded so the next session does not read the commit message and mark this
closed without checking, which is the exact failure this project keeps correcting.
