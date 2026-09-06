import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { ShieldCheck, Target, Users } from "lucide-react";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `About Us | AlparAI`,
    description: `Learn about the team and mission behind Alpar AI, the premier Autonomous Compliance and Sovereign Intelligence platform.`,
    openGraph: {
      title: `About Us | AlparAI`,
      description: `Learn about the team and mission behind Alpar AI, the premier Autonomous Compliance and Sovereign Intelligence platform.`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `About Us | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bg-primary py-16 md:py-24">
      <Section className="relative">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Securing the <span className="text-brand-400">Agentic Economy</span>
            </h1>
            <p className="text-fg-muted text-lg leading-relaxed sm:text-xl">
              Alpar AI was born out of a critical realization: As AI models become autonomous, our
              safety and compliance mechanisms must evolve from reactive scripts to proactive,
              sovereign intelligence systems.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="mt-16">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="text-fg-secondary leading-relaxed">
                We are building the definitive quality and security gate for enterprise AI. By
                tracking the "Cognitive DNA" of every LLM interaction, we ensure that biases are
                caught, hallucinations are intercepted, and EU AI Act compliance is mathematically
                enforced before any data reaches the end user.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="bg-brand-500/20 text-brand-400 flex h-8 w-8 items-center justify-center rounded-full">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>Zero-Latency Compliance Auditing</span>
                </li>
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <span>Sovereign Identity & Data Protection</span>
                </li>
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>Empowering AI-Native Workforces</span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary p-8 shadow-2xl">
              <div className="bg-brand-600/20 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px]"></div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">The Swarm Architecture</h3>
                  <p className="text-fg-muted text-sm">
                    Our platform is powered by an orchestra of 38+ specialized AI agents. From
                    penetration testing to UI generation, the Alpar Swarm continuously audits,
                    hardens, and innovates the platform 24/7.
                  </p>
                </div>
                <div className="border-t border-border-subtle pt-8">
                  <h3 className="mb-2 text-xl font-bold text-white">Built for the Future</h3>
                  <p className="text-fg-muted text-sm">
                    We don't just adapt to regulations; we anticipate them. Our architecture is
                    designed to handle the complexities of B2B Neural-Twin economies and
                    self-building SaaS ecosystems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
