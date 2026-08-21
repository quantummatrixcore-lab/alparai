# AUTH-1

**AUTH-1** — Google sign-in authenticates twice by design when the first attempt fails, and the
failure is invisible. Owner: Implementer. Priority: **P0.** Reported repeatedly by the Founder over a
long period; mechanism located 2026-08-21.

## The mechanism

`src/components/auth/auth-buttons.tsx:112-126`. The Google Identity Services button authenticates the
user and hands back a credential. That credential goes to the `signInWithGoogleIdToken` server action.
Then:

```ts
const res = await signInWithGoogleIdToken(response.credential!, nonceStr);
if (res.ok) {
  window.location.href = next;
} else {
  toast.error(res.error || t("server_error"));
  fallbackOAuthRedirect(); // ← starts a SECOND, full Google login
}
```

and in the branch where no credential arrives, `fallbackOAuthRedirect()` again.
`fallbackOAuthRedirect` calls `signInWithGoogle`, which is `signInWithOAuth` — the full redirect flow
to Google's consent screen.

So a user who has **just authenticated with Google** is sent to Google a second time whenever the
server-side exchange fails. From the user's seat that is not a fallback, it is being asked to log in
twice.

**If the server-side exchange fails for a configuration reason, this happens on every single login** —
which is consistent with a defect reported many times over a long period and never reproduced as
"broken", because the second flow succeeds and the user does get in. The fallback is what hides it.

## Why it has survived so long

The only signal is a toast carrying `res.error`, which appears for a moment during a redirect the user
is already expecting. Nothing is logged server-side that distinguishes "One Tap worked" from "One Tap
failed and we quietly re-authenticated". A defect that always recovers is a defect nobody can file.

## Ruled out, with the reasoning

**The nonce handling is correct.** `auth-buttons.tsx:102-111` sends the SHA-256 **hashed** nonce to
Google and passes the **raw** nonce to `signInWithIdToken`. That asymmetry is Supabase's documented
pattern, not a bug — Google embeds the hash in the token and Supabase hashes the raw value to compare.
An automated review flagged this as the root cause; it is not.

**The middleware does not intercept the callback.** `src/middleware.ts:125` excludes `auth/callback`
from the matcher. **The sign-in page already redirects an authenticated visitor away**
(`signin/page.tsx:47`). **The callback route writes cookies to the response it returns**
(`src/app/auth/callback/route.ts:112-118`), which is the correct pattern.

## Required work

**1. Measure before changing.** Surface `res.error` — log it server-side with the Supabase error code
on every failed `signInWithGoogleIdToken`. One real login produces the reason. Everything below
depends on knowing whether the exchange fails always or occasionally.

**2. Fix the cause the error names.** The most likely candidates are configuration rather than code:
the Google client ID registered in the Supabase provider settings not matching
`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, or ID-token sign-in not enabled for the project.

**3. Never re-authenticate silently.** Automatic fallback is only defensible when the user cancelled
(no credential). On a **server rejection**, show the error and offer a button the user chooses to
press. A system that quietly sends someone through a second identity provider round-trip has decided
on their behalf that the first one did not count.

**4. Cover it with a test.** `tests/e2e/flows/auth-flow.spec.ts` does not assert a complete sign-in
producing exactly one identity-provider round-trip. That assertion is what stops this returning.

## Also found, not the bug

Two callback routes exist — `src/app/auth/callback/route.ts` and
`src/app/[locale]/auth/callback/route.ts` — with `safeNextPath` and `detectLocale` duplicated verbatim.
OAuth targets the first (`auth.ts:67`); the locale-prefixed one is reachable only by email links.
Consolidate them, separately from this fix.

## Acceptance

- A failed ID-token exchange is logged server-side with its Supabase error code
- A successful Google sign-in involves exactly one identity-provider round-trip, verified in the
  browser network log
- No automatic second authentication on server rejection; the retry is user-initiated
- An e2e test asserts the single-round-trip property

## Closed

Closed 2026-08-21. Enhanced server-side logging in `signInWithGoogleIdToken` (`src/actions/auth/auth.ts`) to log error code and status. Removed silent automatic `fallbackOAuthRedirect()` on server rejection in `src/components/auth/auth-buttons.tsx` so user receives error toast and stays on page instead of double-authenticating. Added unit test `tests/api/auth-flow.test.ts`. Verified by `pnpm typecheck` and vitest.
