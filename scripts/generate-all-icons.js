import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

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
