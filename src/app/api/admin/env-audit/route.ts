import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

interface EnvVarEntry {
  key: string;
  present: boolean;
  nonEmpty: boolean;
  provider: string;
  required: boolean;
  maskedValue: string | null;
}

const REQUIRED_VARS: { key: string; provider: string; required: boolean }[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", provider: "supabase", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", provider: "supabase", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", provider: "supabase", required: true },
  { key: "UPSTASH_REDIS_REST_URL", provider: "redis", required: false },
  { key: "UPSTASH_REDIS_REST_TOKEN", provider: "redis", required: false },
  { key: "GEMINI_API_KEY", provider: "gemini", required: true },
  { key: "NVIDIA_NGC_API_KEY", provider: "nvidia", required: true },
  { key: "ANTHROPIC_API_KEY", provider: "anthropic", required: false },
  { key: "OPENROUTER_API_KEY", provider: "openrouter", required: false },
  { key: "DEEPSEEK_API_KEY", provider: "deepseek", required: false },
  { key: "MISTRAL_API_KEY", provider: "mistral", required: false },
  { key: "RESEND_API_KEY", provider: "resend", required: true },
  { key: "SENTRY_DSN", provider: "sentry", required: false },
  { key: "NEXT_PUBLIC_SENTRY_DSN", provider: "sentry", required: false },
  { key: "GOOGLE_CLIENT_ID", provider: "google_oauth", required: true },
  { key: "GOOGLE_CLIENT_SECRET", provider: "google_oauth", required: true },
  { key: "NEXTAUTH_SECRET", provider: "nextauth", required: true },
  { key: "NEXTAUTH_URL", provider: "nextauth", required: true },
  { key: "CRON_SECRET", provider: "cron", required: false },
  { key: "VERCEL_TOKEN", provider: "vercel", required: false },
  { key: "VERCEL_OIDC_TOKEN", provider: "vercel", required: false },
  { key: "UNSUBSCRIBE_SALT", provider: "newsletter", required: true },
  { key: "NEXT_PUBLIC_APP_URL", provider: "app", required: true },
];

function maskValue(val: string | undefined): string | null {
  if (!val) return null;
  if (val.length <= 4) return "****";
  return val.slice(0, 4) + "****" + val.slice(-4);
}

export async function GET() {
  let admin = null;
  try {
    admin = await getCurrentUser();
  } catch {
    admin = null;
  }
  if (!admin || (admin.role !== "admin" && admin.role !== "ceo")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const entries: EnvVarEntry[] = REQUIRED_VARS.map(({ key, provider, required }) => {
    const val = process.env[key];
    return {
      key,
      present: val !== undefined,
      nonEmpty: val !== undefined && val.length > 0,
      provider,
      required,
      maskedValue: maskValue(val),
    };
  });

  const missing = entries.filter((e) => e.required && (!e.present || !e.nonEmpty));
  const warnings = entries.filter((e) => !e.required && (!e.present || !e.nonEmpty));
  const byProvider: Record<string, EnvVarEntry[]> = {};
  for (const entry of entries) {
    if (!byProvider[entry.provider]) byProvider[entry.provider] = [];
    byProvider[entry.provider]!.push(entry);
  }

  return NextResponse.json({
    ok: true,
    total: entries.length,
    healthy: entries.length - missing.length,
    missing: missing.length,
    warnings: warnings.length,
    entries,
    byProvider,
    summary: {
      status: missing.length === 0 ? "healthy" : "degraded",
      providerCount: Object.keys(byProvider).length,
    },
  });
}
