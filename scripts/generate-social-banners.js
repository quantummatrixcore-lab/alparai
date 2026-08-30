import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const brandDir = path.join(publicDir, 'brand-assets');

if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });

// 1. LinkedIn Banner (1584 x 396) SVG Template
const linkedinBannerSvg = `<svg width="1584" height="396" viewBox="0 0 1584 396" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="1584" y2="396" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#050B14"/>
      <stop offset="50%" stop-color="#0A1628"/>
      <stop offset="100%" stop-color="#040810"/>
    </linearGradient>
    <linearGradient id="accent-cyan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <linearGradient id="shield-l" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="shield-r" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <filter id="glow-l" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1584" height="396" fill="url(#bg-grad)"/>

  <!-- Cyber Grid Pattern -->
  <g opacity="0.08" stroke="#38BDF8" stroke-width="1">
    <path d="M0 66 H1584 M0 132 H1584 M0 198 H1584 M0 264 H1584 M0 330 H1584" />
    <path d="M132 0 V396 M264 0 V396 M396 0 V396 M528 0 V396 M660 0 V396 M792 0 V396 M924 0 V396 M1056 0 V396 M1188 0 V396 M1320 0 V396 M1452 0 V396" />
  </g>

  <!-- Ambient Glow Orbs -->
  <circle cx="220" cy="198" r="180" fill="#4F46E5" opacity="0.18" filter="url(#glow-l)"/>
  <circle cx="1380" cy="198" r="160" fill="#0284C7" opacity="0.15" filter="url(#glow-l)"/>

  <!-- Brand Emblem (Left) -->
  <g transform="translate(130, 98) scale(2.0)">
    <path d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z" fill="url(#shield-l)" opacity="0.95"/>
    <path d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z" fill="url(#shield-r)" opacity="0.85"/>
    <path d="M 50,36 L 62,50 L 50,64 L 38,50 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z" fill="#38BDF8"/>
  </g>

  <!-- Typography & Brand Messaging -->
  <g transform="translate(380, 0)">
    <!-- Pill Badge -->
    <rect x="0" y="86" width="340" height="34" rx="17" fill="#38BDF8" fill-opacity="0.1" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="1.5"/>
    <text x="20" y="108" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2">GLOBAL AI SAFETY &amp; OBSERVATORY</text>

    <!-- Main Title -->
    <text x="0" y="180" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">ALPAR AI</text>
    <text x="260" y="180" fill="url(#accent-cyan)" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">· TRUST OS</text>

    <!-- Subtitle / Mission -->
    <text x="0" y="225" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" letter-spacing="0.2">
      Trust Infrastructure for AI Accountability — The Emergency Brake for Autonomous Systems
    </text>

    <!-- Proof Metrics Footer -->
    <g transform="translate(0, 268)">
      <circle cx="6" cy="6" r="5" fill="#22C55E"/>
      <text x="24" y="10" fill="#F1F5F9" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">2,880+ Documented AI Failures</text>

      <circle cx="290" cy="6" r="5" fill="#38BDF8"/>
      <text x="308" y="10" fill="#F1F5F9" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">Real-Time Incident Radar</text>

      <circle cx="530" cy="6" r="5" fill="#A855F7"/>
      <text x="548" y="10" fill="#F1F5F9" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">EU AI Act &amp; Red-Team Benchmarks</text>
    </g>
  </g>
</svg>`;

// 2. Twitter/X Banner (1500 x 500) SVG Template
const twitterBannerSvg = `<svg width="1500" height="500" viewBox="0 0 1500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tw-bg" x1="0" y1="0" x2="1500" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="50%" stop-color="#0B1528"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="tw-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#C084FC"/>
    </linearGradient>
    <linearGradient id="tw-shield-l" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="tw-shield-r" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>

  <rect width="1500" height="500" fill="url(#tw-bg)"/>

  <!-- Ambient Glow -->
  <circle cx="240" cy="250" r="220" fill="#4F46E5" opacity="0.2"/>
  <circle cx="1260" cy="250" r="200" fill="#0284C7" opacity="0.18"/>

  <!-- Brand Emblem (Left) -->
  <g transform="translate(130, 125) scale(2.5)">
    <path d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z" fill="url(#tw-shield-l)" opacity="0.95"/>
    <path d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z" fill="url(#tw-shield-r)" opacity="0.85"/>
    <path d="M 50,36 L 62,50 L 50,64 L 38,50 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z" fill="#38BDF8"/>
  </g>

  <!-- Typography -->
  <g transform="translate(440, 0)">
    <rect x="0" y="115" width="310" height="36" rx="18" fill="#38BDF8" fill-opacity="0.1" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="1.5"/>
    <text x="20" y="138" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="2">AI INCIDENT OBSERVATORY</text>

    <text x="0" y="225" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">ALPAR AI</text>
    <text x="320" y="225" fill="url(#tw-accent)" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">· TRUST OS</text>

    <text x="0" y="280" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500">
      Accountability &amp; Risk Intelligence for Autonomous Systems
    </text>

    <g transform="translate(0, 335)">
      <text x="0" y="0" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">⚡ 2,880+ Failures Cataloged</text>
      <text x="260" y="0" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">🛡️ Dual-Channel Scoring</text>
      <text x="500" y="0" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">🌐 alparai.com</text>
    </g>
  </g>
</svg>`;

// 3. OpenGraph Social Share Card (1200 x 630)
const ogImageSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og-bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0B1528"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="og-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <linearGradient id="og-shield-l" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="og-shield-r" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#og-bg)"/>

  <g transform="translate(100, 180) scale(2.7)">
    <path d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z" fill="url(#og-shield-l)" opacity="0.95"/>
    <path d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z" fill="url(#og-shield-r)" opacity="0.85"/>
    <path d="M 50,36 L 62,50 L 50,64 L 38,50 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z" fill="#38BDF8"/>
  </g>

  <g transform="translate(420, 0)">
    <rect x="0" y="160" width="310" height="34" rx="17" fill="#38BDF8" fill-opacity="0.1" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="1.5"/>
    <text x="20" y="182" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2">AI ACCOUNTABILITY PLATFORM</text>

    <text x="0" y="270" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">ALPAR AI</text>
    
    <text x="0" y="330" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500">
      Trust infrastructure for AI accountability.
    </text>
    <text x="0" y="365" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">
      Community-driven incident reporting and safety governance.
    </text>

    <g transform="translate(0, 440)">
      <rect x="0" y="0" width="220" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
      <text x="24" y="30" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">2,880+ Failures</text>

      <rect x="240" y="0" width="200" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
      <text x="264" y="30" fill="#22C55E" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">100% Verified</text>
    </g>
  </g>
</svg>`;

async function buildBanners() {
  // LinkedIn Banner
  await sharp(Buffer.from(linkedinBannerSvg)).png().toFile(path.join(brandDir, 'linkedin-cover-1584x396.png'));
  console.log('✓ Generated brand-assets/linkedin-cover-1584x396.png');

  // Twitter Banner
  await sharp(Buffer.from(twitterBannerSvg)).png().toFile(path.join(brandDir, 'twitter-banner-1500x500.png'));
  console.log('✓ Generated brand-assets/twitter-banner-1500x500.png');

  // OG Image (1200x630) in brandDir and public root
  await sharp(Buffer.from(ogImageSvg)).png().toFile(path.join(brandDir, 'og-image.png'));
  await sharp(Buffer.from(ogImageSvg)).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Generated og-image.png (1200x630) for Social Sharing');
}

buildBanners().catch(console.error);
