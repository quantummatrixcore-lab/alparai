# PROPOSAL: Community-Repo Strategy (Dual-Repo Model)

This proposal outlines the strategy for split-repo management under **Item 95**. It sets the boundary definitions, safety protocols, licensing terms, and initial documentation for launching a public repository `alparai-community` alongside the private core repository `Alparai.com`.

---

## 1. Content-Boundary Matrix

The following matrix delineates what content is permitted in the public repository versus what must remain strictly confidential in the private core repository.

| Category                 | Public (`alparai-community`)                                                                                         | Private (`Alparai.com`)                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Database Migrations**  | Core table schemas and metadata definitions (e.g. `incident_votes`, `ai_models`) with RLS structures.                | Production backup configurations, internal analytical audit trails, and security migration logs.                                  |
| **Business Logic**       | Open-source assessment algorithms, PII Guardian regular expression rules, and the K-BENCHMARK algorithm description. | Internal admin-moderation actions, automated cost-guard and API gateway routing algorithms.                                       |
| **Ops & Deploy Scripts** | General development setup tools and environment variables guidance.                                                  | Vercel production deployment configurations (`vercel.json`), cron-monitor scripts, Sentry webhooks, and local deployment tooling. |
| **Environment & Config** | Public configuration placeholders and example environment files (`.env.example`).                                    | Actual API keys, Supabase project keys, session secrets, and connection strings.                                                  |
| **Legal Documentation**  | Open methodology, general Terms of Service templates, and community contribution agreements.                         | Specific company registries, internal charter documents, and written consent records of advisory board members.                   |

---

## 2. Secret-Leak Checklist

To guarantee that no private credentials, database secrets, or personal information leak into the public domain, a gitleaks validation script must run on every file before it moves to the public repository.

### Pre-Migration Verification Workflow:

1. **Local Environment Isolation**: Create a clean, isolated directory for files earmarked for export.
2. **Secret Scan Execution**: Run `gitleaks` locally on the candidate file:
   ```bash
   gitleaks detect --source=/path/to/candidate/file --verbose
   ```
3. **Regex Audits**: Execute a manual grep scan across the candidate file for common patterns:
   - Secret key prefixes: `sk-`, `sbp_`, `vcp_`, `ai_`
   - SQL credentials: `postgresql://`, `admin`, `service_role`
   - Common passwords or fallbacks: `|| "http://localhost:5432"`
4. **Author/Commit Sanitization**: Verify that git commit history of files being exported does not contain historical secrets (if copying with history). If history contains violations, squash and commit afresh without history.
5. **Architect Sign-Off**: Do not push or publish the files until they have been audited by the Architect.

---

## 3. AGPL-3.0 License Section

To protect the platform's integrity while fostering open cooperation, the public repository will be licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### Rationale:

- **Copyleft Enforcement**: Any modification or extension of the K-BENCHMARK algorithm or platform APIs must be published back under the same open terms.
- **Network Trigger**: Since ALPAR AI runs as a network service, AGPL-3.0 triggers the source-disclosure clause if a third party hosts a modified version on a server, closing the "SaaS loophole".

---

## 4. README Draft (`alparai-community`)

```markdown
# ALPAR AI Community Repository

Welcome to the public community repository for ALPAR AI — the trust infrastructure for AI accountability.

This repository hosts our open-source K-BENCHMARK methodology, API specifications, and database schemas. It allows researchers, developers, and regulators to verify how AI models are audited and report incidents.

## Repository Contents

- `methodology/`: Scientific descriptions of the K-BENCHMARK scoring and TruthScore math.
- `api-spec/`: OpenAPI schemas for querying public incidents.
- `schemas/`: Core database tables schemas and RLS definitions.
- `pii-rules/`: PII Guardian regex definitions for masking sensitive data.

## Getting Started

To integrate with the ALPAR AI public registry, see our [API Guide](api-spec/README.md).

## Contributing

We welcome contributions to our methodology and PII masking rules. Please read our [Contribution Guide](CONTRIBUTING.md) and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE) for details.
```
