import { crc32 } from 'node:zlib';
import { describe, expect, it } from 'vitest';

import { createTonalBundleZip } from './tonal-bundle-zip.ts';

describe('createTonalBundleZip', () => {
  it('creates one deterministic ZIP that preserves canonical directory paths', async () => {
    const files = new Map([
      ['tonal-system.json', '{"manifest":true}\n'],
      ['colors/b.blue.v1.json', '{"blue":true}\n'],
      ['tonal-system.source.json', '{"source":true}\n']
    ]);

    const first = new Uint8Array(await createTonalBundleZip(files).arrayBuffer());
    const second = new Uint8Array(
      await createTonalBundleZip(new Map([...files].reverse())).arrayBuffer()
    );
    const text = new TextDecoder().decode(first);
    const view = new DataView(first.buffer);
    const extracted = extractStoredZip(first);

    expect(first).toEqual(second);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(first.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(first.length - 14, true)).toBe(3);
    expect(text).toContain('colors/b.blue.v1.json');
    expect(text).toContain('tonal-system.source.json');
    expect(text).toContain('tonal-system.json');
    expect(extracted).toEqual(
      new Map([
        ['colors/b.blue.v1.json', '{"blue":true}\n'],
        ['tonal-system.json', '{"manifest":true}\n'],
        ['tonal-system.source.json', '{"source":true}\n']
      ])
    );
  });

  it.each([
    '../escape.json',
    '/absolute.json',
    'colors\\blue.json',
    'colors//blue.json'
  ])('rejects unsafe path %s', (path) => {
    expect(() => createTonalBundleZip(new Map([[path, '{}\n']]))).toThrow('Invalid tonal ZIP path');
  });
});

function extractStoredZip(bytes: Uint8Array): Map<string, string> {
  const extracted = new Map<string, string>();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;

  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true);
    const expectedCrc = view.getUint32(offset + 14, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const uncompressedSize = view.getUint32(offset + 22, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const contentsStart = nameStart + nameLength + extraLength;
    const contentsEnd = contentsStart + compressedSize;
    const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    const contents = bytes.subarray(contentsStart, contentsEnd);

    expect(method, `${name} compression method`).toBe(0);
    expect(compressedSize, `${name} stored size`).toBe(uncompressedSize);
    expect(contentsEnd, `${name} bounds`).toBeLessThanOrEqual(bytes.length);
    expect(crc32(contents) >>> 0, `${name} CRC32`).toBe(expectedCrc);
    extracted.set(name, decoder.decode(contents));
    offset = contentsEnd;
  }

  return extracted;
}
