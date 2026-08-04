import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BRAND_ASSETS_DIR = path.resolve("public/brand-assets");

// Ensure the directory exists
if (!fs.existsSync(BRAND_ASSETS_DIR)) {
  fs.mkdirSync(BRAND_ASSETS_DIR, { recursive: true });
}

// 1. Dark Theme SVG Logo
const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80" role="img" aria-label="ALPAR AI">
  <defs>
    <!-- Accent Gradient: Emerald to Cyan -->
    <linearGradient id="alpar-accent-grad" x1="16" y1="10" x2="82" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00FF88" />
      <stop offset="100%" stop-color="#00E5FF" />
    </linearGradient>

    <!-- Glowing Core Filter -->
    <filter id="alpar-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Wordmark text gradient (White -> Slate) -->
    <linearGradient id="alpar-text-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
  </defs>

  <!-- Left: Reimagined Shield, Scales & Tech Circuit Icon -->
  <g transform="translate(10, 0)">
    <!-- Vertical Center Line (Sword/Key Spine) -->
    <path d="M 50,10 V 70" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Left Shield Curve -->
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Scales of Justice (Left Side) -->
    <!-- Scale Hanger Beam -->
    <path d="M 50,32 H 28" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <!-- Scale Pan Strings / Triangle -->
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2" stroke-linejoin="round" />
    <!-- Scale Pan Base Bowl (Filled) -->
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="url(#alpar-accent-grad)" opacity="0.85" />

    <!-- Bottom crossbar (Hilt / Key teeth) -->
    <path d="M 38,60 H 62" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Circuits (Right Side) -->
    <!-- Top Circuit Line -->
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />

    <!-- Middle Circuit Line -->
    <path d="M 50,38 H 80" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />

    <!-- Bottom Circuit Line -->
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />
  </g>

  <!-- Right: Wordmark -->
  <g transform="translate(110, 0)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="900" letter-spacing="-0.5">
    <text x="0" y="48" font-size="34" fill="url(#alpar-text-grad)">ALPAR</text>
    <text x="122" y="48" font-size="34" font-weight="500" fill="#00FF88" letter-spacing="1">AI</text>
  </g>
</svg>`;

// 2. Light Theme SVG Logo
const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80" role="img" aria-label="ALPAR AI">
  <defs>
    <!-- Accent Gradient: Deep Blue to Cyan -->
    <linearGradient id="alpar-accent-grad-light" x1="16" y1="10" x2="82" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0052D4" />
      <stop offset="100%" stop-color="#00C9FF" />
    </linearGradient>

    <!-- Glowing Core Filter -->
    <filter id="alpar-neon-glow-light" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Left: Reimagined Shield, Scales & Tech Circuit Icon -->
  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="url(#alpar-accent-grad-light)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="url(#alpar-accent-grad-light)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="url(#alpar-accent-grad-light)" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="url(#alpar-accent-grad-light)" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="url(#alpar-accent-grad-light)" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="url(#alpar-accent-grad-light)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="url(#alpar-accent-grad-light)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" stroke="#00C9FF" stroke-width="1.5" filter="url(#alpar-neon-glow-light)" />
    <path d="M 50,38 H 80" fill="none" stroke="url(#alpar-accent-grad-light)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" stroke="#00C9FF" stroke-width="1.5" filter="url(#alpar-neon-glow-light)" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="url(#alpar-accent-grad-light)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" stroke="#00C9FF" stroke-width="1.5" filter="url(#alpar-neon-glow-light)" />
  </g>

  <!-- Right: Wordmark (Dark slate color for light backgrounds) -->
  <g transform="translate(110, 0)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="900" letter-spacing="-0.5">
    <text x="0" y="48" font-size="34" fill="#0B1622">ALPAR</text>
    <text x="122" y="48" font-size="34" font-weight="500" fill="#0052D4" letter-spacing="1">AI</text>
  </g>
</svg>`;

// 3. Monochrome White Logo
const logoWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80" role="img" aria-label="ALPAR AI">
  <!-- Left: Reimagined Shield, Scales & Tech Circuit Icon -->
  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="#FFFFFF" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" />
    <path d="M 50,38 H 80" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Right: Wordmark -->
  <g transform="translate(110, 0)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="900" letter-spacing="-0.5">
    <text x="0" y="48" font-size="34" fill="#FFFFFF">ALPAR</text>
    <text x="122" y="48" font-size="34" font-weight="500" fill="#FFFFFF" letter-spacing="1">AI</text>
  </g>
