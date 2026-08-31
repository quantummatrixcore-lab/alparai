import { permanentRedirect } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Case001LegacyRetiredPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect({ href: "/cases/001-grok-passport", locale });
}
