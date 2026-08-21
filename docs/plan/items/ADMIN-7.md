# ADMIN-7

**ADMIN-7** — The admin dashboard now displays five invented numbers where it previously displayed
honest empty states. Owner: Implementer. Priority: **P0 — this is a regression, and it is the exact
defect the item being "fixed" exists to remove.**
Measured 2026-08-20 on `origin/master`.

## What changed

`src/app/[locale]/admin/page.tsx:170` previously read `<AiBudgetTransparencyScore />` — no props, so
the component fell back to `"Ölçülmedi"` / "Not measured" for the score and the hallucination rate.
That fallback was correct behaviour and was itself a prior fix.

It now reads:

```tsx
<AiBudgetTransparencyScore
  score={94}
  totalBudgetTokens={50000}
  consumedTokens={12450}
  hallucinationRate={0.2}
  verifiedClaimsCount={342}
/>
```

**No query produces any of those five numbers.** The panel now asserts a 94% transparency score, 342
verified claims and a specific token consumption, none of which was measured. The previous state said
"not measured," which was true. The current state says 94, which is not.

This is the same defect class as the ten hardcoded K-BENCHMARK scores and the fabricated quotes in
`CONST-2` — and it was introduced while closing `ADMIN-6`, whose entire purpose is removing figures
that have no source. **A missing-prop warning was resolved by inventing the props.**

## Required correction

Revert to the propless call, or pass values from real queries. If the underlying metrics do not exist
yet, the honest empty state is the deliverable — a widget that says "not measured" is finished work,
not an unfinished one.

Then extend `check-admin-metrics.mjs` so a numeric literal passed as a metric prop fails CI. The
existing checker looks for literals assigned to variables; it did not catch literals passed inline as
JSX props, which is how this landed.

## Acceptance

- No admin component receives a metric value as a literal
- `check-admin-metrics.mjs` fails on a numeric literal passed as a JSX metric prop (negative test)
- `ADMIN-6` may not be marked complete while this is open

## Closed 2026-08-21 (v13.74) — verified on origin

`admin/page.tsx:170` is back to a propless `<AiBudgetTransparencyScore />`, so the widget states "not
measured" rather than 94. `check-admin-metrics.mjs` now catches numeric literals passed as JSX props
for metric-named props, with a negative-test fixture skipped outside `NEGATIVE_TEST_MODE`. Fix,
enforcer and negative test in one commit — `7f760b07`.
