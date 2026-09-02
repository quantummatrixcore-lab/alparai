const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\01_SaaS_Products\\Alparai';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlPath = path.join(projectRoot, 'public', 'render_icon.html');
const svgPath = path.join(projectRoot, 'public', 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Build an HTML wrapper that renders the SVG perfectly centered without margins
const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
    svg { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

fs.writeFileSync(htmlPath, html);

const sizes = [
    { size: 512, dest: path.join(projectRoot, 'public', 'icons', 'android-chrome-512x512.png') },
    { size: 192, dest: path.join(projectRoot, 'public', 'icons', 'android-chrome-192x192.png') },
    { size: 180, dest: path.join(projectRoot, 'public', 'icons', 'apple-touch-icon.png') },
    { size: 180, dest: path.join(projectRoot, 'public', 'apple-touch-icon.png') },
    { size: 180, dest: path.join(projectRoot, 'public', 'apple-touch-icon-precomposed.png') },
    { size: 180, dest: path.join(projectRoot, 'public', 'apple-icon.png') },
    { size: 192, dest: path.join(projectRoot, 'public', 'icon.png') },
    { size: 192, dest: path.join(projectRoot, 'src', 'app', 'icon.png') },
    { size: 180, dest: path.join(projectRoot, 'src', 'app', 'apple-icon.png') }
];

console.log('Rendering all icon PNGs from master monolithic prismatic A favicon.svg...');

for (const item of sizes) {
    const cmd = `"${chromePath}" --headless=new --disable-gpu --screenshot="${item.dest}" --window-size=${item.size},${item.size} "file:///${htmlPath.replace(/\\/g, '/')}"`;
    try {
        execSync(cmd, { stdio: 'ignore' });
        console.log(`✔ Rendered: ${item.size}x${item.size} -> ${path.relative(projectRoot, item.dest)}`);
    } catch (e) {
        console.error(`❌ Failed: ${item.dest}`, e.message);
    }
}

// Clean up temporary HTML
if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);

// Render LinkedIn Banner
const bannerSvg = path.join(projectRoot, 'public', 'brand', 'linkedin_company_banner_v4.svg');
const bannerDest = path.join(projectRoot, 'public', 'linkedin_banner_1128x191.png');
const bannerCmd = `"${chromePath}" --headless=new --disable-gpu --screenshot="${bannerDest}" --window-size=1128,191 "file:///${bannerSvg.replace(/\\/g, '/')}"`;
try {
    execSync(bannerCmd, { stdio: 'ignore' });
    console.log('✔ Rendered: LinkedIn Banner (1128x191) -> public/linkedin_banner_1128x191.png');
} catch (e) {
    console.error('❌ Failed rendering banner:', e.message);
}

console.log('Done rendering all PNG icons and banners!');
