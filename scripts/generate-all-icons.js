const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-shield-grad-1" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d946ef" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="logo-shield-grad-2" x1="80" y1="15" x2="20" y2="85" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="logo-glow-grad" x1="50" y1="35" x2="50" y2="65" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <filter id="logo-core-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <path d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z" fill="url(#logo-shield-grad-1)" fill-opacity="0.85" />
  <path d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z" fill="url(#logo-shield-grad-2)" fill-opacity="0.7" />
  <path d="M 50,18 L 26,29 V 49 C 26,65 40,76 50,81 V 18" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.15" stroke-linecap="round" />
  <path d="M 50,36 L 62,50 L 50,64 L 38,50 Z" fill="url(#logo-glow-grad)" filter="url(#logo-core-glow)" />
  <path d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z" fill="#ffffff" />
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// 1. Write favicon.svg
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('favicon.svg written');

// 2. Generate PNGs
async function generatePngs() {
  const buffer = Buffer.from(svgContent);
  
  await sharp(buffer).resize(192, 192).png().toFile(path.join(iconsDir, 'android-chrome-192x192.png'));
  console.log('Generated 192x192');
  
  await sharp(buffer).resize(512, 512).png().toFile(path.join(iconsDir, 'android-chrome-512x512.png'));
  console.log('Generated 512x512');
  
  await sharp(buffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated 180x180');
}

generatePngs().catch(console.error);
