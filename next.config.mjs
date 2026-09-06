/**
 * Security headers applied to all routes.
 */
const isTest =
  process.env.NODE_ENV === "test" &&
  process.env.IS_PLAYWRIGHT_TEST === "true" &&
  process.env.NEXT_TEST_AUTH_BYPASS === "true";

const cspRules = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.google.com https://*.gstatic.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: https://*.googleusercontent.com https://avatars.githubusercontent.com https://*.supabase.co https://logo.clearbit.com",
  "connect-src 'self' wss://alparai.com wss://*.alparai.com https://*.supabase.co https://*.sentry.io wss://*.supabase.co https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.googleapis.com https://*.posthog.com https://*.upstash.io https://va.vercel-scripts.com",
  "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://*.google.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "object-src 'none'",
];

if (!isTest) {
  cspRules.push("upgrade-insecure-requests");
}

const csp = cspRules.join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
  },
  ...(isTest
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const embedCsp = csp.replace(
  "frame-ancestors 'none'",
  "frame-ancestors 'self' https://*.alparai.com https://*.vercel.app",
);
const embedHeaders = [
  { key: "Content-Security-Policy", value: embedCsp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
  },
  ...(isTest
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  allowedDevOrigins: [
    "alparai.com",
    "www.alparai.com",
    "*.alparai.com",
    "localhost:3003",
    "localhost",
    "127.0.0.1",
  ],
  env: {
    NEXT_TEST_AUTH_BYPASS:
      process.env.NODE_ENV === "test" && process.env.NEXT_TEST_AUTH_BYPASS === "true"
        ? "true"
        : "false",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@esbuild/linux-x64",
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  webpack(config) {
    config.resolve.alias["next-intl/config"] = path.resolve(__dirname, "./src/i18n/request.ts");
    return config;
  },
  images: {
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "ahmetrifatalbuz.com" },
      { protocol: "https", hostname: "*.ahmetrifatalbuz.com" },
    ],
  },
  experimental: {
    // Zero-Cost: Vercel serverless memory & build footprint optimization (Momentum & Venture)
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: "/:locale/incidents/:id/embed",
        headers: embedHeaders,
      },
      {
        source: "/incidents/:id/embed",
        headers: embedHeaders,
      },
      {
        source: "/(brand-assets|icons|images|favicons|brand|logo)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(favicon.ico|favicon.svg|manifest.webmanifest|robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/((?!.*embed).*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/manifest.webmanifest",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:locale/suggestions",
        destination: "/:locale/dilemmas",
        permanent: true,
      },
      {
        source: "/:locale/brand",
        destination: "/:locale/press-kit",
        permanent: true,
      },
      {
        source: "/:locale/brand/:slug*",
        destination: "/:locale/press-kit/:slug*",
        permanent: true,
      },
      {
        source: "/brand",
        destination: "/press-kit",
        permanent: true,
      },
      {
        source: "/brand/:slug*",
        destination: "/press-kit/:slug*",
        permanent: true,
      },
      {
        source: "/:locale/legal/impressum",
        destination: "/:locale/legal/imprint",
        permanent: true,
      },
      {
        source: "/legal/impressum",
        destination: "/legal/imprint",
        permanent: true,
      },
      {
        source: "/:locale/documentation",
        destination: "/:locale/api-docs",
        permanent: true,
      },
      {
        source: "/documentation",
        destination: "/api-docs",
        permanent: true,
      },
      {
        source: "/:locale/insights",
        destination: "/:locale/insights/open-vs-closed",
        permanent: true,
      },
      // Broken links discovered via 360° QA audit
      {
        source: "/:locale/scoreboard",
        destination: "/:locale/leaderboard",
        permanent: true,
      },
      {
        source: "/:locale/auth/login",
        destination: "/:locale/auth/signin",
        permanent: true,
      },
      {
        source: "/auth/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/:locale/login",
        destination: "/:locale/auth/signin",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/:locale/report",
        destination: "/:locale/submit",
        permanent: true,
      },
      {
        source: "/report",
        destination: "/submit",
        permanent: true,
      },
      {
        source: "/:locale/checkout",
        destination: "/:locale/pricing",
        permanent: true,
      },
      {
        source: "/checkout",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/:locale/cases/001",
        destination: "/:locale/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/cases/001",
        destination: "/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/:locale/community",
        destination: "/:locale/academy",
        permanent: true,
      },
      // Deprecated locale redirects (de, fr, ru -> en)
      {
        source: "/:oldLocale(de|fr|ru)",
        destination: "/en",
        permanent: true,
      },
      {
        source: "/:oldLocale(de|fr|ru)/:path*",
        destination: "/en/:path*",
        permanent: true,
      },
    ];
  },
};

import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  widenClientSandbox: true,
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});

