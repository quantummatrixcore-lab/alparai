# ADR-002: AGPL-3.0 license

- **Status:** Accepted
- **Date:** 2026-06-01

## Decision

ALPAR AI is licensed under **GNU Affero General Public License, version 3** (AGPL-3.0).

## Rationale

- We are building **trust infrastructure**. The code itself must be trustworthy — auditable, forkable, runnable by anyone.
- AGPL closes the "ASP loophole" of GPL: anyone running a modified version over a network must publish their modifications.
- This prevents a closed-source fork from outcompeting us while using our work.

## Consequences

- Anyone can audit, fork, and self-host.
- We benefit from external contributions.

* Commercial entities who want to integrate ALPAR as a library in a closed-source product will not. That's a deliberate trade-off.
* The full license text is at [LICENSE](../LICENSE) and at https://www.gnu.org/licenses/agpl-3.0.txt.

## Alternatives

- **MIT / Apache-2.0:** rejected. Too permissive; doesn't protect the "trust" property.
- **GPL-2.0:** rejected. Doesn't cover network use.
- **SSPL:** rejected. SSPL is not an OSI-approved license and is too restrictive for downstream.
- **BSL / source-available:** considered. Defers the decision but adds complexity. Rejected for v1.
