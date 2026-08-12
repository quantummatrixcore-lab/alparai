# KVKK Compliance (English Translation)

> Personal Data Protection Law No. 6698 (KVKK) — Compliance Notes

## Data Controller

ALPAR AI (acting as "Data Controller") processes the personal data specified below.

## Processed Data Categories

| Category | Data Type                                  | Purpose of Processing                     | Legal Basis (KVKK Art. 5/6)                       |
| -------- | ------------------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| Identity | Name, email, OAuth provider metadata       | Account creation, session management      | Explicit Consent (Art. 5/1)                       |
| Content  | Incident title/description, evidence files | Platform operation, moderation            | Explicit Consent (Art. 5/1) + Legitimate Interest |
| Contact  | IP address, user agent (hashed)            | Security, rate limiting, abuse prevention | Legitimate Interest (Art. 5/2-f)                  |
| Cookie   | Session cookie, preference cookie          | Session management, user preferences      | Explicit Consent (Art. 5/1)                       |

## Masking (PII Guardian)

Submissions are scanned by **PII Guardian** before storage. Detected personal data (email, phone, national ID, IBAN, credit card, API keys, etc.) are automatically masked. Raw text is never written to public columns.

## Data Retention

- Account data: retained until account deletion.
- Published incidents: retained indefinitely with PII masked (for transparency purposes).
- Rejected incidents: deleted after 90 days.
- Audit log: retained for 2 years.
- Backups: retained for 30 days.

## Rights of the Data Subject (KVKK Art. 11)

- To learn whether your personal data is being processed
- To request information if your personal data has been processed
- To learn the purpose of processing and whether data is used in accordance with its purpose
- To know the third parties to whom personal data is transferred domestically or abroad
- To request correction of incomplete or incorrectly processed data
- To request deletion or destruction of personal data when conditions are met
- To object to analysis performed exclusively by automated systems that produces a result against you
- To claim compensation in case of damage due to unlawful processing of personal data

## Application Procedure

To exercise your rights, please submit a written application to **privacy@alparai.com** along with official documentation verifying your identity. Applications will be responded to within 30 days.

Your right to lodge a complaint with the Personal Data Protection Authority (KVKK Board) is reserved (https://www.kvkk.gov.tr).

## Cross-Border Data Transfer

Data is hosted in the EU (Frankfurt) region. Standard Contractual Clauses (SCC) are utilized for transfers outside the European Economic Area (EEA).

## Minors

The platform is intended for users aged 18 and older. By registering, you confirm that you are 18 years of age or older.
