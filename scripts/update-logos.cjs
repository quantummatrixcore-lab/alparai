const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const logoSvgPath = path.join(publicDir, 'logo.svg');

if (!fs.existsSync(logoSvgPath)) {
  console.error("logo.svg not found");
  process.exit(1);
}

const svgBuffer = fs.readFileSync(logoSvgPath);

async function updateLogos() {
  try {
    // Generate new logo.png (1360x320)
    await sharp(svgBuffer)
      .resize(1360, 320)
      .png()
      .toFile(path.join(publicDir, 'logo.png'));
    console.log('logo.png updated');

    // Generate new logo-original.png
    await sharp(svgBuffer)
      .resize(1360, 320)
      .png()
      .toFile(path.join(publicDir, 'logo-original.png'));
    console.log('logo-original.png updated');

    // Update og-banner.png
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 10, g: 22, b: 34, alpha: 1 } // #0A1622
      }
    })
    .composite([{ input: await sharp(svgBuffer).resize(850, 200).toBuffer(), gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'og-banner.png'));
    console.log('og-banner.png updated');

  } catch (err) {
    console.error(err);
  }
}

updateLogos();
