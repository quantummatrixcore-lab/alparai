import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Scale,
  ShieldAlert,
  GraduationCap,
  ArrowUpRight,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("advisoryBoardTitle"),
    description: t("advisoryBoardSubtitle"),
  };
}

export default async function AdvisoryBoardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const supabase = await createServerClient();
  const { data: members } = await supabase
    .from("advisory_board_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const activeMembers = members && members.length > 0 ? members : [];

  const isTr = locale === "tr";

  return (
    <div>
      {/* Premium Glassmorphism Header */}
      <div className="bg-bg-secondary/10 border-border-subtle relative overflow-hidden border-b py-24 text-center">
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
                  <Link
                    href="mailto:quantum.matrix.core@gmail.com?subject=ALPAR%20AI%20Advisory%20Board%20Application"
                    className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <Mail className="h-4 w-4" />
                    {t("advisoryBoardJoinCTA")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
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
                    className="bg-bg-secondary/10 border-border-subtle hover:border-brand-500/30 group shadow-sm transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="border-border-subtle bg-bg-secondary/50 group-hover:border-brand-500/20 group-hover:bg-brand-500/5 mb-4 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors">
                        {member.display_order === 1 && (
                          <GraduationCap className="text-brand-400 h-6 w-6" />
                        )}
                        {member.display_order === 2 && (
                          <ShieldAlert className="text-brand-400 h-6 w-6" />
                        )}
                        {member.display_order === 3 && <Scale className="text-brand-400 h-6 w-6" />}
                        {(!member.display_order || member.display_order >= 4) && (
                          <Users className="text-brand-400 h-6 w-6" />
                        )}
                      </div>
                      <CardTitle className="text-fg-primary text-base leading-tight font-bold">
                        {member.name.startsWith("[Open Position]")
                          ? isTr
                            ? "[Açık Pozisyon] " + member.name.replace("[Open Position] ", "")
                            : member.name
                          : member.name}
                      </CardTitle>
                      <div className="text-fg-secondary mt-1 text-sm font-medium">
                        {isTr ? member.title_tr : member.title_en}
                      </div>
                      <div className="text-brand-400 mt-2 text-xs font-semibold tracking-wider uppercase">
                        {isTr ? member.institution_tr : member.institution_en}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-fg-secondary text-sm leading-relaxed">
                        {isTr ? member.bio_tr : member.bio_en}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
