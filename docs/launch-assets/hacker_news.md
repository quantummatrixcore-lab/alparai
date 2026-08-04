# Show HN: ALPAR AI — Open-source trust infrastructure for tracking AI incidents

Hi HN,

We built ALPAR AI (https://alparai.com) to serve as a public, community-governed ledger of real-world AI incidents, safety bypasses, and provider responses.

We track **408 curated and user-reported cases** across **59 AI providers** (e.g. OpenAI, Google, Anthropic). Our code is entirely open-source (AGPL-3.0) and designed around complete transparency.

Key Features:

- **PII Guardian:** Client/server-side regex scrubber that masks names, emails, phones, and credit cards before they reach our database.
- **Ecosystem Trust Score:** A rating indicating how actively a provider responds to and resolves incidents (transparency stats view).
- **EU AI Act Alignment:** Incidents are classified based on the serious incident reporting obligations under Art. 73.

We'd love to hear your feedback on our data structure and architecture. Code is at: https://github.com/quantummatrixcore-lab/Alparai.com
