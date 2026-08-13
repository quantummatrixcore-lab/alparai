import { permanentRedirect } from "@/i18n/routing";

export default async function Case001RetiredPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect({ href: "/cases/001-grok-passport", locale });
}
