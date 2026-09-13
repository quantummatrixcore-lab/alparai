# SEC-2

**SEC-2** — Finish the disclosure programme, and schedule the community connectors that already exist.
Owner: Implementer, with the Founder on the promise being made. Priority: P2.
Rewritten 2026-08-20 after measurement: most of this is built.

## What already exists

`SECURITY.md` is published with a responsible-disclosure policy and a `security@alparai.com` contact,
and `public/.well-known/security.txt` is in place. The gap is one line in that file:
**"in the process of launching"** describes the bug bounty. That sentence has to become either a live
programme or an honest statement of what we actually offer today.

More interesting: **connectors for the community channels are already written.**
`src/lib/connectors/hackerone.ts` fetches disclosed reports, and `src/lib/connectors/reddit.ts`
searches AI subreddits for failure keywords. The `incidents` table's `incident_source` enum already
admits `hackerone`, `reddit`, `hn`, `github` and `rss`.

So Reddit and HackerOne are not only places to post — **this codebase already treats them as incident
sources**, and the corpus pipeline was designed to ingest from them.

## What is missing

**Almost certainly, that they have never run.** `LB-2` established that no cron in this project had
ever executed and that `dehost.json` now schedules three jobs. These connectors are the same class of
capability as the 25 unscheduled handlers: written, wired, unreachable. Confirm whether any connector
is scheduled, and schedule what should be, within the plan's cron budget.

Ingested rows also need the same discipline `LB-3` imposes on the corpus import: a source URL on every
row, no invented provider attribution, and moderation before anything from a public forum is published
as an incident. A Reddit post is a claim, not a finding.

## The reciprocity argument, since it is the reason this is not housekeeping

A platform arguing that AI vendors must accept reports about their failures and answer them publicly
is asked the same question first. A vendor receiving our right-of-reply notice can check in a minute
whether we do the same. The answer should be visibly yes: a monitored contact, a stated response
window we meet, and — for the same reason the leaderboard publishes each vendor's response rate — our
own open report count and oldest unanswered report visible in the panel.

## Acceptance

- The bug-bounty sentence in `SECURITY.md` states what is actually offered
- Connector schedule confirmed; anything scheduled produces rows with a `source_url`
- Nothing from a public forum publishes without moderation
- Open report count and oldest unanswered report visible in the admin panel
