import React from "react";
import { setRequestLocale } from "next-intl/server";
import { ConstitutionClient } from "@/components/constitution/constitution-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: _locale } = await params;
  return {
    title: "Yapay Zekanın Global Anayasası | ALPAR AI Public Manifesto",
    description:
      "Yapay zeka kurallarını tek taraflı şirketler ve hükümetler değil; küresel halk ve topluluk koyar. Global Yapay Zeka Anayasası'nı inceleyin ve katkıda bulunun.",
  };
}

export default async function ConstitutionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ConstitutionClient />;
}
