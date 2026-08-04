export interface IncidentForJsonLd {
  id: string;
  title: string;
  description: string;
  created_at?: string;
  incident_date?: string;
  source_url?: string;
  ai_provider?: { name: string } | null;
}

export function generateIncidentClaimReviewJsonLd(
  incident: IncidentForJsonLd,
  siteUrl: string = "https://www.alparai.com",
) {
  return {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: `${siteUrl}/en/incidents/${incident.id}`,
    claimReviewed: incident.title,
    itemReviewed: {
      "@type": "Claim",
      author: {
        "@type": "Organization",
        name: incident.ai_provider?.name ?? "AI Model / Provider",
      },
      datePublished: incident.incident_date ?? incident.created_at ?? new Date().toISOString(),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "1",
      bestRating: "5",
      worstRating: "1",
      alternateName: "AI Safety Incident Verified",
    },
    author: {
      "@type": "Organization",
      name: "ALPAR AI",
      url: siteUrl,
    },
  };
}

export function generateDatasetJsonLd(siteUrl: string = "https://www.alparai.com") {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "ALPAR AI Public AI Incident Registry",
    description:
      "Global database of artificial intelligence safety incidents, algorithmic harms, and compliance audit records.",
    url: siteUrl,
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "ALPAR AI",
      url: siteUrl,
    },
  };
}
