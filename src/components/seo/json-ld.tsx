import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_URL,
  GITHUB_URL,
  TWITTER_URL,
  LINKEDIN_URL,
  SUPPORTED_LOCALES,
} from "@/lib/constants";

/**
 * Safely serializes data to a JSON string for injection into <script type="application/ld+json">.
 * Escapes characters that could break out of the script tag or introduce HTML/script injection:
 * - `<` -> `\u003c`
 * - `>` -> `\u003e`
 * - `&` -> `\u0026`
 * - `\u2028` (Line Separator) -> `\u2028`
 * - `\u2029` (Paragraph Separator) -> `\u2029`
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/icons/android-chrome-512x512.png`,
    description: APP_DESCRIPTION,
    sameAs: [GITHUB_URL, TWITTER_URL, LINKEDIN_URL],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@alparai.com",
      contactType: "customer support",
      availableLanguage: ["English", "Turkish"],
    },
    foundingDate: "2024",
    knowsAbout: ["AI Accountability", "AI Incident Reporting", "AI Safety", "Machine Learning"],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/en/incidents?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    url: APP_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: APP_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    inLanguage: [...SUPPORTED_LOCALES],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function FAQJsonLd({ items }: { items: Array<{ question: string; answer: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function IncidentJsonLd({
  title,
  description,
  dateOccurred,
  url,
  severity,
  provider,
}: {
  title: string;
  description: string;
  dateOccurred?: string;
  url: string;
  severity: string;
  provider: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: dateOccurred ?? new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    keywords: ["AI", "incident", severity, provider, "accountability"],
    inLanguage: [...SUPPORTED_LOCALES],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function ModelJsonLd({
  name,
  description,
  provider,
  ratingValue,
  reviewCount,
  url,
}: {
  name: string;
  description: string;
  provider: string;
  ratingValue?: number;
  reviewCount?: number;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Cloud",
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: provider,
    },
    ...(ratingValue &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingValue,
          reviewCount: reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function BlogArticleJsonLd({
  title,
  description,
  datePublished,
  url,
  authorName,
  image,
}: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
  authorName: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: url,
    headline: title,
    description: description,
    ...(image && { image }),
    datePublished: datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      logo: `${APP_URL}/icons/android-chrome-512x512.png`,
    },
    inLanguage: [...SUPPORTED_LOCALES],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export interface ClaimReviewJsonLdProps {
  url: string;
  claimReviewed: string;
  itemReviewed: {
    name: string;
    author: string;
    datePublished?: string;
    appearanceUrl?: string;
  };
  reviewRating: {
    ratingValue: number | string;
    bestRating?: number | string;
    worstRating?: number | string;
    alternateName?: string;
    ratingExplanation?: string;
  };
  authorName?: string;
  authorUrl?: string;
  datePublished?: string;
}

export function ClaimReviewJsonLd({
  url,
  claimReviewed,
  itemReviewed,
  reviewRating,
  authorName = APP_NAME,
  authorUrl = APP_URL,
  datePublished = new Date().toISOString(),
}: ClaimReviewJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url,
    claimReviewed,
    datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: authorUrl,
    },
    itemReviewed: {
      "@type": "Claim",
      name: itemReviewed.name,
      author: {
        "@type": "Organization",
        name: itemReviewed.author,
      },
      ...(itemReviewed.datePublished && { datePublished: itemReviewed.datePublished }),
      ...(itemReviewed.appearanceUrl && {
        appearance: {
          "@type": "CreativeWork",
          url: itemReviewed.appearanceUrl,
        },
      }),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewRating.ratingValue,
      bestRating: reviewRating.bestRating ?? 5,
      worstRating: reviewRating.worstRating ?? 1,
      ...(reviewRating.alternateName && { alternateName: reviewRating.alternateName }),
      ...(reviewRating.ratingExplanation && { ratingExplanation: reviewRating.ratingExplanation }),
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items?: Array<{ name: string; url: string; description?: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    ...(items && items.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          url: item.url,
          ...(item.description && { description: item.description }),
        })),
      },
    }),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function AboutPageJsonLd({
  name = "About ALPAR AI",
  description,
  url,
  members,
}: {
  name?: string;
  description?: string;
  url: string;
  members?: Array<{ name: string; role: string; url?: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description: description ?? APP_DESCRIPTION,
    url,
    mainEntity: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
      logo: `${APP_URL}/icons/android-chrome-512x512.png`,
      ...(members && members.length > 0 && {
        member: members.map((m) => ({
          "@type": "Person",
          name: m.name,
          jobTitle: m.role,
          ...(m.url && { url: m.url }),
        })),
      }),
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function PricingProductJsonLd({
  plans,
  url,
}: {
  plans: Array<{ name: string; description: string; price: string | number; currency?: string }>;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ALPAR AI Platform & Compliance Solutions",
    description: "Enterprise & community-tier AI accountability, risk monitoring, and incident reporting.",
    url,
    offers: plans.map((p) => ({
      "@type": "Offer",
      name: p.name,
      description: p.description,
      price: typeof p.price === "number" ? p.price.toString() : p.price,
      priceCurrency: p.currency ?? "USD",
      availability: "https://schema.org/InStock",
      url,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function DatasetJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function EducationalOrganizationJsonLd({
  name = "ALPAR AI Academy",
  description,
  url,
  courses,
}: {
  name?: string;
  description?: string;
  url: string;
  courses?: Array<{ name: string; description: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
    description: description ?? "AI Safety and Governance educational curriculum by ALPAR AI.",
    url,
    parentOrganization: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    ...(courses && courses.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "ALPAR Academy Programs",
        itemListElement: courses.map((c) => ({
          "@type": "Course",
          name: c.name,
          description: c.description,
          provider: {
            "@type": "Organization",
            name: APP_NAME,
          },
        })),
      },
    }),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function TechArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    datePublished: datePublished ?? new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    inLanguage: [...SUPPORTED_LOCALES],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

export function ContactPageJsonLd({
  url,
  description,
}: {
  url: string;
  description?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact & Whistleblower Portal — ${APP_NAME}`,
    description: description ?? "Secure whistleblower submission and general inquiry contact point.",
    url,
    mainEntity: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
      email: "hello@alparai.com",
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}

