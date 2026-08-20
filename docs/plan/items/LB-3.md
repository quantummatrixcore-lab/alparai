# LB-3

**LB-3** — Load the real GenAI incident corpus. Owner: Implementer. Priority: P1.
**Blocked until `LB-1` has landed and deployed** — fabricated rows come out before real data goes in.

## What already exists

**The importer is complete and correct. It is the one piece of this that needs no work.**
`src/lib/import/incident-importer.ts` (217 lines) does batches of 50, PII Guardian masking on title
and description, deduplication via `onConflict: "incident_source,import_external_id"`, and carries an
auto-publish path at line 160 (`status: 'published'`, `published_at`, and a `moderator_notes` stamp).
**Reuse it. Do not write a second importer.** The CSV front end is `parseIncidentCSV`
(`src/lib/import/csv-parser.ts`).

**The corpus exists and is licensed for this use.** `github.com/VulcanLab/genai-security-incidents` —
4,328 GenAI and agentic-AI security incident records, 2024-2026, **CC BY 4.0**. `scripts/import-aiid.ts:41`
already points at its CSV. Header row:

`ID, Stream, Source category, Date, Year, Severity, CVSS, Attack vector, OWASP LLM, OWASP ASI,
MITRE ATLAS, NIST AI RMF, CVE IDs, AIID ID, Mapped threats, Quality tier, Title, Affected,
Primary reference URL, Description`

## Required work

Map that header onto the `incidents` schema through the existing parser and importer:
`Primary reference URL` → `source_url`, `AIID ID` → `import_external_id`, `Severity`/`CVSS` → the
`severity` enum, `Affected` → provider resolution against `ai_providers`.

**Two rules that are not optional.**

**CC BY 4.0 requires attribution.** A visible credit to the VulcanLab dataset ships with the data —
on the leaderboard or a data-sources page. Importing without it is a licence breach, and this project
cannot argue for accountability while breaching the licence of the data it argues from.

**A row that cannot be resolved to a real provider must not invent one.** Leave `ai_provider_id`
null and keep the row out of provider scoring. Guessing an attribution here would recreate `LB-1` —
an unfounded accusation against a named company — with real incident text as cover.

Run once with `autoPublish: false` and review a sample before enabling the auto-publish path.

## Acceptance

- `SELECT count(*) FROM incidents WHERE incident_source = 'aiid_import'` is non-zero and matches the
  importer's reported `inserted`
- Five rows spot-checked against their `source_url` and found to describe what the row claims
- The attribution line is visible on the deployed page
- No row carries a provider attribution that the source data does not support
- Reported per G-7: commit SHA plus the branch it was pushed to, re-read from `origin`
