export const revalidate = 3600; // 1-hour ISR Edge CDN cache

import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Scale,
  ShieldAlert,
  GraduationCap,
  ArrowUpRight,
  Mail,
  Sparkles,
} from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { CalendlyEmbed } from "@/components/marketing/calendly-embed";

import { constructPageMetadata } from "@/lib/seo/metadata";
import { AboutPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export function generateStaticParams() {
  return [{ locale: "tr" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isTr = locale === "tr";
  const title = isTr ? "Danışma Kurulu — ALPAR AI" : "Join the Advisory Board — ALPAR AI";
  const description = isTr
    ? "Yapay zeka hesap verilebilirliğinin geleceğine yön verin. ALPAR AI Danışma Kurulu üyeleri ve açık katılım çağrısı."
    : "Help shape the future of AI accountability. Meet the ALPAR AI Advisory Board and explore active invitations.";

  return constructPageMetadata({
    locale,
    pathname: "/about/advisory-board",
    title,
    description,
  });
}

function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default async function AdvisoryBoardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  let activeMembers: Array<{
    id: string;
    name?: string | null;
    avatar_url?: string | null;
    display_order?: number | null;
    title_tr?: string | null;
    title_en?: string | null;
    institution_tr?: string | null;
    institution_en?: string | null;
    bio_tr?: string | null;
    bio_en?: string | null;
    website_url?: string | null;
    press_url?: string | null;
  }> = [];

  try {
    const supabase = getPublicSupabase();
    const { data: members } = await supabase
      .from("advisory_board_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (members && Array.isArray(members)) {
      activeMembers = members;
    }
  } catch (err) {
    console.error("[AdvisoryBoardPage] Failed to fetch members:", err);
  }

  const isTr = locale === "tr";

  return (
    <div>
      {/* Premium Glassmorphism Header */}
      <div className="bg-bg-secondary/10 border-border-subtle relative overflow-hidden border-b pt-6 pb-16 text-center md:pt-10 md:pb-20">
        {/* Subtle decorative glow */}
        <div className="bg-brand-500/10 pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-[100px]" />

        <Container className="relative">
          <div className="border-brand-500/30 bg-brand-500/5 text-brand-400 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-fg-primary text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("advisoryBoardTitle")}
          </h1>
          <p className="text-fg-secondary mx-auto mt-4 max-w-2xl text-lg font-medium">
            {t("advisoryBoardSubtitle")}
          </p>
        </Container>
      </div>

      {/* Main Content & Vacancy Stage */}
      <Section className="bg-bg-primary py-20">
        <Container className="max-w-5xl">
          {activeMembers.length === 0 ? (
            <div className="border-border-subtle bg-bg-secondary/20 relative mb-16 overflow-hidden rounded-2xl border p-8 shadow-xl backdrop-blur-md md:p-12">
              <div className="bg-brand-500/5 pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full blur-[50px]" />

              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-4">
                  <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
                    <Sparkles className="h-3 w-3" />
                    {isTr ? "Kurul Oluşturulma Aşamasında" : "Board in Formation"}
                  </div>
                  <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
                    {isTr ? "Açık Çağrı & Katılım Daveti" : "Open Call & Invitation"}
                  </h2>
                  <p className="text-fg-secondary leading-relaxed">{t("advisoryBoardEmpty")}</p>
                </div>

                <div className="flex-shrink-0">
                  <a
                    href="mailto:contact@alparai.com?subject=ALPAR%20AI%20Advisory%20Board%20Application"
                    className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <Mail className="h-4 w-4" />
                    {t("advisoryBoardJoinCTA")}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Sought Profiles Section Heading */}
              <div className="mb-12 text-center">
                <h3 className="text-fg-primary text-xl font-bold tracking-tight">
                  {isTr
                    ? "Danışma Kurulunda Aradığımız Uzmanlıklar"
                    : "Expertise We Seek for the Advisory Board"}
                </h3>
                <p className="text-fg-muted mx-auto mt-2 max-w-md text-sm">
                  {isTr
                    ? "Alpar AI'ın bağımsız denetim metodolojilerini yönlendirecek temel roller:"
                    : "Key roles to steer Alpar AI's independent audit methodologies:"}
                </p>
              </div>

              {/* Sought Profiles Grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {activeMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="bg-bg-secondary/10 border-border-subtle hover:border-brand-500/30 group shadow-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <CardHeader className="pb-2">
                      {member.avatar_url ? (
                        <div className="border-brand-500/30 group-hover:border-brand-500/60 relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
                          <Image
                            src={member.avatar_url}
                            alt={member.name || "Advisory Member"}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="border-border-subtle bg-bg-secondary/50 group-hover:border-brand-500/20 group-hover:bg-brand-500/5 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors">
                          {member.display_order === 1 && (
                            <GraduationCap className="text-brand-400 h-6 w-6" />
                          )}
                          {member.display_order === 2 && (
                            <ShieldAlert className="text-brand-400 h-6 w-6" />
                          )}
                          {member.display_order === 3 && (
                            <Scale className="text-brand-400 h-6 w-6" />
                          )}
                          {(!member.display_order || member.display_order >= 4) && (
                            <Users className="text-brand-400 h-6 w-6" />
                          )}
                        </div>
                      )}
                      <CardTitle className="text-fg-primary text-lg leading-tight font-bold">
                        {member.name?.startsWith("[Open Position]")
                          ? isTr
                            ? "[Açık Pozisyon] " +
                              (member.name.replace("[Open Position] ", "") || "")
                            : member.name
                          : member.name ||
                            (isTr ? "Danışma Kurulu Üyesi" : "Advisory Board Member")}
                      </CardTitle>
                      <div className="text-fg-secondary mt-1 text-sm font-medium">
                        {isTr
                          ? member.title_tr || member.title_en || "Danışman"
                          : member.title_en || member.title_tr || "Advisor"}
                      </div>
                      <div className="text-brand-400 mt-2 text-xs font-semibold tracking-wider uppercase">
                        {isTr
                          ? member.institution_tr || member.institution_en || "ALPAR AI"
                          : member.institution_en || member.institution_tr || "ALPAR AI"}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-fg-secondary text-sm leading-relaxed">
                        {isTr
                          ? member.bio_tr || member.bio_en || ""
                          : member.bio_en || member.bio_tr || ""}
                      </p>
                    </CardContent>
                    {(member.website_url || member.press_url) && (
                      <CardFooter className="border-border-subtle/50 flex flex-wrap gap-4 border-t pt-4">
                        {member.website_url && (
                          <a
                            href={member.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase transition-colors"
                          >
                            {t("advisoryBoardWebsiteLink", { defaultValue: "Web Sitesi" })}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {member.press_url && (
                          <a
                            href={member.press_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase transition-colors"
                          >
                            {t("advisoryBoardPressLink", { defaultValue: "Medya Kuruluşu" })}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Calendly Integration Section */}
          <div className="mt-16">
            <CalendlyEmbed isTr={isTr} />
          </div>
        </Container>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${APP_URL}/${locale}` },
          { name: "About", url: `${APP_URL}/${locale}/about` },
          { name: isTr ? "Danışma Kurulu" : "Advisory Board", url: `${APP_URL}/${locale}/about/advisory-board` },
        ]}
      />
      <AboutPageJsonLd
        name={isTr ? "ALPAR AI Danışma Kurulu" : "ALPAR AI Advisory Board"}
        description={isTr ? "ALPAR AI Danışma Kurulu Üyeleri ve Bağımsız Denetim Vizyonu" : "ALPAR AI Advisory Board Members and Governance"}
        url={`${APP_URL}/${locale}/about/advisory-board`}
        members={activeMembers.map((m) => ({
          name: m.name || "Advisory Member",
          role: (isTr ? m.title_tr || m.title_en : m.title_en || m.title_tr) || "Advisor",
          url: m.website_url || undefined,
        }))}
      />
    </div>
  );
}
