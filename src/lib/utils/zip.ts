const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

function crc32(data: Uint8Array): number {
  let c = 0xffffffff >>> 0;
  for (let i = 0; i < data.length; i++) {
    const idx = data[i] as number;
    c = (crc32Table[(c ^ idx) & 0xff] as number) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeU32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

function writeU16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

export function buildZip(entries: ZipEntry[]): Uint8Array {
  const localHeaders: Buffer[] = [];
  const centralEntries: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf-8");
    const data = Buffer.from(entry.data);
    const crc = crc32(entry.data);
    const compSize = data.length;
    const uncompSize = data.length;

    const localHeader = Buffer.alloc(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer, localHeader.byteOffset, localHeader.byteLength);
    writeU32(lv, 0, 0x04034b50);
    writeU16(lv, 4, 20);
    writeU16(lv, 6, 0);
    writeU16(lv, 8, 0);
    writeU16(lv, 10, 0);
    writeU16(lv, 12, 0);
    writeU32(lv, 14, crc);
    writeU32(lv, 18, compSize);
    writeU32(lv, 22, uncompSize);
    writeU16(lv, 26, nameBytes.length);
    writeU16(lv, 28, 0);
    nameBytes.copy(localHeader, 30);

    localHeaders.push(localHeader, data);

    const centralHeader = Buffer.alloc(46 + nameBytes.length);
    const cv = new DataView(
      centralHeader.buffer,
      centralHeader.byteOffset,
      centralHeader.byteLength,
    );
    writeU32(cv, 0, 0x02014b50);
    writeU16(cv, 4, 20);
    writeU16(cv, 6, 20);
    writeU16(cv, 8, 0);
    writeU16(cv, 10, 0);
    writeU16(cv, 12, 0);
    writeU16(cv, 14, 0);
    writeU32(cv, 16, crc);
    writeU32(cv, 20, compSize);
    writeU32(cv, 24, uncompSize);
    writeU16(cv, 28, nameBytes.length);
    writeU16(cv, 30, 0);
    writeU16(cv, 32, 0);
    writeU16(cv, 34, 0);
    writeU16(cv, 36, 0);
    writeU32(cv, 38, 0);
    writeU32(cv, 42, offset);
    nameBytes.copy(centralHeader, 46);

    centralEntries.push(centralHeader);
    offset += 30 + nameBytes.length + data.length;
  }

  const centralSize = centralEntries.reduce((acc, b) => acc + b.length, 0);
  const centralOffset = offset;

  const eocd = Buffer.alloc(22);
  const ev = new DataView(eocd.buffer, eocd.byteOffset, eocd.byteLength);
  writeU32(ev, 0, 0x06054b50);
  writeU16(ev, 4, 0);
  writeU16(ev, 6, 0);
  writeU16(ev, 8, entries.length);
  writeU16(ev, 10, entries.length);
  writeU32(ev, 12, centralSize);
  writeU32(ev, 16, centralOffset);
  writeU16(ev, 20, 0);

  return Buffer.concat([...localHeaders, ...centralEntries, eocd]);
}
