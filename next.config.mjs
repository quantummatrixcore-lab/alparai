/**
 * Security headers applied to all routes.
 */
const isTest =
  process.env.NODE_ENV === "test" &&
  process.env.IS_PLAYWRIGHT_TEST === "true" &&
  process.env.NEXT_TEST_AUTH_BYPASS === "true";



// NOTE: Content-Security-Policy (CSP) is managed dynamically in src/middleware.ts
// as the SINGLE SOURCE OF TRUTH (with scoped frame-ancestors for /embed routes).
const securityHeaders = [
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

const embedHeaders = [
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
import { createRequire } from "module";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const vaultPath = process.env.MATRIX_VAULT_PATH || "D:/00_MATRIX/vault_loader.js";
  if (fs.existsSync(vaultPath)) {
    const requireCjs = createRequire(import.meta.url);
    const loadVaultIntoMemory = requireCjs(vaultPath);
    loadVaultIntoMemory(__dirname);
  }
} catch {
  // Vault loader optional in non-local/CI environments
}

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
    ignoreBuildErrors: false,
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
  serverExternalPackages: ["pg", "pg-connection-string", "pgpass"],
  webpack(config, { isServer, nextRuntime, webpack }) {
    config.resolve.alias["next-intl/config"] = path.resolve(__dirname, "./src/i18n/request.ts");
    if (!isServer || nextRuntime === "edge") {
      if (webpack && webpack.NormalModuleReplacementPlugin) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, (resource) => {
            if (typeof resource.request === "string" && resource.request.startsWith("node:")) {
              resource.request = resource.request.replace(/^node:/, "");
            }
          })
        );
      }
      config.resolve.alias["node:fs"] = false;
      config.resolve.alias["node:net"] = false;
      config.resolve.alias["node:tls"] = false;
      config.resolve.alias["node:dns"] = false;
      config.resolve.alias["node:child_process"] = false;
      config.resolve.alias["node:sqlite"] = false;
      config.resolve.alias["node:path"] = false;
      config.resolve.alias["sqlite"] = false;
      config.resolve.alias["path"] = false;
      config.resolve.alias["node:crypto"] = false;
      config.resolve.alias["crypto"] = false;
      config.resolve.alias["pg"] = false;
      config.resolve.alias["pgpass"] = false;

      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        "pg-native": false,
        child_process: false,
        sqlite: false,
        path: false,
        pgpass: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.dehost.internal" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "ahmetrifatalbuz.com" },
      { protocol: "https", hostname: "*.ahmetrifatalbuz.com" },
    ],
  },
  experimental: {
    // Dinamik Ã‡oklu Ã‡ekirdek (Multi-Core) Optimizasyonu
    webpackBuildWorker: process.env.CI ? false : true,
    parallelServerCompiles: process.env.CI ? false : true,
    parallelServerBuildTraces: process.env.CI ? false : true,
    cpus: process.env.CI ? 1 : Math.max(1, (await import("os")).cpus().length - 1),
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
      // DEF-008: Canonical Edge Redirects for route aliases & legacy forks
      {
        source: "/:locale/case/001",
        destination: "/:locale/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/case/001",
        destination: "/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/:locale/incidents/case-001",
        destination: "/:locale/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/incidents/case-001",
        destination: "/cases/001-grok-passport",
        permanent: true,
      },
      {
        source: "/:locale/about/advisory_board",
        destination: "/:locale/about/advisory-board",
        permanent: true,
      },
      {
        source: "/about/advisory_board",
        destination: "/about/advisory-board",
        permanent: true,
      },
      {
        source: "/:locale/advisory_board",
        destination: "/:locale/about/advisory-board",
        permanent: true,
      },
      {
        source: "/advisory_board",
        destination: "/about/advisory-board",
        permanent: true,
      },
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
      // Broken links discovered via 360Â° QA audit
      {
        source: "/:locale/scoreboard",
        destination: "/:locale/leaderboard",
        permanent: true,
      },
      {
        source: "/:locale/auth/login",
        destination: "/:locale/auth/signin?mode=login",
        permanent: true,
      },
      {
        source: "/auth/login",
        destination: "/auth/signin?mode=login",
        permanent: true,
      },
      {
        source: "/:locale/login",
        destination: "/:locale/auth/signin?mode=login",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/signin?mode=login",
        permanent: true,
      },
      {
        source: "/:locale/register",
        destination: "/:locale/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/:locale/signup",
        destination: "/:locale/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/:locale/auth/register",
        destination: "/:locale/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/auth/register",
        destination: "/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/:locale/auth/signup",
        destination: "/:locale/auth/signin?mode=register",
        permanent: true,
      },
      {
        source: "/auth/signup",
        destination: "/auth/signin?mode=register",
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


const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);


