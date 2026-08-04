const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      let mix = (crc ^ byte) & 1;
      crc = (crc >>> 1) ^ (mix ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(width, height) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // Raw pixel data: 180 lines, each line: filter byte 0 + 180 * 4 bytes RGBA
  // Brand color: Dark background #0A1622 (10, 22, 34) with brand cyan icon accent #06b6d4 (6, 182, 212) in center
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowStart = y * scanlineLength;
    rawData[rowStart] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      // Draw a subtle border and brand emblem
      const isCenter = Math.abs(x - width / 2) < 40 && Math.abs(y - height / 2) < 40;
      const isBorder = x < 4 || x >= width - 4 || y < 4 || y >= height - 4;
      if (isCenter) {
        rawData[idx] = 6; // R
        rawData[idx + 1] = 182; // G
        rawData[idx + 2] = 212; // B
        rawData[idx + 3] = 255; // A
      } else if (isBorder) {
        rawData[idx] = 14; // R
        rawData[idx + 1] = 165; // G
        rawData[idx + 2] = 233; // B
        rawData[idx + 3] = 255; // A
      } else {
        rawData[idx] = 10; // R
        rawData[idx + 1] = 22; // G
        rawData[idx + 2] = 34; // B
        rawData[idx + 3] = 255; // A
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressedData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuf = generatePng(180, 180);
const targetPath = path.join(__dirname, "..", "public", "icons", "apple-touch-icon.png");
fs.writeFileSync(targetPath, pngBuf);
console.log("Successfully generated 180x180 PNG at:", targetPath, "Size:", pngBuf.length, "bytes");
