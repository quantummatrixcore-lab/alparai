import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Shield, Zap, Network, BrainCircuit } from "lucide-react";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Vision & Roadmap | Alpar AI",
  description:
    "The Sovereign AI era. Discover our 3-month innovation roadmap, from Auto-SaaS generation to B2B Neural-Twin economies.",
};

export default async function VisionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const roadmapItems = [
    {
      title: "Autonomous 'Auto-SaaS' Factory",
      icon: <BrainCircuit className="text-brand-400 h-6 w-6" />,
      description:
        "The era of renting standard software is over. Alpar AI is evolving to instantly generate isolated, highly-personalized micro-SaaS environments based on user problem descriptions, reducing churn to near-zero.",
      status: "In Development",
    },
    {
      title: "Predictive 'Holographic Memory' Workflows",
      icon: <Zap className="h-6 w-6 text-emerald-400" />,
      description:
        "Transitioning from reactive prompts to proactive intelligence. Our engines will anticipate bottlenecks, quietly optimizing API endpoints and security rules in the background while you sleep.",
      status: "Q3 Implementation",
    },
    {
      title: "B2B Neural-Twin Agent Economy",
      icon: <Network className="h-6 w-6 text-purple-400" />,
      description:
        "The future of B2B is machine-to-machine. We are establishing the infrastructure for Alpar subagents to securely negotiate, exchange data, and form API contracts directly with external enterprise AI agents.",
      status: "Q4 Vision",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A1622] pt-24 pb-20">
      <Section className="relative overflow-hidden">
        {/* Glow effect */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 opacity-30 blur-[120px]">
          <div className="from-brand-600 h-[400px] w-[600px] rounded-full bg-gradient-to-b to-transparent"></div>
        </div>

        <Container>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold">
              <Shield className="h-4 w-4" />
              <span>Sovereign Intelligence Interface v42</span>
            </div>
            <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              The Future of{" "}
              <span className="from-brand-400 bg-gradient-to-r to-cyan-400 bg-clip-text text-transparent">
                Autonomous Compliance
              </span>
            </h1>
            <p className="text-fg-muted mb-10 text-lg leading-relaxed sm:text-xl">
              We are moving beyond standard AI tooling into the era of the Synthetic Operating
              System. Our architecture is designed not just to monitor AI, but to securely
              orchestrate the entire agentic economy.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              3-Month Strategic Roadmap
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {roadmapItems.map((item, index) => (
                <div
                  key={index}
                  className="group hover:border-brand-500/50 relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12] p-8 transition-all hover:shadow-[0_8px_32px_rgba(168,85,247,0.15)]"
                >
                  <div className="group-hover:bg-brand-500/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-fg-muted mb-6 text-sm leading-relaxed">{item.description}</p>
                  <div className="from-brand-600 absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="text-fg-secondary mt-auto inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