</svg>`;

// 4. Monochrome Black Logo
const logoBlackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80" role="img" aria-label="ALPAR AI">
  <!-- Left: Reimagined Shield, Scales & Tech Circuit Icon -->
  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="#000000" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#000000" />
    <path d="M 50,38 H 80" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#000000" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#000000" />
  </g>

  <!-- Right: Wordmark -->
  <g transform="translate(110, 0)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-weight="900" letter-spacing="-0.5">
    <text x="0" y="48" font-size="34" fill="#000000">ALPAR</text>
    <text x="122" y="48" font-size="34" font-weight="500" fill="#000000" letter-spacing="1">AI</text>
  </g>
</svg>`;

// 5. Icon Primary SVG
const iconPrimarySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80" role="img" aria-label="ALPAR AI Icon">
  <defs>
    <!-- Accent Gradient: Emerald to Cyan -->
    <linearGradient id="alpar-accent-grad" x1="16" y1="10" x2="82" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00FF88" />
      <stop offset="100%" stop-color="#00E5FF" />
    </linearGradient>

    <!-- Glowing Core Filter -->
    <filter id="alpar-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="url(#alpar-accent-grad)" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />
    <path d="M 50,38 H 80" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />
  </g>
</svg>`;

// 6. Icon White SVG
const iconWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80" role="img" aria-label="ALPAR AI Icon">
  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="#FFFFFF" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" />
    <path d="M 50,38 H 80" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" />
  </g>
</svg>`;

// 7. Icon Black SVG
const iconBlackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80" role="img" aria-label="ALPAR AI Icon">
  <g transform="translate(10, 0)">
    <path d="M 50,10 V 70" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,32 H 28" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="#000000" opacity="0.85" />
    <path d="M 38,60 H 62" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#000000" />
    <path d="M 50,38 H 80" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#000000" />
    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#000000" />
  </g>
</svg>`;

// 8. Brand Guidelines markdown
const guidelinesMarkdown = `# ALPAR AI — Brand Assets Guidelines

ALPAR AI is the trust infrastructure for AI accountability. Use these brand assets to represent ALPAR AI in reports, presentations, and website links.

## Color Palette

- **Primary Accent (Emerald Green)**: \`#00FF88\` (Representing safety, compliance readiness, active rating status).
- **Secondary Accent (Cyber Cyan)**: \`#00E5FF\` (Representing AI, precision audit tools, connectivity).
- **Dark Background (Deep Slate)**: \`#0A1622\` / \`#0B1622\`.
- **Text & Details (Off-White)**: \`#F8FAFC\` / \`#CBD5E1\`.

## Asset Types

- **logo-dark-theme.svg**: Primary logotype for dark backgrounds.
- **logo-light-theme.svg**: Primary logotype for light backgrounds.
- **logo-monochrome-white.svg**: Flat white logo for dark brand styling.
- **logo-monochrome-black.svg**: Flat black logo for print layouts.
- **icon-primary.svg**: Just the neural-shield icon mark in full color.
- **icon-white.svg**: White icon mark.
- **icon-black.svg**: Black icon mark.

Thank you for respecting our brand representation guidelines.
`;

// Write the files to the assets folder
console.log("Writing brand assets...");
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "logo-dark-theme.svg"), logoDarkSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "logo-light-theme.svg"), logoLightSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "logo-monochrome-white.svg"), logoWhiteSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "logo-monochrome-black.svg"), logoBlackSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "icon-primary.svg"), iconPrimarySvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "icon-white.svg"), iconWhiteSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "icon-black.svg"), iconBlackSvg);
fs.writeFileSync(path.join(BRAND_ASSETS_DIR, "README.md"), guidelinesMarkdown);

// Also overwrite the public/logo.svg to match our beautiful updated logo!
fs.writeFileSync(path.resolve("public/logo.svg"), logoDarkSvg);
console.log("Assets created. Overwrote public/logo.svg.");

// Create ZIP file using Powershell command
try {
  console.log("Creating ZIP archive...");
  execSync(
    'powershell -Command "Compress-Archive -Path \'public/brand-assets/*\' -DestinationPath \'public/brand-assets.zip\' -Force"'
  );
  console.log("Zip archive created successfully at public/brand-assets.zip");
} catch (err) {
  console.error("Failed to create ZIP using Powershell. Attempting fallback.", err.message);
}
