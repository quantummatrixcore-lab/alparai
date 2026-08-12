# KVKK Compliance

> Law No. 6698 on the Protection of Personal Data (KVKK) — Compliance Notes

## Data Controller

ALPAR AI (acting as "Data Controller") processes the following personal data.

## Processed Data Categories

| Category | Data Type                                  | Purpose of Processing                     | Legal Basis (KVKK Art. 5/6)                       |
| -------- | ------------------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| Identity | Name, email, OAuth provider metadata       | Account creation, session management      | Explicit consent (Art. 5/1)                       |
| Content  | Incident title/description, evidence files | Platform operation, moderation            | Explicit consent (Art. 5/1) + Legitimate interest |
| Contact  | IP, user agent (hashed)                    | Security, rate limiting, abuse prevention | Legitimate interest (Art. 5/2-f)                  |
| Cookie   | Session cookie, preference cookie          | Session management, user preferences      | Explicit consent (Art. 5/1)                       |

## Masking (PII Guardian)

Submissions are scanned by **PII Guardian** before storage. Detected personal data (email, phone, national ID, IBAN, credit card, API keys, etc.) are automatically masked. Raw text is never written to public columns.

## Data Retention

- Account data: until account deletion.
- Published incidents: indefinitely with PII masked (for transparency purposes).
- Rejected incidents: deleted after 90 days.
- Audit log: 2 years.
- Backups: 30 days.

## Rights of the Data Subject (KVKK Art. 11)

- To learn whether your personal data is being processed
- To request information if processed
- To learn the purpose of processing and whether it is used in accordance with the purpose
- To know the third parties to whom it is transferred domestically or abroad
- To request correction of incomplete/incorrectly processed data
- To request deletion/destruction when the conditions are met
- To object to analysis with automated systems that produces a negative result
- To claim compensation in case of damage due to unlawful processing

## Application

To exercise your rights, please submit a written application to **privacy@alparai.com** with a document verifying your identity. It will be responded to within 30 days.

Your right to complain to the Personal Data Protection Board (KVKK Board) is reserved (https://www.kvkk.gov.tr).

## International Transfer

Data is hosted in the EU (Frankfurt) region. Standard Contractual Clauses (SCC) are used for transfers outside the EEA.

## Children

The platform is intended for 18+ use. By registering, you confirm that you are 18+.
