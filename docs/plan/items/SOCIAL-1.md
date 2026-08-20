# SOCIAL-1

**SOCIAL-1** — Social presence: two accounts, each fed by the product. Owner: Founder (posting),
Implementer (the link fix and measurement). Priority: P2, after Block I.

## What exists

The footer renders four links (`src/components/layout/footer.tsx:73-106`): GitHub, Twitter/X
(`twitter.com/alparai`), LinkedIn (`linkedin.com/company/alpar-ai`) and mail. The nav renders none.
No Discord, Reddit, Mastodon, Bluesky or YouTube presence exists — which is the correct starting
position, not a gap.

**One defect to fix first:** the footer's GitHub link points at `quantummatrixcore-lab/alparai`, while
this repository is `quantummatrixcore-lab/Alparai.com` (the old name `alparai-platform` also redirects).
Verify where that link actually lands and point it at the canonical repository — the public repository
is the strongest asset of the three and the link to it should not depend on a redirect.

## The discipline

**Two accounts, not five.** X and LinkedIn, plus the GitHub organisation. A public AGPL repository
with a visible commit history is more credible to this audience than any marketing copy. Nothing else
opens until these two run at a steady cadence.

**Every post cites its source, without exception.** This is not a style rule. A project whose thesis
is that AI claims must be verifiable cannot publish an unsourced claim about a vendor; the first time
it does, the thesis is gone and no correction restores it. Operationally: if the incident has no
`source_url`, there is no post.

**Lead with the response mechanic.** "Vendor X responded" is structurally different from "vendor X did
wrong" — it is not an accusation, it invites participation, and it gives the vendor a reason to engage
rather than to instruct counsel. `LB-4`'s separation of token-verified replies from observed public
statements is what makes this honest, and it is the thing worth being known for.

**The content already exists.** `docs/campaigns/` holds 959 lines of drafts, including a 447-line
ten-part series on Case #001 with a regulatory angle, plus trust-badge outreach and an HN/Reddit
playbook. The press kit is fully built. None of it publishes before Block I: accountability
journalism from a site carrying a fabricated accusation is not survivable.

**Measure or do not bother.** `BH` adds a source parameter to social links and writes it to
`funnel_events`. Until it lands, every channel decision is a guess and the first distribution question
a funder asks has no answer.

## Acceptance

- The footer GitHub link resolves to the canonical repository without relying on a rename redirect
- Every published post links a `source_url`
- `BH` landed, and the admin marketing view shows which channel produced which visit
