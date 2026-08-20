# MAIL-1

**MAIL-1** — Outreach mail is sent without delivery tracking, and three of seven messages never
arrived. Owner: Implementer (infrastructure), Founder (recipients). Priority: P1.
Measured 2026-08-20 from the sending mailbox.

## What was measured

Seven project outreach messages exist. **Three never arrived** — a permanent failure after repeated
delivery delays, a bad address, and a misconfigured receiving server. **Four were delivered** — to a
security-research platform, a digital-rights organisation, an AI-safety centre and our hosting
provider — and **none has replied** after 16 to 24 days.

**All three failures were silent as far as this project was concerned, for three weeks.** That is the
finding. Not that cold outreach is hard, but that we did not know which of our own messages existed.
An organisation publishing a registry of AI accountability failures was not tracking the delivery of
its own correspondence.

Also measured, and both are zero: no investor outreach has ever been sent, and no grant or
accelerator application exists — while `docs/fundraising/vc-outreach-list.md` maps twenty firms and
twelve state programmes sit at status `open`.

## Why the four that arrived went unanswered

They were not badly written. They were sent early: the artifact they linked to showed an empty
leaderboard, a red build and a pricing page whose buttons do nothing. Four introductions were spent
learning this. **A second approach to the same four before something has visibly changed converts a
non-answer into a no** — hold them until the corpus is loaded.

## Required work

**1. Send through tracked infrastructure.** Resend is already wired (vendor quota registered,
1,500/month) and `src/emails/templates.ts` holds seven production templates. Outreach currently
bypasses all of it. Route it through Resend and capture the delivery webhook, so a bounce is an event
this project sees rather than a silence.

**2. Use the CRM that already exists.** `linkedin_contacts` (moderator-only RLS) carries
`status` constrained to `to_add / added / messaged / responded` — exactly the pipeline needed, and
unused. Record every contact, the date, the channel and the outcome there rather than in a mailbox.

**3. Re-verify the three failed addresses at source** before resending. A resend to the same address
fails the same way.

## Acceptance

- Every outbound outreach message is recorded in `linkedin_contacts` with its status
- A bounce produces a visible record within a day, not a discovery three weeks later
- The three failed recipients have verified addresses or are marked unreachable with a reason
