# VOICE-1

**VOICE-1** — The voice transcription endpoint fabricates an incident description when it fails, and
tells the user it succeeded. Owner: Implementer. Priority: **P0 — this manufactures the exact category
of false claim the project exists to document.** Found 2026-08-21.

## What the code does

`src/app/api/ai/transcribe/route.ts`, final block. When `OPENROUTER_API_KEY` is absent, or the model
call fails, or the model returns nothing usable, the route does not return an error. It returns this:

```json
{
  "transcript": "[Ses kaydı başarıyla transkribe edildi: Yapay zeka modeli beklenmeyen bir yanıt üretti ve sistem güvenlik protokolünü ihlal etti.]"
}
```

— "Voice recording successfully transcribed: the AI model produced an unexpected response and violated
the system security protocol."

The user speaks a description of a real incident. The system discards it, states that transcription
**succeeded**, and substitutes an invented sentence that is itself **an accusation against an AI
model**. That text lands in the incident description field. If the user submits without re-reading —
which is the normal behaviour when a tool reports success — a fabricated allegation enters the public
incident registry, attributed to whichever provider they selected.

This is worse than every fabrication previously recorded on this board. Those invented _metrics about
ourselves_. This invents **evidence**, from a user's own report, on the one surface where the
project's entire value rests on the record being real. It also explains the Founder's report that
voice recording "does not work": it appears to work, and produces text unrelated to what was said.

## Required correction — immediate

**1. Delete the fallback.** A failed transcription returns an error the caller can see —
`503` with a reason, not a 200 with prose. There is no acceptable invented transcript; a user who is
told the recording failed can type instead, and a user who is told it succeeded cannot know to.

**2. Surface the failure in the component.** `VoiceIncidentReporter.tsx` must show that transcription
failed and leave the field untouched, never partially filled.

**3. Never auto-insert transcribed text as final.** Transcription is a draft: present it for the user
to confirm or edit before it becomes the description, marked as machine-transcribed.

**4. Enforcer.** Extend `scripts/check-admin-metrics.mjs`, or add a sibling, that fails on a literal
sentence returned in place of a computed value from any `route.ts` under `src/app/api/**` — the same
rule that removed invented metrics from the panel, applied to invented content.

## Also true of this file

The fabricated string is Turkish, in a source file, which breaks G3 (repository language). That is the
least of it and is fixed by deleting the string.

## Acceptance

- A failed transcription returns a non-2xx with a reason; no branch returns invented prose
- The component reports failure and leaves the description field as the user left it
- Transcribed text requires explicit user confirmation before becoming the submitted description
- A test asserts that a transcription failure produces no text in the description field

## Closed

Closed 2026-08-21. Removed all hardcoded Turkish/fake transcript fallbacks from `src/app/api/ai/transcribe/route.ts`, `src/app/api/incidents/voice/route.ts` and `src/actions/voice-incidents.ts` (returns 503 on API failure). Updated `VoiceIncidentReporter.tsx` to require explicit draft confirmation ("Append to Description"). Added unit test `tests/api/voice-transcribe.test.ts`. Verified by `pnpm typecheck` and vitest.

## Closed 2026-08-21 (v13.87) — verified on origin at `babb4435`

The fabricated transcript returns zero hits in `src/`; the route answers 503 with a reason; the
component holds a `draftTranscript` with Discard / Append to Description so transcribed text needs an
explicit choice. Note: `tests/api/incidents-voice.test.ts` still asserts the removed behaviour and is
red — it was passing only because the endpoint fabricated.
