const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const logoSvgPath = path.join(publicDir, 'logo.svg');
const svgBuffer = fs.readFileSync(logoSvgPath);

async function updateOg() {
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 22, b: 34, alpha: 1 } // #0A1622
    }
  })
  .composite([{ input: await sharp(svgBuffer).resize(850, 200).toBuffer(), gravity: 'center' }])
  .jpeg()
  .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('og-image.jpg updated');
}
updateOg();
