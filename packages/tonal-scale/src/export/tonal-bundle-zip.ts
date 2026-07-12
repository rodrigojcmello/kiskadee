import { compareStrings } from '../deterministic-order.ts';

const UTF8_FLAG = 0x0800;
const STORE_METHOD = 0;
const DOS_TIME = 0;
const DOS_DATE = 0x0021;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const END_HEADER_SIZE = 22;
const MAX_UINT16 = 0xffff;
const MAX_UINT32 = 0xffffffff;

type EncodedEntry = {
  name: Uint8Array;
  contents: Uint8Array;
  crc32: number;
  localOffset: number;
};

/**
 * Builds a deterministic, uncompressed ZIP so the browser can download the
 * canonical directory-shaped artifact set as one complete file.
 */
export function createTonalBundleZip(files: ReadonlyMap<string, string>): Blob {
  const entries = [...files]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([path, contents]) => encodeEntry(path, contents));

  if (entries.length === 0 || entries.length > MAX_UINT16) {
    throw new Error('A tonal ZIP must contain between 1 and 65,535 files.');
  }

  const localParts: Uint8Array[] = [];
  let localOffset = 0;
  for (const entry of entries) {
    entry.localOffset = localOffset;
    const header = createLocalHeader(entry);
    localParts.push(header, entry.name, entry.contents);
    localOffset += header.length + entry.name.length + entry.contents.length;
  }

  const centralParts: Uint8Array[] = [];
  let centralSize = 0;
  for (const entry of entries) {
    const header = createCentralHeader(entry);
    centralParts.push(header, entry.name);
    centralSize += header.length + entry.name.length;
  }

  const end = createEndHeader(entries.length, centralSize, localOffset);
  const archive = concatenateParts([...localParts, ...centralParts, end]);
  return new Blob([archive.buffer], { type: 'application/zip' });
}

function encodeEntry(path: string, contents: string): EncodedEntry {
  if (
    path.length === 0 ||
    path.startsWith('/') ||
    path.includes('\\') ||
    path.split('/').some((segment) => segment.length === 0 || segment === '.' || segment === '..')
  ) {
    throw new Error(`Invalid tonal ZIP path: ${path}`);
  }

  const encoder = new TextEncoder();
  const name = encoder.encode(path);
  const bytes = encoder.encode(contents);
  if (name.length > MAX_UINT16 || bytes.length > MAX_UINT32) {
    throw new Error(`Tonal ZIP entry exceeds the classic ZIP size limit: ${path}`);
  }

  return {
    name,
    contents: bytes,
    crc32: calculateCrc32(bytes),
    localOffset: 0
  };
}

function concatenateParts(parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
  const totalSize = parts.reduce((sum, part) => sum + part.length, 0);
  if (totalSize > MAX_UINT32) {
    throw new Error('The tonal ZIP exceeds the classic ZIP size limit.');
  }

  const archive = new Uint8Array(totalSize);
  let offset = 0;
  for (const part of parts) {
    archive.set(part, offset);
    offset += part.length;
  }
  return archive;
}

function createLocalHeader(entry: EncodedEntry): Uint8Array {
  const header = new Uint8Array(LOCAL_HEADER_SIZE);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, UTF8_FLAG, true);
  view.setUint16(8, STORE_METHOD, true);
  view.setUint16(10, DOS_TIME, true);
  view.setUint16(12, DOS_DATE, true);
  view.setUint32(14, entry.crc32, true);
  view.setUint32(18, entry.contents.length, true);
  view.setUint32(22, entry.contents.length, true);
  view.setUint16(26, entry.name.length, true);
  view.setUint16(28, 0, true);
  return header;
}

function createCentralHeader(entry: EncodedEntry): Uint8Array {
  const header = new Uint8Array(CENTRAL_HEADER_SIZE);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, UTF8_FLAG, true);
  view.setUint16(10, STORE_METHOD, true);
  view.setUint16(12, DOS_TIME, true);
  view.setUint16(14, DOS_DATE, true);
  view.setUint32(16, entry.crc32, true);
  view.setUint32(20, entry.contents.length, true);
  view.setUint32(24, entry.contents.length, true);
  view.setUint16(28, entry.name.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, entry.localOffset, true);
  return header;
}

function createEndHeader(
  entryCount: number,
  centralSize: number,
  centralOffset: number
): Uint8Array {
  const header = new Uint8Array(END_HEADER_SIZE);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

const CRC32_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function calculateCrc32(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}
