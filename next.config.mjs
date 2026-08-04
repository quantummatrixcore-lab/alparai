/**
 * Security headers applied to all routes.
 */
const isTest = process.env.IS_PLAYWRIGHT_TEST === "true";

const cspRules = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.google.com https://*.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: https://*.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.googleapis.com",
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
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isTest
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const embedCsp = csp.replace("frame-ancestors 'none'", "frame-ancestors *");
const embedHeaders = [
  { key: "Content-Security-Policy", value: embedCsp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isTest
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  webpack(config) {
    config.resolve.alias["next-intl/config"] = path.resolve(__dirname, "./src/i18n/request.ts");
    return config;
  },
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@phosphor-icons/react",
      "recharts",
      "date-fns",
    ],
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
        source: "/((?!.*embed).*)",
        headers: securityHeaders,
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
    ];
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
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
