/**
 * admin-mock.ts — Test-only re-export of canonical platform telemetry.
 *
 * This file is NOT a source of truth. It surfaces CANONICAL_DATA_MOAT_TELEMETRY
 * under the `mockTelemetry` name so that contract tests can assert that the
 * single source of truth is internally consistent, without coupling tests to
 * the constants module path directly.
 *
 * Production code must NEVER import from this file.
 */

export { CANONICAL_DATA_MOAT_TELEMETRY as mockTelemetry } from "@/lib/constants/canonical-stats";
