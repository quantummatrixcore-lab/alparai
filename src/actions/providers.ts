"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export interface ProviderWithSla {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_verified: boolean;
  sla_uptime_pct: number | null;
  sla_mttr_hours: number | null;
  sla_source_url: string | null;
  sla_last_verified_at: string | null;
  incident_count: number;
}

export interface ProviderLeaderboardItem extends ProviderWithSla {
  trust_score: number;
}

export async function getProviderWithSla(slug: string): Promise<ProviderWithSla | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("ai_providers")
    .select("id, slug, name, logo_url, website_url, is_verified")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;

  const { count } = await supabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("ai_provider_id", row.id as string)
    .eq("status", "published");

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    logo_url: row.logo_url as string | null,
    website_url: row.website_url as string | null,
    is_verified: row.is_verified as boolean,
    sla_uptime_pct: null,
    sla_mttr_hours: null,
    sla_source_url: null,
    sla_last_verified_at: null,
    incident_count: count ?? 0,
  };
}

export async function getProvidersLeaderboard(): Promise<ProviderLeaderboardItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_providers")
    .select("id, slug, name, logo_url, website_url, is_verified")
    .order("name", { ascending: true });

  if (error || !data) return [];

  const results: ProviderLeaderboardItem[] = [];

  for (const p of data) {
    const { count } = await supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("ai_provider_id", p.id)
      .eq("status", "published");

    const row = p as Record<string, unknown>;
    const incidents = count ?? 0;
    const uptime = (row.sla_uptime_pct as number | null) ?? 99.0;

    const trust_score = Math.max(0, Math.min(100, uptime - incidents * 0.5));

    results.push({
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      logo_url: row.logo_url as string | null,
      website_url: row.website_url as string | null,
      is_verified: row.is_verified as boolean,
      sla_uptime_pct: null,
      sla_mttr_hours: null,
      sla_source_url: null,
      sla_last_verified_at: null,
      incident_count: incidents,
      trust_score,
    });
  }

  return results.sort((a, b) => b.trust_score - a.trust_score);
}
