# ADMIN-8

**ADMIN-8** — Three metric fields render blank where two render "Ölçülmedi".
Owner: Implementer. Priority: P2. Measured 2026-08-21 on `origin/master`.

`AiBudgetTransparencyScore` is called with no props (`admin/page.tsx:170`), which is correct — the
underlying metrics are not measured, and saying so is the honest state. Two of its fields handle that
properly and print `"Ölçülmedi"`.

Three do not. `consumedTokens`, `totalBudgetTokens` (`:172`) and `verifiedClaimsCount` (`:220`) are
rendered directly. React drops an `undefined` child, so nothing prints the word "undefined" — the
panel instead shows a labelled field with **no value at all**: an empty numerator over an empty
denominator followed by "Tokens (0%)", and an empty figure beneath a "PDU Validated" badge.

That is a smaller problem than the invented numbers `ADMIN-7` removed, and it is not the same problem:
nothing false is asserted. But a blank number under a confident label reads as a rendering failure
rather than as an absence of data, and the component already demonstrates the right answer two fields
above.

## Required work

Give the three fields the same `"Ölçülmedi"` / "Not measured" fallback the score and hallucination-rate
fields already use. Do not invent values to fill them — that is `ADMIN-7`, which this must not undo.

The `(0%)` on the budget line deserves the same treatment: `budgetUsagePct` computes to 0 when the
denominator is absent, so the panel currently reports 0% usage of an unknown budget, which is a
measurement claim rather than an empty state.

## Acceptance

- Every field in the component shows either a real value or an explicit not-measured state
- No metric field renders empty
- `check-admin-metrics.mjs` still passes; no literal is introduced to satisfy this
