# ADR-001: Intermediary legal model

- **Status:** Accepted
- **Date:** 2026-06-01
- **Decider:** Founders

## Context

We host user-submitted reports about AI systems. Content may be defamatory, copyright-infringing, or otherwise unlawful if false. The question is: who is liable — the user who submitted the content, or the platform that hosts it?

## Decision

ALPAR AI operates as an **intermediary platform** in the sense of:

- EU E-Commerce Directive (2000/31/EC), Article 14
- Turkish E-Commerce Law (6563 sayılı Kanun)

We do not pre-moderate submissions (except for automated PII masking and obvious illegal content detection). Liability for the accuracy of submissions rests with the user who submitted them.

## Consequences

- We are protected from most third-party liability claims under Article 14 / hosting safe harbor.
- We do not become a publisher and do not need to fact-check submissions.

* We must respond to takedown notices within 7 days.
* We must have a clear Imprint page with the legal entity's identity.
* AI providers (the subjects of reports) have a right to respond; we publish verified responses.
* A takedown queue is a hard requirement.

## Alternatives considered

- **Pre-moderation (sikayetvar model with 1-2 day delay):** rejected. Too slow, kills virality, doesn't scale.
- **Editorial curation:** rejected. We don't have the headcount and it conflicts with neutrality.
- **AI auto-moderation (LLM-as-moderator):** rejected for v1. False positive risk is too high. PII Guardian is the only automated gate.
