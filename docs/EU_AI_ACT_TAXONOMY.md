# EU AI Act serious-incident taxonomy and ALPAR AI mapping

This document defines how ALPAR AI maps reported and imported incidents to the European Union Artificial Intelligence Act (EU AI Act) serious-incident reporting framework (Article 73).

## 1. serious-incident Classifications

Under the EU AI Act, serious incidents are classified into four primary classes based on their real-world impact:

1. **death/health**: Incidents causing death or serious harm to a person's health.
2. **critical-infrastructure**: Incidents causing serious disruption to the management and operation of critical infrastructure.
3. **fundamental-rights**: Incidents violating fundamental rights protected under EU law (e.g., discrimination, extreme privacy invasion).
4. **property-environment**: Incidents causing serious damage to property or the environment.

## 2. High-Risk AI System Categories (Annex III)

If an incident is associated with a high-risk AI system as defined in Annex III, it is classified under one of the following:

- **biometrics**: Remote biometric identification systems.
- **infrastructure**: Critical infrastructure control.
- **education**: Educational or vocational training selection.
- **employment**: Recruitment, promotion, or termination decisions.
- **services**: Essential private/public services (e.g., credit scoring, health insurance).
- **law-enforcement**: AI used by law enforcement authorities.
- **border-control**: Migration, asylum, and border control management.
- **justice**: Administration of justice and democratic processes.

## 3. Reporting Deadlines (Article 73)

The EU AI Act mandates strict reporting windows for providers based on incident severity:

- **2 days**: In case of a serious threat to life or public safety.
- **10 days**: In case of a temporary or permanent disruption to public services or public health.
- **15 days**: Standard reporting deadline for all other serious incidents.

---

## 4. Source-Category Mapping Table

The following table defines the mapping from source incident categories (AIID, AIAAIC, and manual submissions) to the EU AI Act Risk Categories, Serious Incident Class, and default Reporting Deadline:

| Source Category   | EU AI Act Risk Category | Serious Incident Class  | Default Deadline (Days) | Confidence |
| ----------------- | ----------------------- | ----------------------- | ----------------------- | ---------- |
| `bias`            | High Risk               | fundamental-rights      | 15                      | High       |
| `privacy`         | High Risk               | fundamental-rights      | 15                      | High       |
| `security`        | High Risk               | critical-infrastructure | 10                      | Medium     |
| `manipulation`    | Unacceptable Risk       | fundamental-rights      | 15                      | High       |
| `harassment`      | Unacceptable Risk       | fundamental-rights      | 15                      | High       |
| `misinformation`  | Specific Transparency   | fundamental-rights      | 15                      | Medium     |
| `hallucination`   | Specific Transparency   | fundamental-rights      | 15                      | Medium     |
| `inaccessibility` | Minimal / No Risk       | null                    | null                    | Medium     |
| `copyright`       | Minimal / No Risk       | null                    | null                    | High       |
| `other`           | Minimal / No Risk       | null                    | null                    | Low        |

For any incident category not explicitly listed or having ambiguous context, the classification defaults to `unclassified` (risk category is null, serious-incident class is null, and deadline is null).
