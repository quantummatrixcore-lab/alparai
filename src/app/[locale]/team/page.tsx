export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Container, Section } from "@/components/ui/layout";
import {
  Users,
  Crown,
  Network,
  Megaphone,
  Handshake,
  Scale,
  Landmark,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { constructPageMetadata } from "@/lib/seo/metadata";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return [{ locale: "tr" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isTr = locale === "tr";
  const title = isTr
    ? "Ekibimiz & Liderlik — ALPAR AI"
    : "Leadership & Team — ALPAR AI";
  const description = isTr
    ? "ALPAR AI kurucu liderleri ve danışma kurulu: Ercüment Erden, Ahmet Rıfat Albuz ve Prof. Dr. Musa Aygül."
    : "Meet the founding leaders and advisory council behind ALPAR AI: Ercüment Erden, Ahmet Rıfat Albuz, and Prof. Dr. Musa Aygül.";

  return constructPageMetadata({
    locale,
    pathname: "/team",
    title,
    description,
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "team" });
  const isTr = locale === "tr";

  return (
    <div className="relative min-h-screen bg-bg-primary text-fg-primary">
      <BreadcrumbJsonLd
        items={[
          { name: isTr ? "Ana Sayfa" : "Home", url: "/" },
          { name: isTr ? "Ekibimiz" : "Team", url: "/team" },
        ]}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border-subtle bg-bg-secondary/20 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <Container className="relative z-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-400 shadow-[0_0_25px_rgba(168,85,247,0.2)] backdrop-blur-md">
            <Users className="h-7 w-7" />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("eyebrow")}</span>
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-fg-primary via-fg-primary to-fg-muted bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed font-medium text-fg-secondary sm:text-lg">
            {t("subtitle")}
          </p>
        </Container>
      </div>

      {/* Leadership Grid */}
      <Section className="py-20 sm:py-28">
        <Container className="max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 1. Ercüment Erden */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px] transition-all duration-500 group-hover:bg-cyan-500/20" />
              
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/80 font-mono text-2xl font-black text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    EE
                  </div>
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-cyan-300 uppercase">
                    {t("ercument_title")}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-cyan-300">
                  Ercüment Erden
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-cyan-400">
                  {t("ercument_role")}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {t("ercument_bio")}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{t("ercument_hl1")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{t("ercument_hl2")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <a
                  href="https://linkedin.com/in/ercumenterden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 transition hover:text-cyan-300"
                >
                  <span>{t("linkedin_profile")}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[10px] text-fg-muted">K0-K16 Sovereign Core</span>
              </div>
            </div>

            {/* 2. Ahmet Rıfat Albuz */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-[60px] transition-all duration-500 group-hover:bg-emerald-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/80 font-mono text-2xl font-black text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    ARA
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                    {t("ahmet_title")}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-emerald-300">
                  Ahmet Rıfat Albuz
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-emerald-400">
                  {t("ahmet_role")}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {t("ahmet_bio")}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{t("ahmet_hl1")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{t("ahmet_hl2")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <a
                  href="https://ahmetrifatalbuz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  <span>ahmetrifatalbuz.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[10px] text-fg-muted">GTM & Global Media</span>
              </div>
            </div>

            {/* 3. Prof. Dr. Musa Aygül */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-400 hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-amber-500/10 blur-[60px] transition-all duration-500 group-hover:bg-amber-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/80 font-mono text-2xl font-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    MA
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                    {t("musa_title")}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-amber-300">
                  Prof. Dr. Musa Aygül
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-amber-400">
                  {t("musa_role")}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {t("musa_bio")}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{t("musa_hl1")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{t("musa_hl2")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <Link
                  href="/about/advisory-board"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 transition hover:text-amber-300"
                >
                  <span>{t("advisory_chair")}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <span className="font-mono text-[10px] text-fg-muted">WIPO / UNCITRAL Patron</span>
              </div>
            </div>
          </div>

          {/* Extended Advisory Board Gateway */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-border-subtle bg-bg-secondary/20 p-8 text-center backdrop-blur-xl sm:p-12">
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-300">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>{isTr ? "Bağımsız Denetim ve Etik Heyeti" : "Independent Oversight & Ethics Panel"}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-fg-primary sm:text-3xl">
                {isTr ? "Akademik ve Hukuki Danışma Kurulu" : "Academic & Legal Advisory Council"}
              </h2>
              <p className="text-sm leading-relaxed text-fg-secondary">
                {isTr
                  ? "ALPAR AI, bağımsız denetim protokollerini ve AI Act uyum metodolojilerini dünyanın önde gelen bilim insanları ve hukukçularıyla birlikte geliştirmektedir."
                  : "ALPAR AI develops independent auditing protocols and EU AI Act compliance methodologies in consultation with leading scholars and international jurists."}
              </p>
              <div className="pt-4">
                <Link
                  href="/about/advisory-board"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-6 py-3 text-sm font-bold text-brand-300 transition hover:border-brand-500/50 hover:bg-brand-500/20 active:scale-98"
                >
                  <span>{t("view_advisory_board")}</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
