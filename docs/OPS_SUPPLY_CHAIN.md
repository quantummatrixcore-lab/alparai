# ALPAR AI - Supply Chain Security Policy

This document outlines the Software Bill of Materials (SBOM) and commit/release signing policy for the ALPAR AI platform to meet EU AI Act Article 73 transparency and compliance criteria.

## 1. Software Bill of Materials (SBOM)

ALPAR AI maintains a machine-readable Software Bill of Materials in CycloneDX v1.6 JSON format. This tracks all third-party dependencies, open-source modules, and licenses.

- **Storage Location:** `ops/sbom/latest.json`
- **Specification:** CycloneDX v1.6
- **Generation Frequency:** The SBOM is regenerated dynamically before each production release using the CycloneDX NPM tool:
  ```bash
  npx @cyclonedx/cyclonedx-npm --ignore-npm-errors --output-file ops/sbom/latest.json
  ```

## 2. Commit and Release Signing Policy

All code modifications and releases must be cryptographically signed to guarantee authenticity and prevent supply chain injections.

### Sigstore & Cosign Policy

1. **Developer Commits:** All Git commits must be signed using GPG keys or SSH signing keys verified by GitHub. Unsigned commits are rejected by branch protection rules on `master`.
2. **Production Releases:** Vercel builds and GitHub releases are signed using Sigstore's `cosign` tool.
3. **Keyless Signing:** During the GitHub Actions release workflow, we utilize Sigstore keyless signing via OIDC tokens to sign release artifacts and container images (if any).
4. **Verification:** Consumers can verify the authenticity of ALPAR AI releases using:

```bash
cosign verify-blob-attestation --keyless \
  --certificate-identity "https://github.com/quantummatrixcore-lab/Alparai.com/.github/workflows/release.yml@refs/heads/master" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  --signature release-signature.sig \
  ops/sbom/latest.json
```
