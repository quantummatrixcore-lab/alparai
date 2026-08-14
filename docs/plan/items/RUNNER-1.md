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
