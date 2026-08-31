import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://alparai.com"),
  title: {
    default: "AlparAI",
    template: "%s | AlparAI",
  },
  description: "AI Accountability & Incident Reporting Platform",
  applicationName: "AlparAI",
  keywords: [
    "AI accountability",
    "AI incidents",
    "AI transparency",
    "AI safety",
    "trust infrastructure",
  ],
  authors: [{ name: "AlparAI" }],
  creator: "@alparai",
  publisher: "AlparAI",
  alternates: {
    canonical: "/",
    languages: {
      "x-default": "/en",
      en: "/en",
      tr: "/tr",
    },
  },
  openGraph: {
    type: "website",
    siteName: "AlparAI",
    title: "AlparAI — AI Accountability & Incident Reporting Platform",
    description: "AI Accountability & Incident Reporting Platform",
    locale: "en_US",
    url: "/",
    images: [{ url: "/brand-assets/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alparai",
    creator: "@alparai",
    images: ["/brand-assets/og-image.png"],
  },
  robots: {
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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
  appleWebApp: {
    capable: true,
    title: "AlparAI",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A1622" },
    { media: "(prefers-color-scheme: light)", color: "#0A1622" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
