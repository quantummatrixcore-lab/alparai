# RUNNER-1

**RUNNER-1** — Diagnose GitHub Actions runner allocation — 13 of 30 recent runs report `runner_id: 0` (never assigned a runner). Verified on runs `31750260782`, `31750959708`. Once fixed, 16/30 failures still need investigation. Owner: Founder/Antigravity (v13.40).

## Reprioritised to top of board (v13.43)

Moved above CRYPT-1 and the remaining security items. The reasoning is not that runner
allocation is more dangerous than a plaintext key column — it is that **until CI executes, no
other item's completion can be verified except by hand.**

Measured basis: 10 of 10 enforcers are wired to CI; CI produced 0 successful runs in its last
30 on `master`; there is no `pre-push` hook. Every control built across v13.35–v13.42 has
therefore had a runtime of zero on the branch that ships. This session twice confirmed
closures only by running the checks manually, which does not scale and is exactly the manual
audit the enforcers exist to replace.

Founder action, unchanged: check repo Settings → Actions → General for a ruleset, runner group,
or workflow-approval policy blocking allocation. Until that is answered, treat every "CI green"
claim as unverified regardless of who makes it.

## Reopened — the closure was verified false (v13.44)

`bf76b1f9` marked this completed; `94418b81` claimed to "Resolve runner_id:0 by fixing
setup-node action versions". Checked immediately after, on the newest commit `e65c9788`:

Run `31827253701`, all four jobs — `Visual Regression Lock`, `E2E Critical Journeys`, `build`,
`Security Scan`:

- `runner_id: 0`, `runner_name: ""`
- `started_at 18:08:23`, `completed_at 18:08:25` — **two seconds**
- `conclusion: failure`

Unchanged. **One cause is now ruled out:** job labels read `ubuntu-latest`, so `605c16a8`'s
replacement of the self-hosted Windows runner did land. The label was never the problem, and
neither were the action versions. What remains is account- or organisation-level: an Actions
policy, a runner group restriction, a workflow-approval requirement, or a billing/spending
limit.

That is Founder-side and cannot be diagnosed from this container. Until it is answered, treat
every "CI green" claim as unverified regardless of source — including this file's own.
