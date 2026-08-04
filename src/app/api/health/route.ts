import { NextResponse } from "next/server";

interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "not_configured";
  latencyMs: number | null;
  error?: string;
}

interface HealthCheckDetail {
  status: "healthy" | "unhealthy";
  services: ServiceHealth[];
  timestamp: string;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function checkSupabase(): Promise<ServiceHealth> {
  const start = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      name: "supabase",
      status: "not_configured",
      latencyMs: null,
      error: "Missing env vars",
    };
  }
  try {
    const res = await fetch(`${url}/rest/v1/ai_providers?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(3000),
    });
    return {
      name: "supabase",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "supabase",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return { name: "redis", status: "not_configured", latencyMs: null };
  }
  try {
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return {
      name: "redis",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "redis",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkVercel(): Promise<ServiceHealth> {
  const start = Date.now();
  const vercelToken = process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (!vercelToken) {
    return { name: "vercel", status: "not_configured", latencyMs: null };
  }
  try {
    const res = await fetch("https://api.vercel.com/v9/domains", {
      headers: { Authorization: `Bearer ${vercelToken}` },
      signal: AbortSignal.timeout(5000),
    });
    return {
      name: "vercel",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "vercel",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkSentry(): Promise<ServiceHealth> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return { name: "sentry", status: "not_configured", latencyMs: null };
  }
  const valid = dsn.startsWith("https://") && dsn.includes("@");
  return { name: "sentry", status: valid ? "healthy" : "unhealthy", latencyMs: null };
}

async function checkResend(): Promise<ServiceHealth> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { name: "resend", status: "not_configured", latencyMs: null };
  }
  const start = Date.now();
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(3000),
    });
    return {
      name: "resend",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "resend",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkGemini(): Promise<ServiceHealth> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { name: "gemini", status: "not_configured", latencyMs: null };
  }
  const start = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      signal: AbortSignal.timeout(3000),
    });
    return {
      name: "gemini",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "gemini",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkAnthropic(): Promise<ServiceHealth> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { name: "anthropic", status: "not_configured", latencyMs: null };
  }
  const start = Date.now();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: AbortSignal.timeout(5000),
    });
    return {
      name: "anthropic",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "anthropic",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkGoogleOAuth(): Promise<ServiceHealth> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { name: "google_oauth", status: "not_configured", latencyMs: null };
  }
  return { name: "google_oauth", status: "healthy", latencyMs: null };
}

export async function GET(): Promise<NextResponse<HealthCheckDetail>> {
  const services = await Promise.all([
    checkSupabase(),
    checkRedis(),
    checkVercel(),
    checkSentry(),
    checkResend(),
    checkGemini(),
    checkAnthropic(),
    checkGoogleOAuth(),
  ]);

  const unhealthy = services.filter((s) => s.status === "unhealthy");
  const allConfigured = services.filter((s) => s.status !== "not_configured");
  const allHealthy = allConfigured.every((s) => s.status === "healthy");
  const overallStatus = allHealthy && unhealthy.length === 0 ? "healthy" : "unhealthy";

  return NextResponse.json(
    {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString(),
    },
    {
      status: overallStatus === "unhealthy" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
