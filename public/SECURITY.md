# Security Policy — ALPAR AI Enterprise & Sovereign Infrastructure

> Last updated: 2026-10-17  
> Status: Active & Enforced  
> Security Contact: security@alparai.com  
> Canonical Policy: https://alparai.com/SECURITY.md  
> RFC 9116 File: https://alparai.com/.well-known/security.txt  

---

## 1. Defense in Depth Architecture

| Layer         | Mechanism                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Transport     | HTTPS only, HSTS preload, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| Framing       | `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP                                           |
| MIME          | `X-Content-Type-Options: nosniff`                                                                   |
| Referrer      | `Referrer-Policy: strict-origin-when-cross-origin`                                                  |
| Permissions   | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                      |
| Script source | CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.dehost.internal https://*.sentry.io` |
| Style source  | CSP `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`                                 |
| Image source  | CSP `img-src 'self' data: blob: https://*.dehost.internal https://*.googleusercontent.com`          |
| Connection    | CSP `connect-src 'self' https://*.dehost.internal https://*.sentry.io wss://*.dehost.internal`      |
| Object        | CSP `object-src 'none'`                                                                             |
| Base          | CSP `base-uri 'self'`                                                                               |
| Form          | CSP `form-action 'self'`                                                                            |

## 2. Authentication, Authorization & Access Control

- **Auth Protocols:** DeHost Auth with Google OAuth as primary provider and zero-knowledge magic links as secondary.
- **Zero Raw Passwords:** Passwords and plaintext credentials are never accepted or stored.
- **Cryptographic JWT:** Signed tokens verified on every Next.js Server Action and RSC fetch.
- **Session Lifecycles:** Dynamic token rotation and sliding refresh managed in `src/middleware.ts`.
- **Database Isolation:** PostgreSQL Row Level Security (RLS) is strictly active across 100% of production tables.
- **Role Gates:** Strict RBAC (`requireModerator()`, `requireAdmin()`) protects all sensitive moderation and governance endpoints.

## 3. PII Guardian Engine

Our real-time regex + Luhn checksum detection engine (`src/lib/pii/guardian.ts`) sanitizes submissions before database ingress:
- **Email:** RFC 5322 standard patterns.
- **Phone:** TR GSM/landline and international formats (10–15 digits).
- **TC Kimlik:** Turkish National Identity verification with modulus-10 algorithm.
- **Passports:** International and TR passport formats (`[A-Z]\d{8}`).
- **Financial Data:** IBAN checksum validation and Luhn-compliant Credit/Debit Card numbers (13–19 digits).
- **Network Identifiers:** IPv4 / IPv6 addresses and cloud VPC endpoints.
- **Credentials & API Keys:** Pre-filter for `sk-`, `ghp_`, `AKIA`, `xai-`, and tokenized URL query strings (`?token=`, `?key=`, `?api_key=`).

*Notice: Any detected PII is tokenized and masked in memory. Raw sensitive credentials are never stored.*

## 4. Rate Limiting & DoS Shield

| Action                | Limit        | Window / Scope       |
| --------------------- | ------------ | -------------------- |
| Incident Submission   | 5 / hour     | `user_id:ip` sliding |
| Community Suggestion  | 10 / day     | `user_id` sliding    |
| Authentication (Auth) | 10 / 15 min  | `ip` sliding         |
| Public REST API       | 100 / min    | `ip` sliding         |
| Takedown Appeals      | 3 / 24 hours | `ip:incident_id`     |

Enforced via distributed `@upstash/ratelimit` algorithms with automatic IP jail routing on sustained anomaly detection.

## 5. Feed Connectors & Moderation Guarantee

- **Staging Isolation:** Automated public scrapers (Reddit, HackerOne, AIAAIC, AIID) ingest data exclusively into isolated staging queues.
- **Zero Auto-Publish Guarantee:** Under no circumstances are external incident reports published to the live leaderboard or public registry without cryptographic sign-off by a certified human moderator.

## 6. EU AI Act Article 50 & Regulatory Compliance

- **Transparency & Disclaimers:** All automated AI outputs, triage assessments, and risk ratings explicitly disclose their machine-generated nature in accordance with EU AI Act Article 50.
- **Synthetic Content Detection:** Platform interactions are anchored with verifiable cryptographic metadata to guarantee chain-of-custody.
- **Audit Trails:** Immutable, tamper-evident audit logs preserve every stage of moderation and dispute resolution.

## 7. Sovereign Evidence & Legal Arbitration (HMK m. 199)

- All dispute filings, take-down requests, and verified manufacturer statements adhere to international UNCITRAL ODR and Turkish Civil Procedure Code (HMK m. 199) electronic evidence standards.
- Preserved timestamps and hash proofs serve as legally admissible evidentiary records for global AI compliance tribunals.

## 8. Responsible Disclosure & Bug Bounty Program

We value responsible security research and partner closely with the global cybersecurity community.
- **Reporting Inquiries:** Email **security@alparai.com** (PGP public key available on request).
- **SLA Commitment:** First acknowledgement within **48 hours**; triage and remediation deployment within **7 business days**.
- **Recognition & Bounties:** Validated, non-duplicate vulnerabilities reported ethically qualify for our Security Hall of Fame and performance bounties.
- **Safe Harbor:** We strictly commit to zero legal action against researchers acting in good faith under standard responsible disclosure terms.
