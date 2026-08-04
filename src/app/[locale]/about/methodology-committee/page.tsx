import { createServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

interface CommitteeMember {
  id: string;
  name: string;
  institution: string;
  role: string;
  avatar_url: string | null;
  joined_at: string;
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "about_methodology_committee" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("description"),
  };
}

export default async function MethodologyCommitteePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "about_methodology_committee" });
  const supabase = await createServerClient();

  const { data: members } = await supabase
    .from("methodology_committee_members" as unknown as "incidents")
    .select("id, name, institution, role, avatar_url, joined_at")
    .order("name", { ascending: true });

  const typedMembers = (members || []) as unknown as CommitteeMember[];

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-32 pb-24">
      {/* Decorative gradients */}
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-accent-glow/10 pointer-events-none absolute right-1/4 bottom-10 h-[400px] w-[400px] rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="from-fg-primary via-fg-secondary to-accent mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary mx-auto max-w-2xl text-lg leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Members Grid or Empty State */}
        {typedMembers.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {typedMembers.map((member) => (
              <div
                key={member.id}
                className="group bg-bg-secondary/40 border-border-primary/50 hover:border-accent-soft/50 hover:shadow-accent-soft/5 relative rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center space-x-4">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="border-border-primary h-16 w-16 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="bg-accent-soft/10 border-accent-soft/30 text-accent flex h-16 w-16 items-center justify-center rounded-full border font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-fg-primary group-hover:text-accent font-semibold transition-colors duration-200">
                      {member.name}
                    </h3>
                    <p className="text-fg-secondary text-sm font-medium">{member.role}</p>
                    <p className="text-accent-soft mt-1 text-xs">{member.institution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-bg-secondary/30 border-border-primary/40 mx-auto max-w-xl rounded-3xl border p-10 text-center shadow-sm backdrop-blur-md md:p-12">
            <div className="bg-accent-soft/10 border-accent-soft/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border">
              <svg
                className="text-accent-soft h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-fg-primary mb-3 text-xl font-bold">{t("empty_title")}</h3>
            <p className="text-fg-secondary text-sm leading-relaxed">{t("empty_text")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
