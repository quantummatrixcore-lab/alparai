import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Scale, Users, Globe, BookOpen } from "lucide-react";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Vision | AlparAI`,
    description: `Our vision for a safer, more accountable AI ecosystem`,
    openGraph: {
      title: `Vision | AlparAI`,
      description: `Our vision for a safer, more accountable AI ecosystem`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Vision | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function VisionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pillars = [
    {
      title: "Society is the Author",
      icon: <Users className="h-6 w-6 text-brand-400" />,
      description: "Alpar AI does not dictate the rules. We provide the canvas. Through incident reporting, dilemma resolution, and consensus, society itself is drafting the global Constitution for Artificial Intelligence.",
    },
    {
      title: "Decentralized Oversight",
      icon: <Globe className="h-6 w-6 text-emerald-400" />,
      description: "No single corporation should govern AI. The power belongs to the collective intelligence of researchers, developers, and everyday users who experience AI's impact firsthand.",
    },
    {
      title: "Transparent Accountability",
      icon: <Scale className="h-6 w-6 text-cyan-400" />,
      description: "Our Leaderboard isn't driven by marketing budgets. It is driven by real-world data, public trust scores, and verified incidents reported by the community.",
    },
  ];

  return (
    <main className="min-h-screen bg-bg-primary py-16 md:py-24">
      <Section className="relative overflow-hidden">
        {/* Glow effect */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-30 blur-[120px]">
          <div className="h-[400px] w-[600px] rounded-full bg-gradient-to-b from-brand-600 to-transparent"></div>
        </div>

        <Container>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-300">
              <BookOpen className="h-4 w-4" />
              <span>The AI Constitution</span>
            </div>
            <h1 className="mb-8 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Society is writing the <br/>
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Constitution of AI</span>
            </h1>
            <p className="mb-10 text-xl leading-relaxed text-fg-muted sm:text-2xl">
              We are merely the platform. The law is written by the people.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {pillars.map((item, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary p-8 transition-all hover:border-brand-500/50">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-brand-500/10 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-base leading-relaxed text-fg-muted">
                    {item.description}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
