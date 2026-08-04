import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { IncidentForm } from "@/components/incidents/incident-form";
import { getCurrentUser } from "@/lib/auth/session";
import { Shield, ShieldCheck, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { AIProvider, AIModel } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submit" });
  return {
    title: t("title", { defaultValue: "Report AI Failure" }),
    description: t("description", {
      defaultValue: "Submit a new AI incident with proof and context.",
    }),
  };
}

export default async function SubmitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  const t = await getTranslations({ locale, namespace: "incident" });
  const supabase = await createServerClient();
  const [{ data: providersData }, { data: modelsData }, { count: incidentsCount }] =
    await Promise.all([
      supabase
        .from("ai_providers")
        .select("id, slug, name, description, logo_url, website_url, is_verified")
        .neq("slug", "alpar-autopilot")
        .order("is_verified", { ascending: false })
        .order("name"),
      supabase
        .from("ai_models")
        .select("id, provider_id, name, version, status, released_at, created_at")
        .eq("status", "active")
        .order("name"),
      supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  const providers = (providersData ?? []) as unknown as AIProvider[];
  const models = (modelsData ?? []) as unknown as AIModel[];
  const totalIncidents = incidentsCount ?? 0;

  return (
    <Container size="narrow" className="py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">
          {t("submit_page_title")}
        </h1>
        <p className="text-fg-muted text-sm">{t("submit_page_subtitle")}</p>
      </header>

      {/* Whistleblower Protection Pathway Banner */}
      <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 text-xs">
        <div className="mb-1 flex items-center gap-2 font-semibold text-purple-300">
          <Shield className="h-4 w-4 text-purple-400" />
          <span>{t("whistleblower_title")}</span>
        </div>
        <p className="text-fg-muted leading-relaxed">{t("whistleblower_desc")}</p>
      </div>

      {!isLoggedIn ? (
        <Card className="border-brand-500/20 bg-brand-500/5">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Shield className="text-brand-400 mb-6 h-16 w-16" />
            <h2 className="text-fg-primary mb-3 text-2xl font-bold">
              {t("account_required_title")}
            </h2>
            <p className="text-fg-secondary mx-auto mb-8 max-w-md text-sm leading-relaxed">
              {t("account_required_desc")}
            </p>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button size="lg" leftIcon={<LogIn className="h-4 w-4" />}>
                  {t("signin_btn")}
                </Button>
              </Link>
              <p className="text-fg-muted text-xs">{t("signin_google_desc")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className="border-success-500/30 bg-success-500/5 mb-6 flex items-start gap-3 rounded-lg border p-4"
            role="status"
            aria-live="polite"
          >
            <ShieldCheck className="text-success-500 mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-fg-primary text-sm font-semibold">{t("anon_badge")}</p>
              <p className="text-fg-muted text-xs">{t("anon_badge_desc")}</p>
            </div>
          </div>

          <Card variant="elevated">
            <CardContent>
              <IncidentForm
                providers={providers}
                models={models}
                isLoggedIn={isLoggedIn}
                totalIncidents={totalIncidents}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}
