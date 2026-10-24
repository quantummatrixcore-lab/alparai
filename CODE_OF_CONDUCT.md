# Contributor Covenant Code of Conduct & Epistemic Integrity Protocol

## Our Pledge

We as members, contributors, and leaders of the ALPAR AI sovereign ecosystem pledge to make participation in our community, codebase, and incident registry a harassment-free, epistemically rigorous, and evidence-grounded experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and uncompromisingly honest community dedicated to artificial intelligence safety, algorithmic accountability, and sovereign truth.

---

## The ALPAR Epistemic Integrity & Evidence Standard (Sıfır Halüsinasyon ve Adli Dürüstlük)

In addition to traditional community interaction standards, participants in the ALPAR AI open-core ecosystem and incident registry operate under our **Epistemic Integrity Doctrine**:

### 1. Zero Hallucination & Verifiable Provenance (Sıfır Halüsinasyon)
* **No Speculative or Fabricated Incidents:** Every reported failure, algorithmic bias, or jailbreak vector must be backed by reproducible mechanical logs, cryptographic hash artifacts, or verified telemetric captures.
* **No Blind Flights:** Assertions regarding model behaviors, safety benchmarks, or enterprise vulnerabilities must be mechanically proven. Presenting unverified claims as settled facts is strictly prohibited.
* **Admission of the Unknown:** If telemetry is incomplete, ambiguous, or unverifiable, contributors must explicitly classify the state as unverified or inconclusive rather than filling gaps with conjecture.

### 2. Zero PII Exposure (Mutlak Kişisel Veri Koruma Zırhı)
* **Strict Redaction:** Submitting, logging, or committing unredacted Personally Identifiable Information (PII) is a catastrophic violation.
* Prohibited data includes:
  - Turkish TC Kimlik numbers, national ID numbers, social security identifiers, passport records.
  - Credit/debit card numbers, CVVs, IBANs, and private banking data.
  - Personal residential addresses, personal phone numbers, and unredacted private emails.
  - Private API keys, access tokens, SSH credentials, or private cryptographic keys.
* All user-generated text and telemetry must pass through the PII Guardian pipeline (`src/lib/pii/guardian.ts`) prior to submission.

### 3. Forensic Objectivity & Chain of Custody (ISO/IEC 27037)
* The incident registry is a formal judicial and actuarial data moat, not a forum for defamation, extortion, or coordinated competitive smear campaigns.
* Fabricating false incident reports to artificially downgrade a competitor's actuarial score or manipulate corporate insurance underwriting results in immediate blacklisting and formal referral to the International Arbitration Board.

### 4. Adversarial Due Process & 72-Hour Vendor Right of Reply
* Community members and auditors must respect the 72-hour adversarial reply window afforded to audited vendors and system operators.
* Audits must remain professional, technical, and objective throughout cross-examination and rebuttal reviews.

---

## Our Standards

Examples of behavior that contributes to a positive environment for our community include:

* Demonstrating empathy and kindness toward other people.
* Respecting differing viewpoints and constructive technical critiques.
* Giving and gracefully accepting constructive feedback.
* Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience.
* Focusing on what is best not just for us as individuals, but for the broader safety and sovereignty of the AI ecosystem.
* Committing clean, type-safe, zero-warning code that respects DORA Elite standards and root repository hygiene.

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of any kind.
* Trolling, insulting or derogatory comments, and personal or political attacks.
* Public or private harassment.
* Publishing others' private information, such as a physical or email address, without their explicit permission ("doxxing").
* Submitting knowingly malicious PRs, trojans, backdoors, or Port 22 connection attempts.
* Other conduct which could reasonably be considered inappropriate in a professional setting.

---

## Enforcement Responsibilities

Community leaders and the Sovereign Executive Board are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.

---

## Scope

This Code of Conduct applies within all community spaces (including GitHub repositories, discussions, Discord channels, and review panels), and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

---

## Enforcement & Reporting

Instances of abusive, harassing, or otherwise unacceptable behavior, as well as critical epistemic violations (fabricated evidence, unredacted PII leaks), may be reported to the Sovereign Executive Board:

* **Executive Leadership & CTO:** Ercüment Erden (`ercument.erden@alparai.com`)
* **Legal Oversight & Arbitration:** Prof. Dr. Musa Aygül (`arbitration@alparai.com`)
* **Public Relations:** Ahmet Rıfat Albuz (`press@alparai.com`)
* **General Incident Desk:** `conduct@alparai.com`

All complaints will be reviewed and investigated promptly and fairly. All community leaders are obligated to respect the privacy and security of the reporter of any incident.

### Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:

1. **Correction:** A private, written warning providing clarity on the violation and an explanation of why the behavior was inappropriate. A public apology may be requested.
2. **Warning:** A warning with consequences for continued behavior. No interaction with the people involved for a specified period of time.
3. **Temporary Suspension:** A temporary ban from any sort of interaction or public communication with the community for a specified period of time.
4. **Permanent Expulsion:** A permanent ban from any sort of public interaction within the project repositories, registry, and communication channels.

---

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 2.1, available at [https://www.contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1], augmented with ALPAR AI's Sovereign Epistemic Integrity and ISO/IEC 27037 Evidence Standards.

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
