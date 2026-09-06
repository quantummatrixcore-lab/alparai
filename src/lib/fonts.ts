import { Inter, Outfit, JetBrains_Mono } from "next/font/google";

/**
 * Optimized Font Configuration for AlparAI
 * - Self-hosted at build time via next/font (zero external render-blocking network requests)
 * - display: 'swap' prevents invisible text (FOIT)
 * - adjustFontFallback enables automatic zero-shift font fallbacks (minimizes CLS)
 * - Preloaded primary fonts for optimal FCP / LCP
 */

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
});

export const fontDisplay = Outfit({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
  preload: true,
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "sans-serif",
  ],
  adjustFontFallback: true,
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "monospace",
  ],
  adjustFontFallback: true,
});
