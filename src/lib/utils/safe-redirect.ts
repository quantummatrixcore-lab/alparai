const SCHEME_PREFIX_PATTERN = /^\/[a-zA-Z][a-zA-Z\d+.-]*:/;

export function isSafeNextPath(value: string): boolean {
  if (value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  if (SCHEME_PREFIX_PATTERN.test(value)) return false;
  return true;
}

export function sanitizeNextPath(
  raw: string | null | undefined,
  fallback: string = "/profile",
): string {
  if (!raw) return fallback;
  return isSafeNextPath(raw) ? raw : fallback;
}
