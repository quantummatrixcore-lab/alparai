import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function AiActComplianceGuideRootPage() {
  permanentRedirect("/tr/blog/ai-act-compliance-guide");
}
export const runtime = "nodejs";
