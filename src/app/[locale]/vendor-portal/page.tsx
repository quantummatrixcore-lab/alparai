import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import {
  VendorDefensePortalClient,
  type VendorPortalIncidentItem,
} from "@/components/vendor-portal/vendor-defense-portal-client";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vendorPortal" });
  return {
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

export default async function VendorPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();

  // Query published incidents from Supabase
  const { data: dbIncidents } = await supabase
    .from("incidents")
    .select(
      "id, title, category, severity, status, provider_custom_name, model_custom_name, description, created_at, vendor_response_text, vendor_response_at",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const incidents: VendorPortalIncidentItem[] = (dbIncidents || []).map((inc) => ({
    id: inc.id,
    title: inc.title || "",
    category: inc.category || "unknown",
    severity: (inc.severity as VendorPortalIncidentItem["severity"]) || "medium",
    status: inc.status || "published",
    providerName: inc.provider_custom_name || "",
    modelName: inc.model_custom_name || "",
    description: inc.description || "",
    createdAt: inc.created_at || new Date().toISOString(),
    vendorResponseText: inc.vendor_response_text,
    vendorResponseAt: inc.vendor_response_at,
  }));

  return <VendorDefensePortalClient initialIncidents={incidents} />;
}
