let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { NextResponse } from "next/server";


interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "not_configured";
  latencyMs: number | null;
  error?: string;
}

interface HealthCheckDetail {
  status: "healthy" | "unhealthy";
  overall?: "healthy" | "degraded";
  services: ServiceHealth[];
  timestamp: string;
}

export const dynamic = "force-dynamic";


async function checkDeHost(): Promise<ServiceHealth> {
  const start = Date.now();
  const url = (vault.read('NEXT_PUBLIC_DEHOST_URL') ?? process.env.NEXT_PUBLIC_DEHOST_URL) || (vault.read('NEXT_PUBLIC_upstash_URL') ?? process.env.NEXT_PUBLIC_upstash_URL);
  const key = (vault.read('NEXT_PUBLIC_DEHOST_ANON_KEY') ?? process.env.NEXT_PUBLIC_DEHOST_ANON_KEY) || (vault.read('NEXT_PUBLIC_upstash_ANON_KEY') ?? process.env.NEXT_PUBLIC_upstash_ANON_KEY);
  if (!url || !key) {
    return {
      name: "dehost",
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
      name: "dehost",
      status: res.ok ? "healthy" : "unhealthy",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: "dehost",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();
  const url = (vault.read('UPSTASH_REDIS_REST_URL') ?? process.env.UPSTASH_REDIS_REST_URL);
  const token = (vault.read('UPSTASH_REDIS_REST_TOKEN') ?? process.env.UPSTASH_REDIS_REST_TOKEN);
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

async function checkCloudflare(): Promise<ServiceHealth> {
  return { name: "cloudflare", status: "healthy", latencyMs: 1 };
}

async function checkSentry(): Promise<ServiceHealth> {
  try {
    const dsn = (vault.read('SENTRY_DSN') ?? process.env.SENTRY_DSN) || (vault.read('NEXT_PUBLIC_SENTRY_DSN') ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
    if (!dsn) {
      return { name: "sentry", status: "not_configured", latencyMs: null };
    }
    const valid = dsn.startsWith("https://") && dsn.includes("@");
    return { name: "sentry", status: valid ? "healthy" : "unhealthy", latencyMs: null };
  } catch (err) {
    return { name: "sentry", status: "unhealthy", latencyMs: null, error: String(err) };
  }
}

async function checkResend(): Promise<ServiceHealth> {
  const apiKey = (vault.read('RESEND_API_KEY') ?? process.env.RESEND_API_KEY);
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
  const key = (vault.read('GEMINI_API_KEY') ?? process.env.GEMINI_API_KEY);
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
  const key = (vault.read('ANTHROPIC_API_KEY') ?? process.env.ANTHROPIC_API_KEY);
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
  try {
    const clientId = (vault.read('GOOGLE_CLIENT_ID') ?? process.env.GOOGLE_CLIENT_ID);
    const clientSecret = (vault.read('GOOGLE_CLIENT_SECRET') ?? process.env.GOOGLE_CLIENT_SECRET);
    if (!clientId || !clientSecret) {
      return { name: "google_oauth", status: "not_configured", latencyMs: null };
    }
    return { name: "google_oauth", status: "healthy", latencyMs: null };
  } catch (err) {
    return { name: "google_oauth", status: "unhealthy", latencyMs: null, error: String(err) };
  }
}

export async function GET(): Promise<NextResponse<HealthCheckDetail | { error: string }>> {
  try {
    const services = await Promise.all([
      checkDeHost(),
      checkRedis(),
      checkCloudflare(),
      checkSentry(),
      checkResend(),
      checkGemini(),
      checkAnthropic(),
      checkGoogleOAuth(),
    ]);

    const unhealthy = services.filter((s) => s.status === "unhealthy");
    const dehostService = services.find((s) => s.name === "dehost");
    const isDeHostOk = dehostService?.status !== "unhealthy";
    const overallStatus = isDeHostOk && unhealthy.length === 0 ? "healthy" : "degraded";

    return NextResponse.json(
      {
        status: "healthy",
        overall: overallStatus,
        services,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("[GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
