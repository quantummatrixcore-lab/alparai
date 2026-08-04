import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://alparai.com"),
  title: {
    default: "ALPAR AI — Trust infrastructure for AI accountability",
    template: "%s · ALPAR AI",
  },
  description:
    "Community-driven incident reporting platform for AI systems. Like Trustpilot, but for AI.",
  applicationName: "ALPAR AI",
  keywords: [
    "AI accountability",
    "AI incidents",
    "AI transparency",
    "AI safety",
    "trust infrastructure",
  ],
  authors: [{ name: "ALPAR AI" }],
  creator: "ALPAR AI",
  publisher: "ALPAR AI",
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      tr: "/tr",
    },
  },
  openGraph: {
    type: "website",
    siteName: "ALPAR AI",
    title: "ALPAR AI — Trust infrastructure for AI accountability",
    description:
      "Community-driven incident reporting platform for AI systems. Like Trustpilot, but for AI.",
    locale: "en_US",
    url: "/",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alparai",
    creator: "@alparai",
    images: ["/og-image.jpg"],
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
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
