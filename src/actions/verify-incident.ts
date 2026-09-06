"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";

const verifyIncidentSchema = z.string().url();

export interface VerifyIncidentResult {
  status: "verified" | "rejected";
  confidence: number;
  extractedKeywords: string[];
  summary: string;
}

export async function verifyIncident(url: string): Promise<VerifyIncidentResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.verify_incident}:${ip}`);
    if (!rl.ok) {
      return {
        status: "rejected",
        confidence: 0,
        extractedKeywords: [],
        summary: `Rate limit exceeded. Retry in ${rl.retryAfter ?? 60}s.`,
      };
    }

    const parseResult = verifyIncidentSchema.safeParse(url);
    if (!parseResult.success) {
      return {
        status: "rejected",
        confidence: 0,
        extractedKeywords: [],
        summary: "Invalid URL provided.",
      };
    }

    let textContent = "";
    try {
      const res = await fetchWithSsrfGuard(parseResult.data, {
        headers: { "User-Agent": "AlparAI-EvidenceVerifier/1.0" },
      });
      if (res.ok) {
        textContent = await res.text();
      }
    } catch {
      textContent = "";
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerText = textContent.toLowerCase();
    const keywords = [
      "halüsinasyon",
      "bias",
      "hallucination",
      "önyargı",
      "ihlal",
      "leak",
      "sızıntı",
    ];
    const matchedKeywords = keywords.filter((kw) => lowerText.includes(kw));

    if (matchedKeywords.length > 0) {
      return {
        status: "verified",
        confidence: 0.95,
        extractedKeywords: matchedKeywords,
        summary: `Automated evidence analysis detected keywords: ${matchedKeywords.join(", ")}.`,
      };
    }

    return {
      status: "rejected",
      confidence: 0.2,
      extractedKeywords: [],
      summary: "Automated analysis found no indicative risk keywords in the evidence source.",
    };
  } catch (err) {
    console.error("[verifyIncident] Error:", err);
    throw err;
  }
}
