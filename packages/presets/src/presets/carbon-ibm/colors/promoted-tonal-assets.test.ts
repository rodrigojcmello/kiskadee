import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { primitiveColors } from '../carbon-ibm.colors.ts';

const root = new URL(
  '../../../../docs/design-systems/carbon-ibm/colors/generated/',
  import.meta.url
);
const promoted = {
  black: 'n.black.v1',
  blue: 'b.blue.v1',
  red: 'r.red.v1',
  green: 'g.green.v1',
  yellow: 'y.yellow.v1',
  orange: 'yr.orange.v1',
  purple: 'pb.indigo.v1'
} as const;
const read = (path: string) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const hash = (path: string) =>
  createHash('sha256')
    .update(readFileSync(new URL(path, root)))
    .digest('hex');

describe('Carbon tonal asset integrity', () => {
  it('preserves the signed source and generated files', () => {
    const manifest = read('tonal-system.json');
    expect(hash(manifest.source.path)).toBe(manifest.source.sha256);
    for (const asset of manifest.assets) {
      expect(hash(asset.path), asset.familyId).toBe(asset.sha256);
      expect(hash(asset.preset.path), asset.familyId).toBe(asset.preset.sha256);
    }
  });

  it.each(
    Object.entries(promoted)
  )('keeps %s identical to the selected generated family', (name, id) => {
    const asset = read(`colors/${id}.json`);
    const runtime = primitiveColors[name as keyof typeof promoted].v1;
    expect(runtime.scales).toEqual(asset.scales);
    expect(runtime.classification).toEqual(asset.classification);
    for (const theme of ['light', 'dark'] as const) {
      for (const reference of ['subtle', 'medium', 'vivid'] as const) {
        expect(runtime.functionalReferences[theme][reference]).toBe(
          asset.functionalReferences[theme][reference].tone
        );
      }
    }
  });
});
