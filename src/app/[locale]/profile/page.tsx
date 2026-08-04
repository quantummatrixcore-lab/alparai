import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Mail, Calendar, Shield, User as UserIcon, Zap, Award } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("profile") };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "profile" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/profile`);

  const supabase = await createServerClient();
  const [{ count: myIncidents }, { count: mySuggestions }, { data: dbUser }] = await Promise.all([
    supabase.from("incidents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("suggestions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("users")
      .select("reputation_score, badges, community_role, interests")
      .eq("id", user.id)
      .single(),
  ]);

  const rep = dbUser?.reputation_score ?? 0;
  const badges = (dbUser?.badges ?? []) as string[];
  const communityRole = dbUser?.community_role as string | undefined;
  const interests = (dbUser?.interests ?? []) as string[];

  return (
    <Container size="narrow" className="py-10">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="bg-bg-tertiary flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
              <UserIcon className="text-fg-muted h-8 w-8" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle>{user.fullName ?? user.email}</CardTitle>
              <div className="text-fg-muted flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {t("joined")}{" "}
                  {formatDate(new Date(user.createdAt), locale)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {user.role !== "user" && (
                  <Badge variant="brand" size="sm" dot>
                    <Shield className="h-3 w-3" /> {user.role}
                  </Badge>
                )}
                {user.isVerified && (
                  <Badge variant="success" size="sm" dot>
                    {t("verified")}
                  </Badge>
                )}
                {communityRole && (
                  <Badge variant="brand" size="sm">
                    {t(`roles.${communityRole}`)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-border-subtle grid grid-cols-2 gap-4 border-t pt-6 lg:grid-cols-3">
          <Link
            href="/my-incidents"
            className="bg-bg-tertiary hover:bg-bg-secondary hover:border-border-subtle flex flex-col justify-center rounded-md border border-transparent p-4 transition-all duration-200"
          >
            <p className="text-fg-primary text-2xl font-bold">{myIncidents ?? 0}</p>
            <p className="text-fg-muted text-xs">{t("incidentsReported")}</p>
          </Link>
          <div className="bg-bg-tertiary flex flex-col justify-center rounded-md p-4">
            <p className="text-fg-primary text-2xl font-bold">{mySuggestions ?? 0}</p>
            <p className="text-fg-muted text-xs">{t("suggestionsMade")}</p>
          </div>
          <div className="bg-brand-500/10 border-brand-500/20 group relative flex flex-col justify-center overflow-hidden rounded-md border p-4">
            <div className="absolute -right-4 -bottom-4 opacity-10 transition-opacity group-hover:opacity-20">
              <Zap className="text-brand-500 h-24 w-24" />
            </div>
            <p className="text-brand-500 relative z-10 flex items-center gap-1.5 text-2xl font-black">
              {rep}
            </p>
            <p className="text-brand-400 relative z-10 text-xs font-medium">
              {t("reputationScore")}
            </p>
          </div>
        </CardContent>
        {badges.length > 0 && (
          <div className="border-border-subtle bg-bg-secondary/30 border-t p-6">
            <h3 className="text-fg-primary mb-3 flex items-center gap-2 text-sm font-semibold">
              <Award className="text-warning-500 h-4 w-4" /> {t("earnedBadges")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b: string, i: number) => {
                const isFounding = b === "Founding Reporter";
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm ${
                      isFounding
                        ? "border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400"
                        : "bg-bg-elevated text-fg-primary border-border-strong"
                    }`}
                  >
                    {isFounding ? (
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        {b}
                      </span>
                    ) : (
                      b
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {interests.length > 0 && (
          <div className="border-border-subtle bg-bg-secondary/20 border-t p-6">
            <h3 className="text-fg-primary mb-3 flex items-center gap-2 text-sm font-semibold">
              {t("interests")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest: string, i: number) => (
                <span
                  key={i}
                  className="bg-bg-elevated text-fg-secondary border-border-subtle inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
                >
                  {t(`interestsList.${interest}`)}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}
