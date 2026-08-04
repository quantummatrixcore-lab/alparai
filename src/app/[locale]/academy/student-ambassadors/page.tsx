import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Globe, Trophy } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  return { title: `${t("ambassador_title")} | ALPAR AI`, description: t("ambassador_subtitle") };
}

export default async function StudentAmbassadorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <Badge variant="brand" size="sm">
          {t("ambassador_title")}
        </Badge>
        <h1 className="text-fg-primary mt-3 text-3xl font-bold tracking-tight">
          {t("ambassador_title")}
        </h1>
        <p className="text-fg-muted mt-2 text-sm">{t("ambassador_subtitle")}</p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <GraduationCap className="text-brand-400 mx-auto mb-3 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 font-semibold">Workshops</h3>
            <p className="text-fg-muted text-xs">
              Organize AI safety workshops and model auditing sessions at your university.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="text-brand-400 mx-auto mb-3 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 font-semibold">Network</h3>
            <p className="text-fg-muted text-xs">
              Connect with a global community of student AI safety researchers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="text-brand-400 mx-auto mb-3 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 font-semibold">Leadership</h3>
            <p className="text-fg-muted text-xs">
              Lead empirical model auditing chapters and earn recognition.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t("ambassador_form_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-fg-muted text-sm">{t("ambassador_subtitle")}</p>
        </CardContent>
      </Card>
    </Container>
  );
}
