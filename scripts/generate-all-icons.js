const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `<svg viewBox="0 0 100 80" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  
  <g transform="translate(0, 0)">
    <!-- Vertical Center Line (Sword/Key Spine) -->
    <path d="M 50,10 V 70" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Left Shield Curve -->
    <path d="M 50,15 C 30,16 16,20 16,28 V 50 C 16,60 32,66 50,67" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Scales of Justice (Left Side) -->
    <path d="M 50,32 H 28" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 28,32 L 18,50 H 38 Z" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2" stroke-linejoin="round" />
    <path d="M 21,50 C 21,54 35,54 35,50 Z" fill="url(#alpar-accent-grad)" opacity="0.85" />

    <!-- Bottom crossbar (Hilt / Key teeth) -->
    <path d="M 38,60 H 62" stroke="url(#alpar-accent-grad)" stroke-width="3" stroke-linecap="round" />

    <!-- Circuits (Right Side) -->
    <path d="M 50,24 H 68 L 78,14 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="14" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />

    <path d="M 50,38 H 80" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="80" cy="38" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />

    <path d="M 50,52 H 68 L 78,62 H 82" fill="none" stroke="url(#alpar-accent-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="82" cy="62" r="3.5" fill="#FFFFFF" stroke="#00E5FF" stroke-width="1.5" filter="url(#alpar-neon-glow)" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Write favicon.svg
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('favicon.svg written');

// Also write it to src/app/icon.svg for Next.js App Router metadata
const appDir = path.join(__dirname, '..', 'src', 'app');
if (fs.existsSync(appDir)) {
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent);
  console.log('src/app/icon.svg written');
}

// 2. Generate PNGs
async function generatePngs() {
  const buffer = Buffer.from(svgContent);
  
  await sharp(buffer).resize(192, 192).png().toFile(path.join(iconsDir, 'android-chrome-192x192.png'));
  console.log('Generated 192x192');
  
  await sharp(buffer).resize(512, 512).png().toFile(path.join(iconsDir, 'android-chrome-512x512.png'));
  console.log('Generated 512x512');
  
  await sharp(buffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated 180x180');
  
  // Also create a small favicon.ico in src/app for browsers that demand it
  await sharp(buffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));
  if (fs.existsSync(appDir)) {
    await sharp(buffer).resize(32, 32).png().toFile(path.join(appDir, 'favicon.ico'));
  }
  console.log('Generated favicon.ico');
}

generatePngs().catch(console.error);
