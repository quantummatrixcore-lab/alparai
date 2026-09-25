# Security Policy — ALPAR AI

> Last updated: 2026-09-16

## 1. Defense in Depth

| Layer         | Mechanism                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Transport     | HTTPS only, HSTS preload, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| Framing       | `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP                                           |
| MIME          | `X-Content-Type-Options: nosniff`                                                                   |
| Referrer      | `Referrer-Policy: strict-origin-when-cross-origin`                                                  |
| Permissions   | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                      |
| Script source | CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.dehost.internal https://*.sentry.io`     |
| Style source  | CSP `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`                                 |
| Image source  | CSP `img-src 'self' data: blob: https://*.dehost.internal https://*.googleusercontent.com`              |
| Connection    | CSP `connect-src 'self' https://*.dehost.internal https://*.sentry.io wss://*.dehost.internal`              |
| Object        | CSP `object-src 'none'`                                                                             |
| Base          | CSP `base-uri 'self'`                                                                               |
| Form          | CSP `form-action 'self'`                                                                            |

## 2. Authentication & Authorization

- DeHost Auth, **Google OAuth** primary, **magic link** secondary.
- Passwords are not stored on our side.
- JWT validated on every server action and RSC fetch.
- Session refresh happens in `src/middleware.ts` on every navigation.
- Sign-out clears all DeHost cookies.
- Postgres Row Level Security (RLS) is enabled on 100% of tables.
- Server Actions for sensitive operations (`moderateIncident`, `reviewTakedown`, `setUserRole`) enforce `requireModerator()` or `requireAdmin()`.

## 3. PII Guardian

Strict regex + Luhn validation engine (`src/lib/pii/guardian.ts`):
- Email (RFC 5322)
- Phone (TR + international, 10–15 digits)
- TC Kimlik (Turkish national ID with checksum verification)
- TR Passport (`[A-Z]\d{8}`)
- IBAN (TR + generic)
- Credit card (13–19 digits, Luhn-valid)
- IPv4 / IPv6 addresses
- URLs with credentials/tokens (`?token=`, `?key=`, `?api_key=`)
- Secret keys: `sk-`, `ghp_`, `AKIA`, `xai-`

If PII is detected, raw text is never stored in public columns; only the masked tokenized text is exposed.

## 4. Rate Limiting

| Action            | Limit       | Key          |
| ----------------- | ----------- | ------------ |
| Submit incident   | 5 / hour    | `user_id:ip` |
| Submit suggestion | 10 / day    | `user_id`    |
| Sign in           | 10 / 15 min | `ip`         |
| API general       | 100 / min   | `ip`         |

Enforced via `@upstash/ratelimit` with IP and user token sliding window algorithms.

## 5. Feed Connectors & Moderation Guarantee

- All automated connectors (Reddit, HackerOne feeds, AIAAIC, AIID) operate strictly in staging ingestion mode.
- **Zero Auto-Publish:** No incident or accusation ingested from external public sources publishes automatically without human moderator review and verification.

## 6. Vulnerability Disclosure & Bug Bounty

We take the security of ALPAR AI and our community very seriously.
- **Reporting Channel:** Email **security@alparai.com** (PGP key available on request).
- **SLA:** We acknowledge reports within **48 hours** and aim to triage/patch confirmed issues within **7 days**.
- **Recognition:** Validated, non-duplicate vulnerabilities reported in good faith are eligible for recognition in our Security Hall of Fame and public acknowledgement.
- **Safe Harbor:** We support security research conducted in accordance with responsible disclosure guidelines and will not pursue legal action against researchers acting in good faith.
