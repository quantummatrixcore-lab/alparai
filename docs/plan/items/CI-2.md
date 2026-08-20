# CI-2

**CI-2** — Two CI systems are configured; nobody has said which is authoritative.
Owner: Implementer. Priority: P1. Measured 2026-08-20.

`.gitlab-ci.yml` (3,824 bytes) sits at the repository root beside **24 GitHub workflow files** in
`.github/workflows/`. Both describe pipelines for the same project. Only one can be the gate that
actually blocks a bad merge, and a repository that appears to have two has, in practice, an unknown
number — a contributor reading the root file has no way to learn it may never run.

The GitLab file's header block is also Turkish, which puts it in scope for Rule 13 if it stays.

## Required work

Determine which pipeline runs on a real push — the Actions run history is the evidence, not the file's
existence. Delete the other. If `.gitlab-ci.yml` is kept, translate it per Rule 13; if it is removed,
record that here rather than leaving a silent deletion.

## Acceptance

- Exactly one CI configuration remains in the repository
- A test push shows the surviving pipeline running
- This file records which was removed and on what evidence
