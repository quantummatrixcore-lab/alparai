const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const projectRoot = 'D:\\01_SaaS_Products\\Alparai';
const svgPath = path.join(projectRoot, 'src', 'app', 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Build a standalone HTML file that displays the SVG centered at exact 1:1 scale
const htmlPath = path.join(projectRoot, 'public', 'temp_icon_canvas.html');

function buildHtml(size) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
    svg { width: ${size}px; height: ${size}px; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
}

// Function to create a valid ICO file from a PNG buffer
function createIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width >= 256 ? 0 : width, 0);
  dirEntry.writeUInt8(height >= 256 ? 0 : height, 1);
  dirEntry.writeUInt8(0, 2); // Colors
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  dirEntry.writeUInt32LE(22, 12); // Offset (6 header + 16 dir entry = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function renderTarget(size, destPath) {
  fs.writeFileSync(htmlPath, buildHtml(size));
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  
  // Use Chrome headless with exact clip window
  const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 --window-size=${size + 40},${size + 80} --screenshot="${destPath}" "${fileUrl}"`;
  
  execSync(cmd, { stdio: 'ignore' });
  console.log(`✔ Rendered: ${size}x${size} -> ${path.relative(projectRoot, destPath)} (${fs.statSync(destPath).size} bytes)`);
}

async function main() {
  console.log('--- Generating Pixel-Perfect Monolithic Prismatic "A" Favicons & Icons ---');

  // 1. Render master PNGs
  const png32Path = path.join(projectRoot, 'public', 'favicon-32x32.png');
  const png16Path = path.join(projectRoot, 'public', 'favicon-16x16.png');
  const png180Path = path.join(projectRoot, 'public', 'apple-touch-icon.png');
  const png192Path = path.join(projectRoot, 'public', 'icon.png');
  const png512Path = path.join(projectRoot, 'public', 'icons', 'android-chrome-512x512.png');

  // Ensure directories exist
  [path.join(projectRoot, 'public', 'icons'), path.join(projectRoot, 'public', 'brand-assets')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  await renderTarget(32, png32Path);
  await renderTarget(16, png16Path);
  await renderTarget(180, png180Path);
  await renderTarget(192, png192Path);
  await renderTarget(512, png512Path);

  // Copy to all required locations
  const copies = [
    { src: png180Path, dest: path.join(projectRoot, 'public', 'apple-icon.png') },
    { src: png180Path, dest: path.join(projectRoot, 'public', 'apple-touch-icon-precomposed.png') },
    { src: png180Path, dest: path.join(projectRoot, 'public', 'icons', 'apple-touch-icon.png') },
    { src: png180Path, dest: path.join(projectRoot, 'src', 'app', 'apple-icon.png') },
    { src: png192Path, dest: path.join(projectRoot, 'src', 'app', 'icon.png') },
    { src: png192Path, dest: path.join(projectRoot, 'public', 'icons', 'android-chrome-192x192.png') },
  ];

  for (const c of copies) {
    fs.copyFileSync(c.src, c.dest);
    console.log(`✔ Copied -> ${path.relative(projectRoot, c.dest)}`);
  }

  // 2. Generate true valid ICO file from 32x32 PNG
  const png32Buffer = fs.readFileSync(png32Path);
  const icoBuffer = createIcoFromPng(png32Buffer, 32, 32);

  const icoPublic = path.join(projectRoot, 'public', 'favicon.ico');
  const icoApp = path.join(projectRoot, 'src', 'app', 'favicon.ico');

  fs.writeFileSync(icoPublic, icoBuffer);
  fs.writeFileSync(icoApp, icoBuffer);
  console.log(`✔ Generated valid ICO file -> public/favicon.ico & src/app/favicon.ico (${icoBuffer.length} bytes)`);

  // Clean up
  if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);

  console.log('✅ ALL ICONS & FAVICONS GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
