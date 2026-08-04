import { maskPII } from "@/lib/pii/guardian";

export interface HackerOneDisclosedReport {
  id: string;
  title: string;
  url: string;
  created_at: string;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
}

export async function fetchHackerOneDisclosedReports(): Promise<HackerOneDisclosedReport[]> {
  try {
    const res = await fetch("https://hackerone.com/hacktivity.json?filter=type%3Apublic", {
      headers: { Accept: "application/json", "User-Agent": "ALPAR-AI-Bot/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as {
      reports?: Array<{
        id: string;
        title: string;
        url: string;
        created_at: string;
        severity_rating?: string;
        substate?: string;
      }>;
    };

    if (!data || !Array.isArray(data.reports)) {
      return [];
    }

    return data.reports.slice(0, 10).map((r) => ({
      id: String(r.id),
      title: maskPII(r.title || "Disclosed Vulnerability").masked,
      url: r.url || `https://hackerone.com/reports/${r.id}`,
      created_at: r.created_at || new Date().toISOString(),
      severity:
        (r.severity_rating?.toLowerCase() as "low" | "medium" | "high" | "critical") || "medium",
      summary: maskPII(`HackerOne disclosed report #${r.id}`).masked,
    }));
  } catch (err) {
    console.error("Failed to fetch HackerOne reports:", err);
    return [];
  }
}
