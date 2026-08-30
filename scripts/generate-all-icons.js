import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgContent = `<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Left Facet Gradient: Violet to Indigo -->
    <linearGradient id="alpar-shield-left" x1="20" y1="12" x2="50" y2="88" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="50%" stop-color="#9333EA" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Right Facet Gradient: Cyan to Deep Navy -->
    <linearGradient id="alpar-shield-right" x1="80" y1="12" x2="50" y2="88" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22D3EE" />
      <stop offset="60%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Central Diamond Core Gradient -->
    <linearGradient id="alpar-core-grad" x1="50" y1="36" x2="50" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>

    <!-- Glowing Core Filter -->
    <filter id="alpar-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Left Shield Facet (Defense & Authority) -->
  <path
    d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z"
    fill="url(#alpar-shield-left)"
    fill-opacity="0.95"
  />

  <!-- Right Shield Facet (Intelligence & Speed) -->
  <path
    d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z"
    fill="url(#alpar-shield-right)"
    fill-opacity="0.85"
  />

  <!-- High-Tech Inner Perimeter Accent -->
  <path
    d="M 50,18 L 26,29 V 49 C 26,65 40,76 50,81 V 18"
    stroke="#FFFFFF"
    stroke-width="1.5"
    stroke-opacity="0.25"
    stroke-linecap="round"
  />
  <path
    d="M 50,18 L 74,29 V 49 C 74,65 60,76 50,81"
    stroke="#22D3EE"
    stroke-width="1.2"
    stroke-opacity="0.3"
    stroke-linecap="round"
  />

  <!-- Glowing Quantum Core Diamond -->
  <path
    d="M 50,36 L 62,50 L 50,64 L 38,50 Z"
    fill="url(#alpar-core-grad)"
    filter="url(#alpar-glow)"
    opacity="0.95"
  />

  <!-- Central Starburst Spark of Truth -->
  <path
    d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z"
    fill="#FFFFFF"
  />
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
const brandAssetsDir = path.join(publicDir, 'brand-assets');
const iconsDir = path.join(publicDir, 'icons');
const appDir = path.join(__dirname, '..', 'src', 'app');

[publicDir, brandAssetsDir, iconsDir, appDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Write unified SVGs
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(brandAssetsDir, 'icon-primary.svg'), svgContent);
console.log('✓ Master SVGs synchronized (public/favicon.svg, src/app/icon.svg, brand-assets/icon-primary.svg)');

// 2. Generate PNGs and ICOs
async function generatePngs() {
  const buffer = Buffer.from(svgContent);
  
  await sharp(buffer).resize(192, 192).png().toFile(path.join(iconsDir, 'android-chrome-192x192.png'));
  console.log('✓ Generated android-chrome-192x192.png');
  
  await sharp(buffer).resize(512, 512).png().toFile(path.join(iconsDir, 'android-chrome-512x512.png'));
  console.log('✓ Generated android-chrome-512x512.png');
  
  await sharp(buffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  await sharp(buffer).resize(800, 800).png().toFile(path.join(brandAssetsDir, 'alparai-avatar-800x800.png'));
  console.log('✓ Generated alparai-avatar-800x800.png for LinkedIn & Socials');
  
  // Create 32x32 and 48x48 favicons
  await sharp(buffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(buffer).resize(32, 32).png().toFile(path.join(appDir, 'favicon.ico'));
  console.log('✓ Generated favicon.ico in public/ and src/app/');
}

generatePngs().catch(console.error);
