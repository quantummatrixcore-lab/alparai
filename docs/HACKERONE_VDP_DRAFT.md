# 🛡️ ALPAR AI — HackerOne Public Vulnerability Disclosure & Bug Bounty Policy (Draft)

## 1. Program Information

- **Organization Name:** ALPAR AI
- **Primary Contact:** ercument.erden@alparai.com / quantum.matrix.core@gmail.com
- **Program Type:** Public Vulnerability Disclosure Program (VDP) + Paid Bug Bounty
- **License / Codebase:** AGPL-3.0 Open Source Core ([GitHub Repo](https://github.com/quantummatrixcore-lab/Alparai.com))

## 2. In-Scope Targets

- `*.alparai.com` (Production Next.js 15 Web Application)
- `https://alparai.com/api/*` and Next.js Server Actions (`src/actions/*`)
- Database Policies: Supabase Row Level Security (RLS) policies
- Data Privacy Engine: PII Guardian (`src/lib/pii/guardian.ts`)

## 3. Out-of-Scope Targets & Vulnerability Types

- Third-party managed infrastructure (Vercel Edge Platform, Supabase Cloud Core Engine, Upstash Redis Core)
- Volumetric Denial of Service (DoS / DDoS) attacks
- Social engineering or phishing of ALPAR AI employees, contractors, or users
- Physical security of facilities or infrastructure
- Non-exploitable low-severity bugs (e.g. missing security headers without practical exploit vector)

## 4. Safe Harbor Statement

ALPAR AI considers good-faith security research conducted in accordance with this policy to be authorized. We will not take legal action against researchers who:

- Act in good faith to avoid privacy violations, destruction of data, and interruption or degradation of our service during security testing.
- Do not access, modify, or exfiltrate user data beyond what is strictly necessary to demonstrate a vulnerability.
- Promptly report any security issue discovered to our team without public disclosure prior to mutual agreement and remediation.
- Comply with applicable local and international privacy laws (e.g., KVKK, GDPR).

## 5. Bounty / Reward Matrix (USD)

| Severity Level  | Definition / Example Vulnerabilities                                                            | Reward Range        |
| :-------------- | :---------------------------------------------------------------------------------------------- | :------------------ |
| **P1 Critical** | Remote Code Execution (RCE), Supabase RLS Bypass, Unauthenticated Mass Data Leakage             | **$1,000 – $2,500** |
| **P2 High**     | Unauthorized Privilege Escalation to Admin, PII Guardian Bypass allowing unmasked PII insertion | **$500 – $1,000**   |
| **P3 Medium**   | CSRF on sensitive mutation actions, Broken Rate Limiting on critical endpoints                  | **$150 – $400**     |
| **P4 Low**      | Non-sensitive information disclosure, Low-impact XSS with minimal user impact                   | **$50 – $100**      |

## 6. Service Level Agreements (SLA)

- **First Response / Triage:** < 24 Hours
- **Resolution Target (P1 / P2):** < 7 Days
