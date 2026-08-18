# ADMIN-METRICS-2

**ADMIN-METRICS-2** — Fix two blind spots in `scripts/check-admin-metrics.mjs` found by a real
violation that passed through it. Owner: Implementer (`scripts/**` is outside the Architect's G-6
writable paths — confirmed by `CLAUDE.md` Rule 13's own note that `scripts/` is Implementer-owned).
Priority: P1.

## How the gap was found

`f554505c` shipped `src/components/admin/vc-readiness-widget.tsx` with hardcoded readiness scores
(`overallScore = 95`, category scores 100/96/90/88, badges reading `"HAZIR (%98)"` etc. — see
[INVEST-1](INVEST-1.md)). `node scripts/check-admin-metrics.mjs` exits 1 today, but for an unrelated
pre-existing finding (`revenue-share.tsx:157`, `$46,450.00`) — it did not flag any part of this
widget.

## Two identifiable causes

1. **Brace-interpolation exemption doesn't check what's inside the braces.** The script's
   `TEXT_NODE` regex (`/>([^<>{}]+)</g`) intentionally skips any JSX text containing `{}`, on the
   documented assumption that "values interpolated from code... are by definition not literals and
   never match." That assumption is false when the interpolated identifier is itself a hardcoded
   module-level constant: `%{overallScore}` contains braces and is skipped, even though
   `overallScore` is `const overallScore = 95;` one line above — not a query result.
2. **The percentage pattern assumes English digit-then-sign ordering.** `METRIC_PATTERNS.percentage`
   is `/\b\d+(?:\.\d+)?\s?%/` — it requires the number before the `%`. Turkish notation places the
   sign first (`%98`), so literal, brace-free text like `"HAZIR (%98)"` passes silently even though
   it is exactly the kind of hardcoded-metric text node the check exists to catch.

## Fix

1. **Trace simple local-constant interpolations.** At minimum, when a JSX expression inside `{}` is a
   single identifier, check whether that identifier is assigned a numeric or string literal
   elsewhere in the same file (a `const NAME = <literal>` or an object-literal property with a
   literal value reached by a simple property path). This will not catch everything — a value that
   arrives through props or a function call is out of scope for a static check — but it closes the
   exact gap this violation used.
2. **Match percent sign on either side of the digits**: extend the `percentage` pattern to
   `/(?:%\s?\d+(?:\.\d+)?|\b\d+(?:\.\d+)?\s?%)/` (or equivalent) so Turkish-ordered percentages are
   caught identically to English-ordered ones.

## Negative test (per control C-1, `docs/MASTER_PLAN.md` §Queue)

Add a fixture reproducing both gaps — a JSX text node using `%{localConst}` where `localConst` is a
hardcoded literal, and a literal text node reading `%92)` — and confirm the corrected script exits 1
against it. Confirm it still exits 0 against genuinely data-driven interpolations
(`{stats.latency}ms`, no local literal source).

## Acceptance

- The two patterns above are demonstrated to fail the corrected check via the negative-test fixture
- `node scripts/check-admin-metrics.mjs` against the current tree still correctly flags
  `revenue-share.tsx:157` (no regression)
- Once [INVEST-1](INVEST-1.md)'s widget is corrected to a real checklist, the corrected checker
  passes against it
