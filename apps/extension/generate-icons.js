/* eslint-disable @typescript-eslint/no-require-imports, no-console */
// Generate placeholder icons for the Chrome extension
// Run: node generate-icons.js

const fs = require("fs");
const path = require("path");

const sizes = [16, 48, 128];
const iconDir = path.join(__dirname, "icons");

// Simple green circle icon as base64 PNG (minimal valid PNG)
// This creates a simple colored square as placeholder
function createPlaceholderPNG(size) {
  // Create a minimal valid PNG file
  // For production, replace with proper designed icons
  const canvas = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Green circle on transparent background
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 1;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist <= r) {
        canvas[idx] = 0; // R
        canvas[idx + 1] = 255; // G
        canvas[idx + 2] = 136; // B
        canvas[idx + 3] = 255; // A
      } else {
        canvas[idx + 3] = 0; // Transparent
      }
    }
  }

  // Return a simple 1x1 green PNG as placeholder
  // In production, use a proper image generation library
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );
}

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

for (const size of sizes) {
  const png = createPlaceholderPNG(size);
  const filePath = path.join(iconDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath}`);
}

console.log("Done. Replace these with proper designed icons for production.");
