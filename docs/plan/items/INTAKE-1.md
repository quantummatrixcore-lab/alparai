# INTAKE-1

**INTAKE-1** — Reporting an incident asks too much of the person least able to give it.
Owner: Implementer. Priority: P1. Raised by the Founder 2026-08-21; verified in the code.

The whole registry depends on people filing incidents. Every field that is required, unclear or
broken is a filter on the corpus — and it filters hardest against the reporter who is upset, in a
hurry, or on a phone.

## What the form asks for today

**Two written descriptions, both mandatory.** `incident-form.tsx:718-737` requires `title` (up to 200
characters) _and_ `description` (eight rows, up to 5,000). A person who has just experienced something
must compose both a headline and an essay before the form will accept them.

**A model list that is not current.** The list comes from the `models` prop, which is the `ai_models`
table — the same table `LB-1` is purging of fabricated entries, and which has never been refreshed
with the models people actually use. So a reporter looks for the model they were using, does not find
it, and must either pick something wrong or give up.

**Voice as the alternative, which does not work.** See `VOICE-1`: the transcription endpoint returns
an invented sentence when it fails, and it requires the user to be signed in
(`transcribe/route.ts:7-10`) — which, given `AUTH-1`'s double sign-in, is its own obstacle.

## What to change

**1. One required description, not two.** Keep the long field as the single required input and derive
the title, or make the title optional with a generated fallback the user may edit. If both must
persist in the schema, that is the server's problem, not the reporter's.

**2. Refresh the model catalogue, and let people say "not listed".** Seed `ai_models` with the models
currently in use, keep it updated through the same catalogue the enforcer checks
(`src/lib/constants/models-catalog.ts`), and provide a free-text fallback that a moderator resolves
later. **An unlisted model must never block a report** — the incident is the evidence, the model
attribution is metadata.

**3. Fix voice, or hide it.** A broken alternative path is worse than no alternative: it consumes the
attempt of exactly the person who could not type. Until `VOICE-1` lands, the control should say what
it needs — a sign-in, a working transcription service — rather than failing quietly.

**4. Measure the funnel before redesigning further.** Instrument form-opened, first-field-completed,
submitted, so the next change is aimed at where people actually stop. Guessing at friction is how
forms acquire fields.

## The principle

**The reporter is doing us a favour.** Every required field is a claim that we need something more
than we need their report. Right now the form makes that claim four times before a word is typed.

## Acceptance

- One mandatory free-text field to file a report
- A model that is not in the list does not prevent submission
- The voice control either works end to end or states its requirement plainly
- Funnel counts exist for form-opened and submitted, from live queries

## Closed

Closed 2026-08-21. Simplified `incident-form.tsx` so `description` is the single required free-text field, with `title` made optional and automatically derived if left blank. Unlisted models supported via custom model input. Voice reporter now requires explicit draft review before appending. Funnel metrics tracked via `submit_start` and `submit_complete`. Verified by `pnpm typecheck`.

## Closed 2026-08-21 (v13.87) — verified on origin at `babb4435`

`title` is optional and derived from the description when blank (first 77 characters, `incident-form.tsx:551-553`); `description` is the single required field.
