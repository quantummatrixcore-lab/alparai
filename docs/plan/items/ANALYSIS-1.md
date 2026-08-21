# ANALYSIS-1

**ANALYSIS-1** — The corpus is imported and never analysed. Owner: Implementer. Priority: P1.
Measured 2026-08-21.

The only aggregate over incidents in this repository is `provider_leaderboard`: incident count,
response count, response rate, disclosure rate, trust score. That answers one question — how a vendor
behaves — and nothing about the incidents themselves.

**The imported data is far richer than what is used.** The corpus CSV carries `Severity`, `CVSS`,
`Attack vector`, `OWASP LLM`, `OWASP ASI`, `MITRE ATLAS`, `NIST AI RMF`, `CVE IDs`, `Mapped threats`,
`Quality tier`, `Year` and `Date`. Those columns are parsed on import and then read by nothing. A
public registry that holds thousands of classified incidents and publishes only per-vendor counts is
sitting on its own primary asset.

## What to build, in order of what it is worth

**1. The trend view.** Incidents per month by severity, and by year — the single chart that turns a
list into evidence, and the one a journalist or regulator asks for first.

**2. Taxonomy breakdowns.** Counts by OWASP LLM category, by attack vector, by MITRE ATLAS technique.
These map directly onto frameworks auditors already use, which is what makes the registry citable
rather than merely interesting.

**3. Model and vendor comparison over time**, not just totals: is a vendor's rate improving or
worsening, and against what baseline of deployment.

**4. An open data endpoint.** The aggregates as JSON under the existing API, with the CC BY 4.0
attribution the source data requires. This is also the first thing with genuine value to the auditors
and insurers `FUND-3` names as customers.

## Two constraints

Materialise the aggregates rather than computing them per request — the pattern already exists in this
project for model scoring.

**No figure ships before the purge runs.** Analysis over a table that still contains fabricated rows
produces charts that are wrong in a way nobody can see, which is worse than no charts. `LB-1` first.

## Acceptance

- A trend view over published incidents, sourced from a query, visible on the public site
- At least one taxonomy breakdown backed by the imported classification columns
- Aggregates available as JSON with attribution
- Every figure traceable to a query, per Rule 10
