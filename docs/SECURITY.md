# Security

> Last updated: 2026-06-01

## Defense in depth

| Layer         | Mechanism                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Transport     | HTTPS only, HSTS preload, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| Framing       | `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP                                           |
| MIME          | `X-Content-Type-Options: nosniff`                                                                   |
| Referrer      | `Referrer-Policy: strict-origin-when-cross-origin`                                                  |
| Permissions   | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                      |
| Script source | CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io`     |
| Style source  | CSP `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`                                 |
| Image source  | CSP `img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com`              |
| Connection    | CSP `connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co`              |
| Object        | CSP `object-src 'none'`                                                                             |
| Base          | CSP `base-uri 'self'`                                                                               |
| Form          | CSP `form-action 'self'`                                                                            |

## Authentication

- Supabase Auth, **Google OAuth** primary, **magic link** secondary.
- Passwords are not stored on our side (Google handles).
- JWT validated on every server action and RSC fetch.
- Session refresh happens in `src/middleware.ts` on every navigation.
- Sign-out clears all Supabase cookies.

## Authorization

Postgres Row Level Security (RLS) is enabled on every table. The `is_moderator(uid)` and `is_admin(uid)` SQL functions gate moderator / admin actions and are `STABLE` so the planner caches per query.

Server Actions for sensitive operations (`moderateIncident`, `reviewTakedown`, `setUserRole`) call `requireModerator()` / `requireAdmin()` first.

## Input validation

Every Server Action validates input with Zod (in `src/lib/validation/schemas.ts`). Validation happens **before** any I/O.

## PII Guardian

Real regex + Luhn check, not a mock. Detected categories:

- Email (RFC 5322 simplified)
- Phone (TR + international, 10–15 digits with optional `+` and separators)
- TC Kimlik (Turkish national ID, 11 digits with checksum)
- TR Passport (`[A-Z]\d{8}`)
- IBAN (TR + generic)
- Credit card (13–19 digits, Luhn-valid)
- IPv4
- URLs with `?token=…`, `?key=…`, `?api_key=…`
- API keys: `sk-…`, `ghp_…`, `AKIA…`, `xai-…`

If PII is detected, the raw text is **not stored** in the public columns. Only the masked text is shown publicly.

## Rate limiting

| Action            | Limit       | Key          |
| ----------------- | ----------- | ------------ |
| Submit incident   | 5 / hour    | `user_id:ip` |
| Submit suggestion | 10 / day    | `user_id`    |
| Sign in           | 10 / 15 min | `ip`         |
| API general       | 100 / min   | `ip`         |

If Upstash is not configured, the rate limiter fails open (allows) and logs a warning. **Configure Upstash in production.**

## Storage

- Supabase Storage with two buckets: `evidence` (public read, 10MB cap) and `avatars` (authenticated, 2MB cap).
- Signed URLs only.
- MIME allowlist: image/_, video/_, application/pdf.
- SHA-256 hash stored in `evidence.sha256_hash` for integrity.

## Secrets

- `.env.local` is gitignored.
- The service role key is `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). It is **server-only** and never reaches the client.
- Rotate keys every 90 days.

## Audit log

Every moderator / admin write goes to `audit_log` (entity_type, entity_id, before, after, actor, ip_hash). Readable only by admins.

## Reporting a vulnerability

Email **security@alparai.com** (PGP key on request). We aim to acknowledge within 48 hours and patch critical issues within 7 days.
