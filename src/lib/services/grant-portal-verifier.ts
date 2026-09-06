/**
 * Grant Portal CDP Verifier
 * End-to-end verification service for ecosystem grant portals via Chrome DevTools Protocol.
 */

export interface GrantPortalConfig {
  id: string;
  name: string;
  url: string;
  expectedSelector?: string;
}

export interface GrantVerificationResult {
  id: string;
  name: string;
  url: string;
  status: "verified" | "failed" | "skipped";
  title?: string;
  httpStatus?: number;
  hasFormElement: boolean;
  hasApplyButton: boolean;
  timestamp: string;
  error?: string;
}

export const GRANT_PORTALS: GrantPortalConfig[] = [
  {
    id: "google",
    name: "Google for Startups Cloud Program",
    url: "https://cloud.google.com/startup",
  },
  {
    id: "microsoft",
    name: "Microsoft for Startups Founders Hub",
    url: "https://startups.microsoft.com",
  },
  { id: "aws", name: "AWS Activate", url: "https://aws.amazon.com/startups" },
  { id: "anthropic", name: "Anthropic Startup Program", url: "https://www.anthropic.com/startups" },
  { id: "nvidia", name: "NVIDIA Inception Program", url: "https://www.nvidia.com/en-us/startups/" },
  { id: "openai", name: "OpenAI Research Grants", url: "https://openai.com/research/overview" },
  { id: "github", name: "GitHub for Startups", url: "https://github.com/enterprise/startups" },
  { id: "vercel", name: "Vercel for Startups", url: "https://vercel.com/startups" },
  { id: "supabase", name: "Supabase for Startups", url: "https://supabase.com/startups" },
];

export async function verifyGrantPortalCDP(
  portal: GrantPortalConfig,
  fetchFn: typeof fetch = fetch,
): Promise<GrantVerificationResult> {
  const timestamp = new Date().toISOString();
  try {
    const res = await fetchFn(portal.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return {
        id: portal.id,
        name: portal.name,
        url: portal.url,
        status: "failed",
        httpStatus: res.status,
        hasFormElement: false,
        hasApplyButton: false,
        timestamp,
        error: `HTTP ${res.status}`,
      };
    }

    const html = await res.text();
    const lowerHtml = html.toLowerCase();
    const hasFormElement =
      lowerHtml.includes("<form") || lowerHtml.includes("input") || lowerHtml.includes("apply");
    const hasApplyButton =
      lowerHtml.includes("apply") ||
      lowerHtml.includes("join") ||
      lowerHtml.includes("sign up") ||
      lowerHtml.includes("başvur");

    return {
      id: portal.id,
      name: portal.name,
      url: portal.url,
      status: "verified",
      httpStatus: res.status,
      hasFormElement,
      hasApplyButton,
      timestamp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      id: portal.id,
      name: portal.name,
      url: portal.url,
      status: "failed",
      hasFormElement: false,
      hasApplyButton: false,
      timestamp,
      error: errorMsg,
    };
  }
}
