import WebSocket from "ws";

export interface GrantPortalTarget {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly isEligible: boolean;
  readonly status: "verified" | "excluded" | "unreachable" | "pending";
  readonly notes: string;
}

export const GRANT_PORTAL_CATALOG: readonly Omit<GrantPortalTarget, "status">[] = [
  {
    id: "ms-startups",
    name: "Microsoft for Startups Founders Hub",
    url: "https://startups.microsoft.com",
    isEligible: true,
    notes:
      "$150k Azure + Azure OpenAI credit stream. Pre-seed eligible, no incorporation mandatory.",
  },
  {
    id: "openai-research",
    name: "OpenAI Researcher Access Program",
    url: "https://openai.com/research/overview",
    isEligible: true,
    notes: "$1,000 direct AI Safety & Incident Transparency research grant.",
  },
  {
    id: "nvidia-inception",
    name: "NVIDIA Inception Program",
    url: "https://www.nvidia.com/en-us/startups/",
    isEligible: true,
    notes: "Non-equity AI acceleration, GPU credits & DLI technical support.",
  },
  {
    id: "supabase-startups",
    name: "Supabase for Startups",
    url: "https://supabase.com/startups",
    isEligible: true,
    notes: "$3,000 PostgreSQL platform & auth credits (12 months).",
  },
  {
    id: "vercel-oss",
    name: "Vercel Open Source Program",
    url: "https://vercel.com/oss",
    isEligible: true,
    notes: "Next.js 15 open source infrastructure sponsorship.",
  },
  {
    id: "gcp-startups",
    name: "Google Cloud for Startups",
    url: "https://cloud.google.com/startup",
    isEligible: true,
    notes: "$2k - $350k Vertex AI & Gemini API credit stream.",
  },
  {
    id: "github-startups",
    name: "GitHub for Startups",
    url: "https://github.com/enterprise/startups",
    isEligible: true,
    notes: "$10k platform credit + 1 year GitHub Enterprise (20 seats).",
  },
  {
    id: "aws-activate",
    name: "AWS Activate Portfolio",
    url: "https://aws.amazon.com/startups",
    isEligible: true,
    notes: "$1k - $100k AWS Bedrock (Claude / Llama 3) compute credits.",
  },
  {
    id: "yz-fabrikasi",
    name: "Yapay Zeka Fabrikası",
    url: "https://yapayzekafabrikasi.com",
    isEligible: false,
    notes: "EXCLUDED FROM AUTOMATION PER MASTER_PLAN v11.94 (explicit bot submission ban).",
  },
];

export async function verifyGrantPortalsViaCDP(
  cdpUrl = "http://127.0.0.1:9222",
): Promise<GrantPortalTarget[]> {
  try {
    const res = await fetch(`${cdpUrl}/json/list`);
    if (!res.ok) {
      console.warn(
        `[CDP] Chrome CDP endpoint unreachable (status ${res.status}). Returning unreachable status.`,
      );
      return GRANT_PORTAL_CATALOG.map((p) => ({
        ...p,
        status: p.isEligible ? "unreachable" : "excluded",
      }));
    }

    const tabs = (await res.json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
    const activeTab = tabs.find((t) => t.type === "page");

    if (!activeTab) {
      console.warn("[CDP] No active browser page found. Returning unreachable status.");
      return GRANT_PORTAL_CATALOG.map((p) => ({
        ...p,
        status: p.isEligible ? "unreachable" : "excluded",
      }));
    }

    const ws = new WebSocket(activeTab.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      ws.on("open", resolve);
      ws.on("error", reject);
    });

    const results: GrantPortalTarget[] = [];

    for (const portal of GRANT_PORTAL_CATALOG) {
      if (!portal.isEligible) {
        results.push({ ...portal, status: "excluded" });
        continue;
      }

      const isNavigated = await new Promise<boolean>((resolve) => {
        const reqId = Math.floor(Math.random() * 100000);
        const timer = setTimeout(() => resolve(false), 3000);

        const messageHandler = (data: WebSocket.RawData) => {
          try {
            const parsed = JSON.parse(data.toString()) as {
              id?: number;
              result?: { frameId?: string };
            };
            if (parsed.id === reqId) {
              clearTimeout(timer);
              ws.off("message", messageHandler);
              resolve(Boolean(parsed.result?.frameId));
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.on("message", messageHandler);
        ws.send(
          JSON.stringify({
            id: reqId,
            method: "Page.navigate",
            params: { url: portal.url },
          }),
        );
      });

      results.push({
        ...portal,
        status: isNavigated ? "verified" : "unreachable",
      });
    }

    ws.close();
    return results;
  } catch (error) {
    console.warn("[CDP Warning] Remote browser connection error:", error);
    return GRANT_PORTAL_CATALOG.map((p) => ({
      ...p,
      status: p.isEligible ? "unreachable" : "excluded",
    }));
  }
}
