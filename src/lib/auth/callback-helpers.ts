import { type NextRequest } from "next/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/constants";

export function safeNextPath(raw: string | null): string {
  if (!raw) return "/profile";
  try {
    const decoded = decodeURIComponent(raw);
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      decoded.includes(":")
    ) {
      return "/profile";
    }
    const url = new URL(decoded, "http://localhost");
    if (url.pathname === "/" || url.pathname === "") return "/profile";
    const pathRegex = /^\/[a-zA-Z0-9_\-/]*$/;
    if (!pathRegex.test(url.pathname)) {
      return "/profile";
    }
    return url.pathname;
  } catch {
    return "/profile";
  }
}

export function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred && (SUPPORTED_LOCALES as readonly string[]).includes(preferred)) {
    return preferred;
  }
  return DEFAULT_LOCALE;
}
