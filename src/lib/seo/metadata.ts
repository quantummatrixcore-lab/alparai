import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, APP_URL, SUPPORTED_LOCALES } from "@/lib/constants";

export interface PageMetadataOptions {
  locale: string;
  pathname?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

/**
 * Builds standard, Google-compliant SEO metadata with:
 * - Localized Title & Description
 * - Canonical URL with locale prefix
 * - Hreflang alternates for all supported locales ('en', 'tr') + 'x-default'
 * - Complete OpenGraph tags
 * - Complete Twitter Cards
 * - Robots indexing & rich snippet directives
 */
export function constructPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    locale,
    pathname = "",
    title,
    description,
    keywords = [],
    image = `${APP_URL}/brand-assets/og-image.png`,
    noIndex = false,
    type = "website",
  } = options;

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const cleanPath = normalizedPath === "/" ? "" : normalizedPath;

  const isTr = locale === "tr";
  const defaultTitle = isTr
    ? "ALPAR AI — Yapay Zeka Hesap Verilebilirlik & Güven Altyapısı"
    : "ALPAR AI — Trust infrastructure for AI accountability";

  const defaultDesc = isTr
    ? "Yapay zeka sistemleri için bağımsız denetim ve hesap verebilirlik mahkemesi. 660+ model için tarafsız güvenlik ve EU AI Act uyum sicili."
    : "The Supreme Court of AI Accountability. Independent cross-model auditing, threat defense and EU AI Act compliance platform.";

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDesc;

  const canonicalUrl = `${APP_URL}/${locale}${cleanPath}`;

  const languageAlternates: Record<string, string> = {
    "x-default": `${APP_URL}/en${cleanPath}`,
  };

  for (const loc of SUPPORTED_LOCALES) {
    languageAlternates[loc] = `${APP_URL}/${loc}${cleanPath}`;
  }

  const defaultKeywords = isTr
    ? [
        "AI hesap verilebilirlik",
        "yapay zeka ihlalleri",
        "yapay zeka güvenliği",
        "AI Act uyumluluk",
        "yapay zeka derecelendirme",
        "AI denetim",
        ...keywords,
      ]
    : [
        "AI accountability",
        "AI incidents",
        "AI transparency",
        "AI safety",
        "AI Act compliance",
        "trust infrastructure",
        ...keywords,
      ];

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: pageTitle,
      template: `%s · ${APP_NAME}`,
    },
    description: pageDescription,
    applicationName: APP_NAME,
    keywords: defaultKeywords,
    authors: [{ name: APP_NAME }],
    creator: APP_NAME,
    publisher: APP_NAME,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      type,
      siteName: APP_NAME,
      title: pageTitle,
      description: pageDescription,
      locale: isTr ? "tr_TR" : "en_US",
      alternateLocale: isTr ? ["en_US"] : ["tr_TR"],
      url: canonicalUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@alparai",
      creator: "@alparai",
      title: pageTitle,
      description: pageDescription,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
