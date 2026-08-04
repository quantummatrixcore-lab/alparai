import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_URL,
  GITHUB_URL,
  TWITTER_URL,
  LINKEDIN_URL,
} from "@/lib/constants";

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
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    inLanguage: ["en", "tr"],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    inLanguage: ["en", "tr"],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
