import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { logger } from "@/lib/utils/logger";
import { INTEGRATION_SERVICES, getServiceById } from "@/lib/integrations/registry";
import type {
  IntegrationService,
  IntegrationStatus,
  IntegrationAlternative,
  IntegrationResponse,
  ServiceStatus,
} from "@/lib/integrations/types";

const ACTIVE_SERVICES = INTEGRATION_SERVICES.filter((s) => s.envVars.length > 0);

const ENV_ALIAS_GROUPS: Record<string, string[][]> = {
  github: [["GITHUB_PERSONAL_ACCESS_TOKEN", "GITHUB_TOKEN", "GH_TOKEN"]],
  "github-actions": [["GITHUB_PERSONAL_ACCESS_TOKEN", "GITHUB_TOKEN", "GH_TOKEN"]],
  vercel: [["VERCEL_TOKEN", "VERCEL_OIDC_TOKEN"]],
  gemini: [["GEMINI_API_KEY", "GOOGLE_API_KEY"]],
  tavily: [["TAVILY_API_KEY", "tavily"]],
  supabase: [
    ["NEXT_PUBLIC_SUPABASE_URL"],
    ["SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  ],
  stripe: [["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]],
  cloudflare: [["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"]],
};

import { createAdminClient } from "@/lib/supabase/admin";

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function checkServiceStatus(svc: IntegrationService, dbProviders: Set<string>): ServiceStatus {
  // Check if it is satisfied in process.env
  let envSatisfied = false;
  const groups = ENV_ALIAS_GROUPS[svc.id];
  if (groups) {
    envSatisfied = groups.every((group) => group.some((key) => Boolean(getEnv(key))));
  } else {
    envSatisfied = svc.envVars.filter((k) => Boolean(getEnv(k))).length > 0;
  }

  if (envSatisfied) return "connected";

  // Check if it is satisfied in the api_keys database table
  const providerLower = svc.id.toLowerCase();
  if (dbProviders.has(providerLower)) return "connected";

  // Check common aliases
  if (svc.id === "gemini" && (dbProviders.has("google") || dbProviders.has("gemini")))
    return "connected";
  if (svc.id === "upstash" && (dbProviders.has("upstash") || dbProviders.has("redis")))
    return "connected";

  if (svc.envVars.length === 0) return "not_configured";
  return "missing_key";
}

import { GET as getCosts } from "../costs/route";

async function fetchAllCosts(): Promise<Record<string, unknown>[] | null> {
  try {
    const res = await getCosts();
    if (res.ok) {
      const data = (await res.json()) as { services?: Record<string, unknown>[] };
      return data.services || null;
    }
    return null;
  } catch (_e) {
    return null;
  }
}

const ALTERNATIVE_PROMPTS: Record<string, string> = {
  gitlab: "GitLab vs GitHub pros cons pricing community size 2026",
  bitbucket: "Bitbucket vs GitHub pros cons pricing features 2026",
  gitea: "Gitea self hosted git pros cons vs GitHub 2026",
  netlify: "Netlify vs Vercel pros cons pricing comparison 2026",
  "cloudflare-pages": "Cloudflare Pages vs Vercel pros cons pricing 2026",
  railway: "Railway app hosting pros cons pricing alternatives 2026",
  neon: "Neon serverless PostgreSQL pros cons pricing 2026",
  turso: "Turso edge SQLite database pros cons pricing 2026",
  planetscale: "PlanetScale serverless MySQL pros cons pricing 2026",
  "redis-cloud": "Redis Cloud managed pros cons pricing comparison 2026",
  dragonfly: "DragonflyDB vs Redis pros cons performance 2026",
  keydb: "KeyDB multithreaded Redis compatible pros cons 2026",
  recaptcha: "reCAPTCHA v3 pros cons privacy bot detection 2026",
  hcaptcha: "hCaptcha vs reCAPTCHA pros cons privacy 2026",
  "friendly-captcha": "Friendly Captcha privacy bot detection pros cons 2026",
  datadog: "Datadog vs Sentry pros cons pricing observability 2026",
  "grafana-faro": "Grafana Faro frontend observability pros cons 2026",
  highlight: "Highlight session replay open source pros cons 2026",
  sendgrid: "SendGrid vs Resend pros cons pricing email API 2026",
  mailgun: "Mailgun email API pros cons pricing deliverability 2026",
  postmark: "Postmark transactional email pros cons pricing 2026",
  paddle: "Paddle vs Stripe pros cons pricing payments 2026",
  "lemon-squeezy": "Lemon Squeezy payment platform pros cons pricing 2026",
  chargebee: "Chargebee subscription billing pros cons pricing 2026",
  "gitlab-ci": "GitLab CI vs GitHub Actions pros cons comparison 2026",
  circleci: "CircleCI vs GitHub Actions pros cons pricing 2026",
  jenkins: "Jenkins CI pros cons self hosted pipeline 2026",
  cypress: "Cypress vs Playwright pros cons testing 2026",
  selenium: "Selenium vs Playwright pros cons automation 2026",
  puppeteer: "Puppeteer vs Playwright pros cons browser automation 2026",
  lefthook: "Lefthook vs Husky git hooks pros cons performance 2026",
  "pre-commit": "pre-commit framework pros cons Git hooks 2026",
  "github-oauth": "GitHub OAuth vs Google OAuth pros cons auth 2026",
  auth0: "Auth0 authentication pros cons pricing 2026",
  clerk: "Clerk authentication pros cons pricing Next.js 2026",
  plausible: "Plausible analytics pros cons pricing privacy 2026",
  umami: "Umami self hosted analytics pros cons 2026",
  fathom: "Fathom analytics pros cons pricing privacy 2026",
  "fingerprint-pro": "Fingerprint Pro browser fingerprinting pros cons pricing 2026",
  incognia: "Incognia fraud detection pros cons 2026",
  "hashicorp-vault": "HashiCorp Vault secrets management pros cons 2026",
  doppler: "Doppler secrets manager pros cons pricing 2026",
  "op-cli": "1Password CLI secrets automation pros cons 2026",
};

function extractRating(text: string): number {
  const t = text.toLowerCase();
  if (t.includes("most popular") || t.includes("industry standard") || t.includes("market leader"))
    return 5;
  if (t.includes("popular") || t.includes("widely used") || t.includes("top rated")) return 4;
  if (
    t.includes("limited") ||
    t.includes("niche") ||
    t.includes("small community") ||
    t.includes("less popular")
  )
    return 2;
  if (t.includes("deprecated") || t.includes("abandoned") || t.includes("declining")) return 1;
  return 3;
}

function extractPricing(text: string): string {
  const t = text.toLowerCase();
  if (
    t.includes("free") &&
    (t.includes("open source") || t.includes("self-hosted") || t.includes("self hosted"))
  )
    return "Open source (free)";
  if (t.includes("free tier") || t.includes("freemium") || t.includes("starts at $0"))
    return "Free tier available";
  const match = t.match(/\$\d+(?:\.\d+)?(?:\s*\/\s*(?:mo|month|year|yr|m|y))?/);
  if (match) return match[0].trim();
  if (t.includes("enterprise")) return "Enterprise pricing";
  return "Varies";
}

function extractProsCons(text: string): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  const proMatch = text.match(/pro(?:s)?[:\-–—]\s*(.+?)(?=con|$)/i);
  if (proMatch?.[1]) {
    proMatch[1]
      .split(/[,;]/)
      .slice(0, 3)
      .forEach((part) => {
        const clean = part.replace(/[✅❌👍👎\n\r]/g, "").trim();
        if (clean.length > 5 && clean.length < 120)
          pros.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      });
  }

  const conMatch = text.match(/con(?:s)?[:\-–—]\s*(.+?)(?=pro|$)/i);
  if (conMatch?.[1]) {
    conMatch[1]
      .split(/[,;]/)
      .slice(0, 3)
      .forEach((part) => {
        const clean = part.replace(/[✅❌👍👎\n\r]/g, "").trim();
        if (clean.length > 5 && clean.length < 120)
          cons.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      });
  }

  if (pros.length < 2) {
    const bulletPros = text.match(/(?:✅|\+\s)[^.!?\n]+/g);
    if (bulletPros) {
      bulletPros.slice(0, 3).forEach((b) => {
        const clean = b.replace(/[✅\+]/g, "").trim();
        if (clean.length > 5) pros.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      });
    }
  }

  if (cons.length < 1) {
    const bulletCons = text.match(/(?:❌|\-\s)[^.!?\n]+/g);
    if (bulletCons) {
      bulletCons.slice(0, 3).forEach((b) => {
        const clean = b.replace(/[❌\-]/g, "").trim();
        if (clean.length > 5) cons.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      });
    }
  }

  return {
    pros:
      pros.length >= 2
        ? pros.slice(0, 3)
        : ["Good documentation", "Active community", "Regular updates"],
    cons: cons.length >= 1 ? cons.slice(0, 3) : ["Learning curve", "Migration effort required"],
  };
}

async function searchTavily(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY || process.env.tavily;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const snippets: string[] = [];
    if (data.answer) snippets.push(data.answer);
    if (data.results) {
      for (const r of data.results.slice(0, 2)) {
        if (r.content) snippets.push(r.content);
      }
    }

    return snippets.join(" ") || null;
  } catch {
    return null;
  }
}

async function searchAlternatives(serviceId: string): Promise<IntegrationAlternative[]> {
  const svc = getServiceById(serviceId);
  if (!svc || svc.alternatives.length === 0) return [];

  const tavilyKey = process.env.TAVILY_API_KEY || process.env.tavily || null;

  const altPromises = svc.alternatives.map(async (altId) => {
    const altSvc = getServiceById(altId);
    if (!altSvc) return null;

    const result: IntegrationAlternative = {
      id: altId,
      name: altSvc.name,
      description: altSvc.description,
      rating: undefined,
      pros: ["Enterprise grade ecosystem", "Actively maintained"],
      cons: ["Requires configuration", "Learning curve"],
      pricing: "Tiered pricing",
      website: altSvc.url || "",
    };

    const prompt = ALTERNATIVE_PROMPTS[altId];

    if (prompt) {
      const text = tavilyKey ? await searchTavily(prompt) : null;

      if (text) {
        const lower = text.toLowerCase();
        result.description =
          text
            .slice(0, 200)
            .replace(/[\n\r]+/g, " ")
            .trim() + (text.length > 200 ? "..." : "");
        result.rating = extractRating(lower);
        result.pricing = extractPricing(lower);
        const pc = extractProsCons(text);
        result.pros = pc.pros;
        result.cons = pc.cons;
      }
    }
    return result;
  });

  const results = await Promise.all(altPromises);
  return results.filter((r): r is IntegrationAlternative => r !== null);
}

export async function GET() {
  try {
    const allCostsData = (await fetchAllCosts()) || [];
    const altCache = new Map<string, Awaited<ReturnType<typeof searchAlternatives>>>();

    const supabase = createAdminClient();
    const { data: dbKeys } = await supabase.from("api_keys").select("provider");
    const dbProviders = new Set(
      (dbKeys || []).map((k: { provider: string }) => k.provider.toLowerCase()),
    );

    const statuses: IntegrationStatus[] = ACTIVE_SERVICES.map((svc) => {
      const status = checkServiceStatus(svc, dbProviders);

      let costData: { cost: number; budget: number } | null = null;
      if (svc.costKey) {
        const costItem = allCostsData.find((c: Record<string, unknown>) => c.name === svc.costKey);
        if (costItem) {
          const currentCost = typeof costItem.currentCost === "number" ? costItem.currentCost : 0;
          const budgetLimit = typeof costItem.budgetLimit === "number" ? costItem.budgetLimit : 0;
          costData = { cost: currentCost, budget: budgetLimit };
        }
      }

      const presentCount = svc.envVars.filter((k) => Boolean(getEnv(k))).length;
      const envPresent =
        status === "connected" && presentCount === 0 ? svc.envVars.length : presentCount;

      return {
        serviceId: svc.id,
        status,
        envPresent,
        envTotal: svc.envVars.length,
        monthlyCost: costData?.cost,
        budgetLimit: costData?.budget,
      };
    });

    const alternatives: Record<string, IntegrationAlternative[]> = {};
    await Promise.all(
      ACTIVE_SERVICES.map(async (svc) => {
        if (!altCache.has(svc.id)) {
          altCache.set(svc.id, await searchAlternatives(svc.id));
        }
        alternatives[svc.id] = altCache.get(svc.id)!;
      }),
    );
    return NextResponse.json({
      services: statuses,
      alternatives,
      lastUpdated: new Date().toISOString(),
    } satisfies IntegrationResponse);
  } catch (error) {
    logger.error("Integrations API error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to fetch integration status" }, { status: 500 });
  }
}
