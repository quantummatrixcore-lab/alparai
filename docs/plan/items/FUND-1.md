# FUND-1

**FUND-1** — Find out what happened to the applications already submitted, and build somewhere to
keep the answer. Owner: Founder (the facts) with Implementer (the schema and the page).
Priority: **P1.** Rewritten 2026-08-20 after a Founder correction.

## What this item used to say, and why it was wrong

It said no application had been made and told the Founder to start applying. **Applications to the
cloud and model credit programmes — Google, NVIDIA and others — were in fact submitted.** The error
came from reading `status: not_started` in a seed migration and reporting it as a fact about the
world. A seeded status describes the table on the day it was written; it is not a record of what
happened. That is the same defect this plan documented in two external auditors in v13.66, committed
here.

## What is actually true

Applications went out. **Nobody knows which of them were granted.** That is the finding, and it is the
same shape as the three outreach emails that failed silently for three weeks (`MAIL-1`): the project
performs an action and then has no instrument that reports the result back. An application whose
outcome is unknown is indistinguishable, operationally, from one never sent — except that it has
already spent the one chance to make a first impression.

## Required work

**1. Reconcile.** For each programme, establish from the mailbox and the provider consoles: was it
submitted, when, what was requested, and what came back. Several of these grant credits silently by
provisioning them on the account rather than by replying — so check the billing console, not only the
inbox. A granted credit that expires unused is the worst of the three possible outcomes.

**2. Give the answer a home.** The applications table must carry, at minimum, the date submitted, the
amount requested, the decision, the date of the decision, and any expiry on what was granted. Where
those columns do not exist, adding them is part of this item — a table that can only hold `not_started`
cannot record the only part that matters. Surfaced through `OPS-1`.

**3. Then, and only then, work the remainder.** Programmes with no application yet get one, in order
of monthly cost relieved. These take no equity, need no pricing decision and require no traction —
they are assessed largely on whether a real technical artifact exists, which it does, publicly.

## Acceptance

- Every programme has a recorded submission date and an outcome, or an explicit "no reply as of
  <date>"
- Credits received appear in the finance costs table and their expiry dates are recorded
- No programme's status in the panel originates from a seed migration
